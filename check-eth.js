const fs = require("fs");
const crypto = require("crypto");
const ethers = require("ethers");
const { entropy } = require("entropy-string");
const sqlite3 = require("sqlite3").verbose();
const readline = require("readline");
const axios = require("axios");
const moment = require("moment");

let qty = 0;
let wallet = 0;
const filename = "ethereum.tsv";
const thresholdEntropy = 3.5;
const test = true;
let stop = false;
let lastHistoryId = null;

// Function to save private key info
function savePrivateKeyInfo(db, privateKey, ethAddress) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM private_keys WHERE private_key = ?`,
      [privateKey],
      async (err, row) => {
        if (err) {
          console.error(err.message);
          reject(err);
        } else if (row) {
          // console.log("Private key already exists, not saving again.");
          resolve("already_exists");
        } else {
          let balance = await axios.get(
            `https://api.etherscan.io/api?module=account&action=balance&address=0x${ethAddress}&tag=latest&apikey=76VMFFR14EDPY7EP1C24CWY684MTKVZV4G`
          );
          db.run(
            `INSERT INTO private_keys (private_key, address, balance, time) VALUES (?, ?, ?, ?)`,
            [
              privateKey,
              ethAddress,
              balance.data.result,
              moment().format("YY-MM-DD HH:mm:ss"),
            ],
            function (err) {
              if (err) {
                console.error(err.message);
                reject(err);
              } else {
                resolve({ balance: balance.data.result });
              }
            }
          );
        }
      }
    );
  });
}

// Function to check the randomness quality of a private key
function isRandomKeySecure(privateKeyBytes) {
  const hist = new Array(256).fill(0);
  privateKeyBytes.forEach((byte) => {
    hist[byte]++;
  });

  const total = privateKeyBytes.length;
  let entropyValue = 0;
  hist.forEach((count) => {
    if (count > 0) {
      const p = count / total;
      entropyValue -= p * Math.log2(p);
    }
  });

  // console.log(`Entropy of the private key: ${entropyValue}`);
  return entropyValue > thresholdEntropy;
}

// Worker thread function to generate and check private key
function generateAndCheckKey() {
  if (test == true && Math.random() < 0.001) {
    return `91616f0b346a3e751542bb58e8416f3223309530499ea15640a7ad4f07d2c2d1`; //0xA0d002Ed504c4AeDA13f3C4A06fb34c9BEf59fAD
  }
  while (true) {
    const privateKeyBytes = crypto.randomBytes(32);
    if (isRandomKeySecure(privateKeyBytes)) {
      return privateKeyBytes.toString("hex");
    }
  }
}

// Main function
async function main(sender) {
  stop = false;
  // Initialize the database
  await initializeDatabase("eth1.db", filename);

  const db = new sqlite3.Database("eth1.db", (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log("Connected to the eth.db database.");
    }
  });

  //create history process
  if(qty === 0) {
    db.run(
      `INSERT INTO history (start_at) VALUES (?)`,
      [moment().format("YY-MM-DD HH:mm:ss")],
      function (err) {
        if (err) {
          console.error(err.message);
        } else {
          console.log(`A new row has been inserted`);
          lastHistoryId = this.lastID;
        }
      }
    );
  }
  let messages = "";
  while (true && !stop) {
    // Create an array to hold the promises
    const promises = [];
    // Generate and check keys in parallel
    for (let i = 0; i < 100; i++) {
      promises.push(
        (async () => {
          const privateKeyBytes = generateAndCheckKey();
          const wallet = new ethers.Wallet(privateKeyBytes);
          const ethAddress = wallet.address.toLowerCase();
          // Check an Ethereum address
          await checkEthAddress(ethAddress, privateKeyBytes, db, sender);
          //   console.log(qty, `Generated Address: ${ethAddress}`);
          messages += `<p>${qty} Generated Address: ${ethAddress}</p>`;
          if (qty % 100 === 0) {
            sender.send("log", { message: messages, qty: qty });
            messages = "";
          }
          qty += 1;
        })()
      );
    }

    // Wait for all promises to resolve
    await Promise.all(promises);
  }

  //update history when process end
  if (lastHistoryId) {
    db.run(
      `UPDATE history SET total = ?, wallet = ?, token = ?, end_at = ? WHERE id = ?`,
      [
        qty,
        wallet,
        null,
        moment().format("YY-MM-DD HH:mm:ss"),
        lastHistoryId,
      ],
      function (err) {
        if (err) {
          console.error(err.message);
        } else {
          console.log(
            `Row with id ${lastHistoryId} has been updated`
          );
        }
      }
    );
  }

  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
  });
}

// Initialize SQLite database
function initializeDatabase(databaseFile, tsvFile) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(databaseFile)) {
      console.log("Database already exists, not reading TSV file.");
      resolve();
      return;
    }

    const db = new sqlite3.Database(databaseFile, (err) => {
      if (err) {
        console.error(err.message);
        reject(err);
      }
    });

    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS addresses (address TEXT)`, (err) => {
        if (err) {
          console.error(err.message);
          reject(err);
        }
      });

      const lineReader = readline.createInterface({
        input: fs.createReadStream(tsvFile),
      });

      lineReader.on("line", function (line) {
        const [address, value] = line.split("\t");
        db.run(`INSERT INTO addresses(address) VALUES(?)`, [address], (err) => {
          if (err) {
            console.error(err.message);
            reject(err);
          }
        });
      });

      lineReader.on("close", function () {
        db.close((err) => {
          if (err) {
            console.error(err.message);
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  });
}

// Check if an Ethereum address exists in the SQLite database
async function checkEthAddress(ethAddress, privateKeyBytes, db, sender) {
  ethAddress = ethAddress.replace(/^0x/, "");

  try {
    const row = await new Promise((resolve, reject) => {
      db.get(
        `SELECT address FROM addresses WHERE address = ?`,
        [ethAddress],
        (err, row) => {
          if (err) {
            console.error(err.message);
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });

    if (row) {
      const response = await savePrivateKeyInfo(
        db,
        privateKeyBytes,
        ethAddress,
      );
      if (response?.balance) {
        wallet += 1;
        sender.send("log", { message: `Success: ${ethAddress} ${response?.balance} ${privateKeyBytes}` });
        sender.send("balance", { balance: response?.balance });
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

function stopMain() {
  stop = true;
}
function renewMain() {
  stopMain();
  qty = 0;
  lastHistoryId = null;
  wallet = 0;
}

module.exports = {
  main,
  stopMain,
  renewMain,
};
