require("dotenv").config();
const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const path = require("path");
const url = require("url");
const { main, stopMain, renewMain } = require("./check-eth.js");
const { machineIdSync } = require("node-machine-id");
const crypto = require("crypto");
const sqlite3 = require("sqlite3").verbose();
const os = require("os");
const uniqueId = machineIdSync();
const userKey = crypto.createHash("sha256").update(uniqueId).digest("hex");
const salt = "amai_scanner";
const isDev = process.env.NODE_ENV === "development";
const pathAppDb = isDev ? "./app.db" : path.resolve(__dirname, '..', 'app.db');
const db = new sqlite3.Database(pathAppDb, async (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected to the app.db database.");

    await checkAndSaveIdMachine();
    await checkThreadsCPUAndSave();
    await createTableAndStoreKey();
  }
});

function createWindow() {
  mainWindow = new BrowserWindow({
    title: "",
    width: 1200,
    height: 700,
    webPreferences: {
      contextIsolation: true, //tách biệt mt của renderer và main hoặc preload, tránh tác động từ renderer đến main hoặc preload
      nodeIntegration: false, //ngăn hoặc cho phép sử dụng require() của nodejs để tải các module, dù là false thì preload.js vần dùng đc require() do khác biệt với các renderer
      sandbox: false,
      preload: path.join(__dirname, `preload.js`),
    },
  });

  const startUrl = isDev
    ? "http://localhost:3000"
    : `file://${path.join(__dirname, "./my-app/build/index.html")}`;


  mainWindow.loadURL(startUrl);

  Menu.setApplicationMenu(null);
}

