// @ts-check
import {
    Blob, BlobP,
    fixWebSocket
} from "fetch-xhr-shim";
import {
    WebSocket, WebSocketP
} from "../dist/esm/index.js";
// } from "../dist/miniprogram-websocket.esm.min.js";

export {
    fixWebSocket
};

export const protagonistConfig = {
    useNativeBlob: false,
    useNativeWebSocket: false,
}

export class Protagonist {
    static get Blob() { return /** @type {typeof globalThis.Blob} */(protagonistConfig.useNativeBlob ? Blob : BlobP); }
    static get WebSocket() { return /** @type {typeof globalThis.WebSocket} */(protagonistConfig.useNativeWebSocket ? WebSocket : WebSocketP); }
}
