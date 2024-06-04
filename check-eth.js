const fs = require("fs");
const crypto = require("crypto");
const ethers = require("ethers");
const { entropy } = require("entropy-string");
const sqlite3 = require("sqlite3").verbose();
const readline = require("readline");
const axios = require("axios");

let qty = 0;
const filename = "ethereum.tsv";
const outputFile = "private_keys.txt";
const thresholdEntropy = 3.5;
const test = true;
let stop = false;
let message = "";

// Function to save private key info
function savePrivateKeyInfo(outputFile, privateKey, ethAddress, sender) {
  const content = fs.readFileSync(outputFile, "utf8");
  // Check if the private key is already in the output file
  if (content.includes(privateKey)) {
    // console.log("Private key already saved, not saving again.");
    return "already_exists";
  } else {
    // If the private key is not in the output file, save it
    const data = `Private Key: ${privateKey}, Address: ${ethAddress}\n`;
    fs.appendFileSync(outputFile, data);
    message = "Private key have been saved successfully";
    sender.send("log", { message });
    return "done";
  }
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
  if (test == true && Math.random() < 0.01) {
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
  await initializeDatabase("eth1.db", filename, sender);

  const db = new sqlite3.Database("eth1.db", (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log("Connected to the eth.db database.");
    }
  });

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
          message = `${qty} Generated Address: ${ethAddress}`;
          sender.send("log", { message });
          qty += 1;
        })()
      );
    }

    // Wait for all promises to resolve
    await Promise.all(promises);
  }

  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
  });
}

// Initialize SQLite database
function initializeDatabase(databaseFile, tsvFile, sender) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(databaseFile)) {
      console.log("Database already exists, not reading TSV file.");
      message = "Database already exists, not reading TSV file.";
      sender.send("log", { message });
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

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.get(
        `SELECT address FROM addresses WHERE address = ?`,
        [ethAddress],
        (err, row) => {
          if (err) {
            console.error(err.message);
            reject(err);
          }
          if (row) {
            // console.log(`Success: ${ethAddress}`);
            const response = savePrivateKeyInfo(
              outputFile,
              privateKeyBytes,
              ethAddress,
              sender
            );
            console.log(response);
            if (response === "done") {
              message = `Success: ${ethAddress}`;
              sender.send("log", { message });
            }
          }
          resolve();
        }
      );
    });
  });
}

function stopMain() {
  stop = true;
}

module.exports = {
  main,
  stopMain,
};
