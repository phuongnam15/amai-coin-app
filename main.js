const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const path = require("path");
const url = require("url");
const { main, stopMain } = require("./check-eth.js");
const { machineIdSync } = require("node-machine-id");
const crypto = require("crypto");
const sqlite3 = require("sqlite3").verbose();

const styleAlert = {
  position: "fixed",
  padding: "2px 0",
  width: "100%",
  color: "white",
  textAlign: "center",
  fontSize: "0.85rem",
};

function createWindow() {
  mainWindow = new BrowserWindow({
    title: "",
    width: 1000,
    height: 700,
    webPreferences: {
      contextIsolation: true, //tách biệt mt của renderer và main hoặc preload, tránh tác động từ renderer đến main hoặc preload
      nodeIntegration: false, //ngăn hoặc cho phép sử dụng require() của nodejs để tải các module, dù là false thì preload.js vần dùng đc require() do khác biệt với các renderer
      sandbox: false,
      preload: path.join(__dirname, `preload.js`),
    },
  });

  const startUrl = url.format({
    pathname: path.join(__dirname, "./my-app/build/index.html"),
    protocol: "file",
  });

  mainWindow.loadURL("http://localhost:3000");
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

const uniqueId = machineIdSync();
const userKey = crypto.createHash("sha256").update(uniqueId).digest("hex");
const salt = "amai_scanner";

ipcMain.on("start", async (event, arg) => {
  const sender = event.sender;
  await main(sender);
});
ipcMain.on("stop", async (event, arg) => {
  stopMain();
  event.sender.send("log", { message: "STOPPED" });
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
  try{
    const response = await handleCheckPrivateKey();
    event.sender.send("check:active-key", { response });
  }catch(err) {
    console.error("Error:", err);
  }
});
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
  db.get(
    `SELECT user_key FROM keys WHERE user_key = ?`,
    [key],
    function (err, row) {
      if (err) {
        console.error(err.message);
      } else if (row) {
        console.log("key already exists in the database.");
      } else {
        db.run(`INSERT INTO keys (user_key) VALUES (?)`, [key], function (err) {
          if (err) {
            console.error(err.message);
          } else {
            console.log(`A new key has been inserted`);
          }
        });
      }
    }
  );
}
function createTableAndStoreKey(key) {
  db.run(
    `CREATE TABLE IF NOT EXISTS keys (
      active_key TEXT NOT NULL,
      user_key TEXT NOT NULL
  )`,
    (err) => {
      if (err) {
        console.error(err.message);
      } else {
        checkAndInsertKey(key);
      }
    }
  );
}
const db = new sqlite3.Database("./eth1.db", (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected to the eth1.db database.");
    createTableAndStoreKey(userKey);
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
