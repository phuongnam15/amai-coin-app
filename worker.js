const { parentPort } = require("worker_threads");
const sqlite3 = require("sqlite3").verbose();
const ethers = require("ethers");
const crypto = require("crypto");
const axios = require("axios");
const moment = require("moment");

const thresholdEntropy = 3.5;
const test = true;
let successMessage = "";
let balance = 0;
let totalWallet = 0;
const db = new sqlite3.Database("btc.db", (err) => {
  if (err) {
    console.error(err.message);
  }
});

parentPort.on("message", async (data) => {
  if (data.type === "start") {
    let workerValue = data.startValue;
    let workerMessage = [];

    const promises = [];
    while (true) {
      for (let i = 0; i < 50; i++) {
        promises.push(
          (async () => {
            const privateKeyBytes = generateAndCheckKey();
            const wallet = new ethers.Wallet(privateKeyBytes);
            const ethAddress = wallet.address.toLowerCase();
            await checkEthAddress(ethAddress, privateKeyBytes, db);

            workerMessage.push(`Generated Address: ${ethAddress}`);
            workerValue += 1;
          })()
        );
      }

      await Promise.all(promises);
      parentPort.postMessage({
        type: "done",
        value: workerValue,
        messages: workerMessage,
        message: successMessage,
        balance: balance,
        totalWallet: totalWallet,
      });
      workerMessage = [];
      workerValue = 0;
      successMessage = "";
      totalWallet = 0;
      balance = 0;
    }
  } else if (data.type === "terminate") {
    parentPort.close();
    workerMessage = [];
    workerValue = 0;
    successMessage = "";
    totalWallet = 0;
    balance = 0;
  }
});

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
          resolve();
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
async function checkEthAddress(ethAddress, privateKeyBytes, db) {
  ethAddress = ethAddress.replace(/^0x/, "");
  const ethDb = new sqlite3.Database("eth1.db", (err) => {
    if (err) {
      console.error(err.message);
    }
  });
  try {
    const row = await new Promise((resolve, reject) => {
      ethDb.get(
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
        ethAddress
      );
      if (response?.balance) {
        totalWallet += 1;
        successMessage = `Success: ${ethAddress} ${response?.balance} ${privateKeyBytes}`;
        balance += parseInt(response?.balance);
      }
    }
  } catch (error) {
    console.error("Error:", error);
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