app.whenReady().then(() => {
  createWindow();

  mainWindow.on("closed", () => {
    //free up memmory when X window
    mainWindow = null;
  });

  app.on("activate", () => {
    //event activate window from oping app in dock or taskbar of macOS, make sure that always have a window open
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

ipcMain.on("start", async (event, arg) => {
  try {
    const sender = event.sender;

    const numThreads = await getNumThreads();

    await main(sender, numThreads);
  } catch (err) {
    event.sender.send("start", { message: err.message });
  }
});
ipcMain.on("stop", async (event, arg) => {
  stopMain();
});
ipcMain.on("renew", async (event, arg) => {
  renewMain();
});
ipcMain.on("get-key", async (event, arg) => {
  event.sender.send("get-key", { userKey });
});
ipcMain.on("active:key", async (event, arg) => {
  try {
    const response = await handleActivePrivateKey(arg.activeKey);
    event.sender.send("active:key", { response });
  } catch (error) {
    console.error("Error:", error);
  }
});
ipcMain.on("check:active-key", async (event, arg) => {
  try {
    const response = await handleCheckPrivateKey();
    event.sender.send("check:active-key", { response });
  } catch (err) {
    console.error("Error:", err);
  }
});
ipcMain.on("get-wallet", async (event, arg) => {
  const response = await handleGetWallet();
  event.sender.send("get-wallet", { response });
});
ipcMain.on("get-history", async (event, arg) => {
  const response = await handleGetHistory();
  event.sender.send("get-history", { response });
});
ipcMain.on("config", async (event, arg) => {
  const response = await saveConfig(arg);
  event.sender.send("config", { response });
});
ipcMain.on("recommend:threads", async (event, arg) => {
  const threads = os.cpus().length;
  event.sender.send("recommend:threads", { threads: threads });
});
ipcMain.on("get:threads", async (event, arg) => {
  const threads = await getNumThreads();
  event.sender.send("get:threads", { threads: threads });
});

const getNumThreads = async () => {
  return new Promise((resolve, reject) => {
    db.get("SELECT threads FROM config", [], (err, row) => {
      if (err) {
        console.error(err.message);
        reject(err);
      } else {
        if (row) {
          resolve(row.threads);
        } else {
          resolve(os.cpus().length);
        }
      }
    });
  });
};
function saveConfig(config) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM config", [], (err, row) => {
      if (err) {
        console.error(err.message);
        reject(err);
      } else {
        if (row) {
          // If a record exists, update it
          db.run(
            `UPDATE config SET threads = ?, telegram_id = ?`,
            [config.threads, config.telegram_id],
            function (err) {
              if (err) {
                console.error(err.message);
                reject(err);
              } else {
                resolve("OK");
              }
            }
          );
        } else {
          // If no record exists, insert a new one
          db.run(
            `INSERT INTO config (threads, telegram_id) VALUES (?, ?)`,
            [config.threads, config.telegram_id],
            function (err) {
              if (err) {
                console.error(err.message);
                reject(err);
              } else {
                resolve("OK");
              }
            }
          );
        }
      }
    });
  });
}
function handleGetWallet() {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM private_keys", [], (err, rows) => {
      if (err) {
        reject(err);
      } else if (rows) {
        resolve(rows);
      } else {
        resolve([]);
      }
    });
  });
}
function handleGetHistory() {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM history", [], (err, rows) => {
      if (err) {
        reject(err);
      } else if (rows) {
        resolve(rows);
      } else {
        resolve([]);
      }
    });
  });
}
function handleCheckPrivateKey() {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT active_key, user_key FROM keys WHERE user_key = ?`,
      [userKey],
      (err, row) => {
        if (err) {
          console.error(err.message);
          reject(err);
        } else if (row) {
          const hashedUserKey = crypto
            .createHash("sha256")
            .update(userKey + salt)
            .digest("hex");
          if (row.active_key !== null && row.active_key === hashedUserKey) {
            resolve("OK");
          }
        }
        resolve("");
      }
    );
  });
}
function handleActivePrivateKey(activeKey) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT user_key FROM keys WHERE user_key = ?`,
      [userKey],
      (err, row) => {
        if (err) {
          console.error(err.message);
          reject(err);
        } else if (row) {
          const hashedUserKey = crypto
            .createHash("sha256")
            .update(userKey + salt)
            .digest("hex");
          if (hashedUserKey === activeKey) {
            db.run(
              `UPDATE keys SET active_key = ? WHERE user_key = ?`,
              [activeKey, userKey],
              function (err) {
                if (err) {
                  console.error(err.message);
                  reject(err);
                } else {
                  console.log(`A new active key has been updated`);
                  resolve("OK");
                }
              }
            );
          } else {
            resolve("Invalid Active Key");
          }
        } else {
          resolve("User Key Not Found");
        }
      }
    );
  });
}
function checkAndInsertKey(key) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT user_key FROM keys WHERE user_key = ?`,
      [key],
      function (err, row) {
        if (err) {
          console.error(err.message);
          reject();
        } else if (row) {
          console.log("key already exists in the database.");
          resolve();
        } else {
          db.run(
            `INSERT INTO keys (user_key) VALUES (?)`,
            [key],
            function (err) {
              if (err) {
                console.error(err.message);
              } else {
                console.log(`A new key has been inserted`);
              }
            }
          );
          resolve();
        }
      }
    );
  });
}
function createTableAndStoreKey() {
  return new Promise((resolve, reject) => {
    db.run(
      `CREATE TABLE IF NOT EXISTS keys (
        active_key TEXT NULL,
        user_key TEXT NOT NULL
    )`,
      async (err) => {
        if (err) {
          console.error(err.message);
          reject();
        } else {
          await checkAndInsertKey(userKey);
        }
      }
    );
  });
}
function checkThreadsCPUAndSave() {
  return new Promise((resolve, reject) => {
    const threads = Math.round(os.cpus().length / 2);

    db.run(
      "CREATE TABLE IF NOT EXISTS config (id INTEGER PRIMARY KEY AUTOINCREMENT, threads TEXT, telegram_id TEXT)",
      [],
      (createErr) => {
        if (createErr) {
          console.error(createErr.message);
          reject();
        } else {
          db.get("SELECT * FROM config", [], (err, row) => {
            if (err) {
              console.error(err.message);
              reject();
            } else {
              if (!row) {
                db.run(
                  "INSERT INTO config (threads) VALUES (?)",
                  [threads],
                  function (err) {
                    if (err) {
                      console.error(err.message);
                    } else {
                      console.log(`Threads has been inserted`);
                    }
                  }
                );
              }
              resolve();
            }
          });
        }
      }
    );
  });
}
function checkAndSaveIdMachine() {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='id_machine'`,
      (err, row) => {
        if (err) {
          console.error(err.message);
          reject();
        } else if (!row) {
          db.run(`CREATE TABLE id_machine (id TEXT)`, (err) => {
            if (err) {
              console.error(err.message);
            } else {
              db.run(
                `INSERT INTO id_machine(id) VALUES(?)`,
                uniqueId,
                (err) => {
                  if (err) {
                    console.error(err.message);
                  }
                }
              );
            }
          });
          resolve();
        } else {
          db.get(`SELECT id FROM id_machine`, (err, row) => {
            if (err) {
              console.error(err.message);
              reject();
            } else if (row.id !== uniqueId) {
              db.serialize(() => {
                db.run(`DROP TABLE IF EXISTS config`);
                db.run(`DROP TABLE IF EXISTS history`);
                db.run(`DROP TABLE IF EXISTS keys`);
                db.run(`DROP TABLE IF EXISTS private_keys`);
                db.run(`UPDATE id_machine SET id = ?`, uniqueId, (err) => {
                  if (err) {
                    console.error(err.message);
                  }
                });
              });
              resolve();
            }
          });
        }
      }
    );
  });
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    stopMain();

    db.close((err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log("Close database");
      }
    });

    app.quit();
  }
});
