import { suite } from "uvu";
import * as assert from "uvu/assert";
import { ui_rec, testConfig } from "./utils.js";
import { Protagonist, fixWebSocket } from "./exports.js";

const _name = "WebSocket";
export const _test = suite(_name);

/**
 * @param {string} n 
 * @param {Parameters<typeof _test>[1]} t 
 */
const test = (n, t) => {
    return _test(...ui_rec(_name, n, t));
}

const mp = { WebSocket: /** @type {typeof WebSocket} */ (typeof WebSocket !== "undefined" && WebSocket) || undefined };

/**
 * @param {unknown} WSClass
 */
export function setWebSocketClass(WSClass) {
    fixWebSocket(WSClass);
    mp.WebSocket = /** @type {typeof globalThis.WebSocket} */ WSClass;
}

test("WebSocket establish a connection and receive the welcome message", async () => {
    return new Promise((resolve, reject) => {
        let WebSocketClass = mp.WebSocket || (() => { throw new ReferenceError("WebSocket is not defined"); })();
        let ws = new WebSocketClass(testConfig.ws_url);
        ws.onopen = () => {
            assert.is(ws.readyState, WebSocketClass.OPEN);
        };
        ws.onmessage = (event) => {
            let message = event.data;
            assert.equal(message, "Welcome to test server!");
            ws.close();
            resolve();
        };
        ws.onerror = (error) => {
            reject(new Error(`failed: ${error.message}`));
        };
    });
});

test("WebSocket send a message and receive an echo", async () => {
    return new Promise((resolve, reject) => {
        let WebSocketClass = mp.WebSocket || (() => { throw new ReferenceError("WebSocket is not defined"); })();
        let ws = new WebSocketClass(testConfig.ws_url);
        let testMessage = "Hello Polyfill.";
        ws.onopen = () => {
            ws.send(testMessage);
        };
        ws.onmessage = (event) => {
            if (event.data === "Welcome to test server!") return;
            assert.equal(event.data, `echo: ${testMessage}`);
            ws.close();
            resolve();
        };
        ws.onerror = (error) => {
            reject(new Error(`send failed: ${error.message}`));
        };
    });
});

test("WebSocket ping/pong interaction", async () => {
    return new Promise((resolve, reject) => {
        let WebSocketClass = mp.WebSocket || (() => { throw new ReferenceError("WebSocket is not defined"); })();
        let ws = new WebSocketClass(testConfig.ws_url);
        ws.binaryType = "arraybuffer";
        ws.onopen = () => {
            ws.send("ping");
        };
        ws.onmessage = (event) => {
            if (event.data === "Welcome to test server!") return;
            let data = event.data;
            // Alipay Mini Program
            if (data instanceof ArrayBuffer) {
                assert.equal(new Uint8Array(data), new Uint8Array([166, 137, 224]))
            } else {
                assert.equal(data, "pong");
            }
            ws.close();
            resolve();
        };
        ws.onerror = (error) => {
            reject(new Error(`ping/pong failed: ${error.message}`));
        };
    });
});

test("WebSocket close the connection normally", async () => {
    return new Promise((resolve, reject) => {
        let WebSocketClass = mp.WebSocket || (() => { throw new ReferenceError("WebSocket is not defined"); })();
        let ws = new WebSocketClass(testConfig.ws_url);
        ws.onopen = () => {
            ws.send("close");
        };
        ws.onclose = (event) => {
            assert.is(event.code, 1000);
            assert.is(ws.readyState, WebSocketClass.CLOSED);
            resolve();
        };
        ws.onerror = (error) => {
            reject(new Error(`close failed: ${error.message}`));
        };
    });
});

test("WebSocket error scenario handling", async () => {
    return new Promise((resolve) => {
        let WebSocketClass = mp.WebSocket || (() => { throw new ReferenceError("WebSocket is not defined"); })();
        let wsError = new WebSocketClass("ws://localhost:8888");
        wsError.onerror = (error) => {
            assert.ok(error);
        };
        let wsServerError = new WebSocketClass(testConfig.ws_url);
        wsServerError.onopen = () => {
            wsServerError.send("error");
        };
        wsServerError.onclose = (event) => {
            assert.is(event.code, 1011);
            resolve();
        };
    });
});

test("WebSocket send/receive binary messages", async () => {
    return new Promise((resolve) => {
        let WebSocketClass = mp.WebSocket || (() => { throw new ReferenceError("WebSocket is not defined"); })();
        let ws = new WebSocketClass(testConfig.ws_url);
        ws.binaryType = "arraybuffer";
        let binaryData = new Uint8Array([1, 2, 3, 4]);
        ws.onopen = () => {
            ws.send(binaryData);
        };
        ws.onmessage = (event) => {
            if (event.data instanceof ArrayBuffer) {
                let received = new Uint8Array(event.data);
                assert.equal(received, binaryData);
                ws.close();
                resolve();
            }
        };
    });
});
