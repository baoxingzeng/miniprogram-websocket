# miniprogram-websocket

A [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) polyfill for mini programs, providing an interface consistent with standard web browsers.

## Platform Support

| WeChat | Alipay | Baidu | ByteDance |  QQ   | Kwai  |  JD   | RedNote |
| :----: | :----: | :---: | :-------: | :---: | :---: | :---: | :-----: |
|   ✔    |   ✔    |   ✔   |     ✔     |   ✔   |   ✔   |   ✔   |    ✔    |

> In browser environments such as Chrome, Firefox, Edge, and Safari, exported modules return native implementations directly with no additional overhead.

## Installation

```bash
npm install miniprogram-websocket
```

## Auto-import

> **Recommended**: Mini programs lack `globalThis`, so the global `WebSocket` is unavailable as in browsers. Using import plugins like [unplugin-auto-import](https://www.npmjs.com/package/unplugin-auto-import) eliminates the need for manual `import` statements.

Example configuration for unplugin-auto-import:

```javascript
// For reference only
AutoImport({
    // Other configurations

    imports: [
        // Other imports

        {
            "miniprogram-websocket": [
                "WebSocket",
                "Blob", // Optional
            ],
        },

        // Other imports
    ],

    // Other configurations
});
```

> **UniApp developers**: If your project was created via HBuilderX from an older Vue 2 template, you may need to install a lower version of unplugin-auto-import (e.g., `0.16.7`) for CMD module compatibility.
>
> **Alipay Mini Program developers**: Alipay reserves `globalThis`, `window`, `document`, `WebSocket`, and other browser built-in names as restricted identifiers. Using them as import identifiers may prevent the framework from accessing the imported content. If you encounter import issues, use import aliasing as a workaround, e.g., `import { WebSocket as myWebSocket } from "..."`.

## Quick Start

```javascript
import { WebSocket, Blob } from "miniprogram-websocket";

// Create a WebSocket connection
const socket = new WebSocket("wss://example.com:8080");

// Set binaryType to "arraybuffer" (default is "blob")
socket.binaryType = "arraybuffer";

// Listen for connection open
socket.addEventListener("open", () => {
    console.log("Connection established");

    // Send text
    socket.send("Hello Server!");

    // Send a Blob
    const blob = new Blob(["Hello via Blob"]);
    socket.send(blob);
});

// Listen for messages
socket.addEventListener("message", (event) => {
    if (event.data instanceof ArrayBuffer) {
        // Binary data
        const view = new DataView(event.data);
        console.log(view.getInt32(0));
    } else if (event.data instanceof Blob) {
        // Blob data
        event.data.text().then(console.log);
    } else {
        // Text data
        console.log(event.data);
    }
});

// Listen for connection close
socket.addEventListener("close", (event) => {
    console.log(`Connection closed: code=${event.code}, reason=${event.reason}`);
});

// Listen for errors
socket.addEventListener("error", () => {
    console.error("Connection error");
});
```

### Using Event Handler Properties

In addition to `addEventListener`, you can also use on-event properties:

```javascript
socket.onopen = () => socket.send("Hello!");
socket.onmessage = (event) => console.log(event.data);
socket.onclose = (event) => console.log(event.code);
socket.onerror = (event) => console.error("error");
```

## Custom connectSocket

To use this library on a platform not yet supported, register the native connection method via `setConnectSocketFunc`:

```javascript
import { WebSocket, setConnectSocketFunc } from "miniprogram-websocket";

// Pass in the platform's native connectSocket function
setConnectSocketFunc(wx.connectSocket);

const socket = new WebSocket("wss://example.com:8080");
```

## API

### WebSocket Constructor

```typescript
new WebSocket(url: string, protocols?: string | string[])
```

| Parameter | Type                 | Description          |
| --------- | -------------------- | -------------------- |
| url       | `string`             | WebSocket server URL |
| protocols | `string \| string[]` | Sub-protocol(s)      |

### Properties

| Property       | Type                        | Access     | Description                                                        |
| -------------- | --------------------------- | ---------- | ------------------------------------------------------------------ |
| binaryType     | `"blob"` \| `"arraybuffer"` | Read/Write | Binary data type, defaults to `"blob"`                             |
| bufferedAmount | `number`                    | Read-only  | Bytes pending in the send buffer (not yet supported, always `0`)   |
| extensions     | `string`                    | Read-only  | Extensions selected by the server (not yet supported, always `""`) |
| protocol       | `string`                    | Read-only  | Sub-protocol selected by the server                                |
| readyState     | `number`                    | Read-only  | Connection state                                                   |
| url            | `string`                    | Read-only  | Connection URL                                                     |

**readyState Constants:**

| Constant               | Value | Description |
| ---------------------- | ----- | ----------- |
| `WebSocket.CONNECTING` | `0`   | Connecting  |
| `WebSocket.OPEN`       | `1`   | Open        |
| `WebSocket.CLOSING`    | `2`   | Closing     |
| `WebSocket.CLOSED`     | `3`   | Closed      |

### Methods

| Method                | Description                                 |
| --------------------- | ------------------------------------------- |
| `send(data)`          | Send data                                   |
| `close()`             | Close the connection                        |
| `close(code)`         | Close the connection with a status code     |
| `close(code, reason)` | Close the connection with a code and reason |

**send parameter types:** `string | ArrayBufferLike | Blob | ArrayBufferView`

> `send()` detects Blob types via feature detection; any spec-compliant Blob implementation can be passed. For best compatibility, use the `Blob` exported by this library.

### Events

| Event     | Type           | Description       |
| --------- | -------------- | ----------------- |
| `open`    | `Event`        | Connection opened |
| `message` | `MessageEvent` | Message received  |
| `close`   | `CloseEvent`   | Connection closed |
| `error`   | `Event`        | Connection error  |

## Exports

The `WebSocket` and `Blob` exports return native objects in environments that support them. The `P`-suffixed variants `WebSocketP` and `BlobP` are the polyfill implementations, always using the library-provided version.

> Note: `WebSocketP` is only available in mini program environments and cannot be used in browsers.

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
