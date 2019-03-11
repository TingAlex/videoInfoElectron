> 下面我通过从零搭建一个简易的 videoInfo app 来进行 electron 的入门学习。

1. 首先建立一个 electron 空项目。
### 实现步骤
1. 新建文件夹 emptyElectron，使用 VSCode 打开此文件夹
2. 初始化 npm 项目
```
C:\Users\Ting\Downloads\test\emptyElectron>npm init
```
之后按照提示一路回车结束配置
3. 安装 electron
```
C:\Users\Ting\Downloads\test\emptyElectron>cnpm install --save electron
```
4. 在根目录新建 `index.js` 文件，这个是 electron 的执行入口
5. 在 `index.js` 文件中，我们写的是 node.js 的代码，node.js 目前只支持普通语法的 js，还没有支持 ES6 语法，所以我们引入项目都是像这样的：
```javascript
const electron = require('electron');
```
6. 在 `index.js` 文件中加入以下代码：
```javascript
const electron = require('electron');

// app 负责整个项目的执行流程，BrowserWindow 是用来打开一个新窗口的
const { app, BrowserWindow} = electron;

let mainWindow;

// 监听 到 ready 信号后执行函数内部代码
app.on('ready', () => {
  mainWindow = new BrowserWindow({});
  mainWindow.loadURL(`file://${__dirname}/index.html`);
});
```
7. 在根目录新建 `index.html` 文件，加入以下内容用于测试：
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    <h1>You got here</h1>
</body>
</html>
``` 
7. 在 `package.json` 中设置 `scripts` 字段：
```
  "scripts": {
    "electron": "electron ."
  },
```
8. 在命令行中执行
```
C:\Users\Ting\Downloads\test\emptyElectron>npm run electron
```
![videoInfo 项目测试页面](https://upload-images.jianshu.io/upload_images/10453247-b374b2b7f8bfcb6a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
成功！
9. 接下来创建选择与提交视频的表单项。注意：要想只打开视频类型的文件，只要这样的标签属性就好了：`  <input type="file" accept="video/*" />` 。现在我们在 body 标签中加入如下内容，debugger 是为了让我们在前端页面中调试，查看到底获取到了哪些信息。
```
    <h1>Video Info</h1>
    <form action="">
      <div>
        <label for="">Select a video</label>
        <input type="file" accept="video/*" />
      </div>
      <button type="submit">Get Info</button>
    </form>
    <h1 id="result"></h1>
    <script>
      document.querySelector('form').addEventListener('submit', event => {
        event.preventDefault();
        debugger;
      });
    </script>
```
再次运行并打开调试窗口
![调试页面](https://upload-images.jianshu.io/upload_images/10453247-01ccb71181ff2d3d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
由此可见我们得到的数据结构。
接下来安装 fluent-ffmpeg，ffmpeg 是对视频进行处理的一个软件，fluent-ffmpeg 是 npm 插件，帮助更容易地用 js 去控制 ffmpeg。
```
C:\Users\Ting\Downloads\test\emptyElectron>cnpm install --save fluent-ffmpeg
```
至于 ffmpeg 就自己去安装吧，不管了（win 与 mac 安装上有些出入）
10. 接下来是进行信息交互。我们前端将视频的本机地址发送到后端，后端接收后获取文件的时间长度信息，然后再将信息传送回前端。信息的传输通过 ipc （进程间通信）完成。
![electron 进程间通信](https://upload-images.jianshu.io/upload_images/10453247-2d8d19eb1a10e886.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

electron 的前端也可以使用 node.js 的语法。于是在 `index.html` 文件中，我们将 `script` 标签中的内容修改为如下：
```javascript
      // 在 electron 项目中，前端也可以执行 node.js 的代码
      const electron = require('electron');
      // 前端使用 ipcRender 实现前后端信息交互
      const { ipcRenderer } = electron;
      // 我们使用 ipc 在前端页面与 electron 后端进行沟通
      document.querySelector('form').addEventListener('submit', event => {
        event.preventDefault();
        const { path } = document.querySelector('input').files[0];
        ipcRenderer.send('video:submit', path);
        console.log('sent');
      });
      // 接收后端返回的信息
      ipcRenderer.on('video:metadata', (event, duration) => {
        document.querySelector(
          '#result'
        ).innerHTML = `Video is ${duration} seconds.`;
      });
```
11. 我们在 `index.js` 中添加以下代码：
```javascript
// 引入视频处理插件
const ffmpeg = require('fluent-ffmpeg');
// 新增 ipcMain 是后端向前端发送信息用的
const { app, BrowserWindow, ipcMain } = electron;
// 接收前端数据
ipcMain.on('video:submit', (event, path) => {
  ffmpeg.ffprobe(path, (err, metadata) => {
    // 将数据发送回前端
    mainWindow.webContents.send('video:metadata', metadata.format.duration);
  });
});
```
12. 测试一下，成功！
![测试运行](https://upload-images.jianshu.io/upload_images/10453247-fca91bc9ec0e596b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)