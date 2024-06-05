const { parentPort, workerData } = require('worker_threads');
const { ethers } = require('ethers');
const sqlite3 = require('sqlite3');
const moment = require('moment');
const { generateAndCheckKey, checkEthAddress } = require('./utils'); // Giả sử bạn có các hàm này trong utils.js

async function runTask(workerData) {
  const { dbFile, senderData, batchSize } = workerData;
  const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
      console.error(err.message);
    }
  });

  let messages = "";
  let qty = 0;

  for (let i = 0; i < batchSize; i++) {
    const privateKeyBytes = generateAndCheckKey();
    const wallet = new ethers.Wallet(privateKeyBytes);
    const ethAddress = wallet.address.toLowerCase();
    await checkEthAddress(ethAddress, privateKeyBytes, db, senderData);
    messages += `<p>${qty} Generated Address: ${ethAddress}</p>`;
    qty += 1;
  }

  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
  });

  parentPort.postMessage({ messages, qty });
}

runTask(workerData);
