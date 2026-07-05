# miniprogram-websocket

标准 [WebSocket API](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket) 的小程序 polyfill，提供与 Web 浏览器一致的接口实现。

**[English](https://github.com/baoxingzeng/miniprogram-websocket/blob/main/README.en.md)**

## 小程序支持

| 微信  | 支付宝 | 百度  | 字节跳动 |  QQ   | 快手  | 京东  | 小红书 |
| :---: | :----: | :---: | :------: | :---: | :---: | :---: | :----: |
|   ✔   |   ✔    |   ✔   |    ✔     |   ✔   |   ✔   |   ✔   |   ✔    |

> 在 Chrome、Firefox、Edge、Safari 等浏览器环境中，导出的模块将直接返回浏览器原生实现，无额外性能开销。

## 安装

```bash
npm install miniprogram-websocket
```

## 自动导入

> **推荐**：小程序环境中没有 `globalThis`，无法像浏览器一样直接使用全局的 `WebSocket`，因此非常推荐配合 [unplugin-auto-import](https://www.npmjs.com/package/unplugin-auto-import) 等导入插件，免去手动写 `import` 语句的麻烦。

如果你使用 unplugin-auto-import，可以这样配置：

```javascript
// 仅参考
AutoImport({
    // 其他配置

    imports: [
        // 其他导入

        {
            "miniprogram-websocket": [
                "WebSocket",
                "Blob", // 可选导入
            ],
        },

        // 其他导入
    ],

    // 其他配置
});
```

> **UniApp 开发者注意**：如果你的项目是通过 HBuilderX 基于 Vue 2 旧模板创建的，可能需要安装较低版本的 unplugin-auto-import（如 `0.16.7`）以兼容 CMD 模块格式。
>
> **支付宝小程序开发者注意**：支付宝官方将 `globalThis`、`window`、`document`、`WebSocket` 等浏览器内置对象名列为保留字，不应作为导入标识符使用，否则可能导致框架无法正常访问导入内容。如遇导入异常，可通过导入重命名规避，例如 `import { WebSocket as myWebSocket } from "..."`。

## 快速开始

```javascript
import { WebSocket, Blob } from "miniprogram-websocket";

// 创建 WebSocket 连接
const socket = new WebSocket("wss://example.com:8080");

// 设置 binaryType 为 "arraybuffer"（默认为 "blob"）
socket.binaryType = "arraybuffer";

// 监听连接建立
socket.addEventListener("open", () => {
  console.log("连接已建立");

  // 发送文本
  socket.send("Hello Server!");

  // 发送 Blob
  const blob = new Blob(["Hello via Blob"]);
  socket.send(blob);
});

// 监听消息
socket.addEventListener("message", (event) => {
  if (event.data instanceof ArrayBuffer) {
    // 二进制数据
    const view = new DataView(event.data);
    console.log(view.getInt32(0));
  } else if (event.data instanceof Blob) {
    // Blob 数据
    event.data.text().then(console.log);
  } else {
    // 文本数据
    console.log(event.data);
  }
});

// 监听连接关闭
socket.addEventListener("close", (event) => {
  console.log(`连接已关闭: code=${event.code}, reason=${event.reason}`);
});

// 监听连接错误
socket.addEventListener("error", () => {
  console.error("连接错误");
});
```

### 使用事件属性

除了 `addEventListener`，也可以使用 on-event 属性注册事件处理函数：

```javascript
socket.onopen = () => socket.send("Hello!");
socket.onmessage = (event) => console.log(event.data);
socket.onclose = (event) => console.log(event.code);
socket.onerror = (event) => console.error("error");
```

## 自定义 connectSocket

若需在未适配的小程序平台中使用，可通过 `setConnectSocketFunc` 注册平台原生的连接方法：

```javascript
import { WebSocket, setConnectSocketFunc } from "miniprogram-websocket";

// 传入平台原生的 connectSocket 函数
setConnectSocketFunc(wx.connectSocket);

const socket = new WebSocket("wss://example.com:8080");
```

## API

### WebSocket 构造函数

```typescript
new WebSocket(url: string, protocols?: string | string[])
```

| 参数      | 类型                 | 说明                 |
| --------- | -------------------- | -------------------- |
| url       | `string`             | WebSocket 服务器地址 |
| protocols | `string \| string[]` | 子协议               |

### 属性

| 属性           | 类型                        | 读写  | 说明                                               |
| -------------- | --------------------------- | ----- | -------------------------------------------------- |
| binaryType     | `"blob"` \| `"arraybuffer"` | 读/写 | 二进制数据的类型，默认值为 `"blob"`                |
| bufferedAmount | `number`                    | 只读  | 缓冲队列中待发送的字节数（暂不支持，始终返回 `0`） |
| extensions     | `string`                    | 只读  | 服务端选择的扩展（暂不支持，始终返回 `""`）        |
| protocol       | `string`                    | 只读  | 服务端选择的子协议                                 |
| readyState     | `number`                    | 只读  | 连接状态                                           |
| url            | `string`                    | 只读  | 连接地址                                           |

**readyState 常量：**

| 常量                   | 值  | 说明     |
| ---------------------- | --- | -------- |
| `WebSocket.CONNECTING` | `0` | 正在连接 |
| `WebSocket.OPEN`       | `1` | 已连接   |
| `WebSocket.CLOSING`    | `2` | 正在关闭 |
| `WebSocket.CLOSED`     | `3` | 已关闭   |

### 方法

| 方法                               | 说明                               |
| ---------------------------------- | ---------------------------------- |
| `send(data)`                       | 发送数据                           |
| `close()`                          | 关闭连接                           |
| `close(code)`                      | 关闭连接，同时指定状态码           |
| `close(code, reason)`              | 关闭连接，同时指定状态码与关闭原因 |

**send 参数类型：** `string | ArrayBufferLike | Blob | ArrayBufferView`

> `send()` 通过特征检测（feature detection）判断 Blob 类型，任何符合规范的 Blob 实现均可传入。为获得最佳兼容性，建议使用本库导出的 `Blob`。

### 事件

| 事件      | 类型           | 说明     |
| --------- | -------------- | -------- |
| `open`    | `Event`        | 连接建立 |
| `message` | `MessageEvent` | 收到消息 |
| `close`   | `CloseEvent`   | 连接关闭 |
| `error`   | `Event`        | 连接错误 |

## 导出说明

本库导出的 `WebSocket` 和 `Blob` 在支持原生实现的运行环境中会直接返回原生对象；以 `P` 为后缀的 `WebSocketP` 和 `BlobP` 则为 polyfill 实现，始终使用本库提供的版本。

> 注意：`WebSocketP` 仅适用于小程序环境，浏览器中不可用。

```javascript
import { WebSocket, WebSocketP, Blob, BlobP } from "miniprogram-websocket";
```

## License

MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
