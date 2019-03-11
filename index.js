const electron = require('electron');
// 引入视频处理插件
const ffmpeg = require('fluent-ffmpeg');

// app 负责整个项目的执行流程，BrowserWindow 是用来打开一个新窗口的
// 新增 ipcMain 是后端向前端发送信息用的
const { app, BrowserWindow, ipcMain } = electron;

let mainWindow;

// 监听 到 ready 信号后执行函数内部代码
app.on('ready', () => {
  mainWindow = new BrowserWindow({});
  mainWindow.loadURL(`file://${__dirname}/index.html`);
});

// 接收前端数据
ipcMain.on('video:submit', (event, path) => {
  ffmpeg.ffprobe(path, (err, metadata) => {
    // 将数据发送回前端
    console.log(metadata.format.duration);
    mainWindow.webContents.send('video:metadata', metadata.format.duration);
  });
});
