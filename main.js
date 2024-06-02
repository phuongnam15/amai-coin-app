const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const path = require("path");
const url = require("url");

function createWindow() {
  mainWindow = new BrowserWindow({
    title: "",
    width: 1000,
    height: 700,
    webPreferences: {
      contextIsolation: true, //tách biệt mt của renderer và main hoặc preload, tránh tác động từ renderer đến main hoặc preload
      nodeIntegration: false, //ngăn hoặc cho phép sử dụng require() của nodejs để tải các module, dù là false thì preload.js vần dùng đc require() do khác biệt với các renderer
      //   sandbox: false,
      //   preload: path.join(__dirname, `preload.js`),
    },
  });

  mainWindow.webContents.openDevTools();

  const startUrl = url.format({
    pathname: path.join(__dirname, "./my-app/build/index.html"),
    protocol: "file",
  });

  mainWindow.loadURL("http://localhost:3000/");
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

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
