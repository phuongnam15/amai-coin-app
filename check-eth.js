const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const readline = require("readline");
const moment = require("moment");
const { Worker } = require("worker_threads");
const path = require("path");

let qty = 0;
let wallet = 0;
const filename = "ethereum.tsv";
let lastHistoryId = null;
let workers = [];
const db = new sqlite3.Database("btc.db", (err) => {
  if (err) console.log(err);
});

// Main function
async function main(sender, numThreads) {
  try {
    // Initialize the database
    // await initializeDatabase("eth1.db", filename);

    //create history process
    if (qty === 0) {
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
    let messages;
    for (let i = 0; i < numThreads; i++) {
      const worker = new Worker(path.join(__dirname, "worker.js"));
      workers.push(worker);

      worker.on("message", (message) => {
        if (message.type === "done") {
          qty += message.value;
          messages = message.messages;
          wallet += message.totalWallet;
          if (qty % 50 === 0) {
            sender.send("log", {
              messages: messages,
              qty: qty,
              message: message.message,
              balance: message.balance,
            });
            messages = "";
          }
        }
      });
      worker.on("error", (err) => {
        sender.send("start", { messages: err.message });
        console.error(err);
      });
      worker.on("exit", (code) => {
        if (code !== 0) {
          console.error(`Worker stopped with exit code ${code}`);
        }
      });
      worker.postMessage({ type: "start", startValue: 0 });
    }
  } catch (err) {
    sender.send("start", { messages: err.message });
  }
}
function saveHistory(qty, lastHistoryId, wallet) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE history SET total = ?, wallet = ?, token = ?, end_at = ? WHERE id = ?`,
      [qty, wallet, null, moment().format("YY-MM-DD HH:mm:ss"), lastHistoryId],
      function (err) {
        if (err) {
          console.error(err.message);
          reject(err);
        } else {
          console.log(`Row with id ${lastHistoryId} has been updated`);
          resolve();
        }
      }
    );
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

function stopMain() {
  workers.forEach((w) => w.postMessage({ type: "terminate" }));
}
async function renewMain() {
  stopMain();
  await saveHistory(qty, lastHistoryId, wallet, db);
  qty = 0;
  lastHistoryId = null;
  wallet = 0;
  workers = [];
}

module.exports = {
  main,
  stopMain,
  renewMain,
};
