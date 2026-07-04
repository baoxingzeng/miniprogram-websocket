import {
    EventP,
    EventTargetP,
    Blob,
    Headers
} from "fetch-xhr-shim";
import {
    _Symbol,
    DOMException,
    setState,
    checkArgsLength,
    Payload,
    attachFn,
    executeFn,
    Event_setTrusted,
    EventTarget_dispatchEvent,
    isSequence,
    isArrayBuffer
} from "fetch-xhr-shim/dev";
import { CloseEventP } from "./CloseEventP";
import { MessageEventP } from "./MessageEventP";
import type {
    ISocketTask,
    TConnectSocketFunc,
    IConnectSocketOption
} from "./connectSocket";
import { platform, getConnectSocketFunc } from "./connectSocket";

const mp = { connectSocket: getConnectSocketFunc() };
export function setConnectSocketFunc(connectSocket: unknown) { mp.connectSocket = connectSocket as TConnectSocketFunc; }

export class WebSocketP extends EventTargetP implements WebSocket {
    static get CONNECTING(): 0 { return 0; }
    static get OPEN(): 1 { return 1; }
    static get CLOSING(): 2 { return 2; }
    static get CLOSED(): 3 { return 3; }

    constructor(url: string | URL, protocols?: string | string[]) {
        checkArgsLength(arguments.length, 1, "WebSocket");
        super();

        const targetURL = "" + url;
        const options: IConnectSocketOption = {
            url: targetURL,
            multiple: true, // Alipay Mini Program
            fail(err: unknown) { console.error(err); },
        };

        if (protocols !== undefined) {
            options.protocols = isSequence(protocols)
                ? Array.isArray(protocols) ? protocols : Array.from<string>(protocols)
                : ["" + protocols];
        }

        const socketTask = mp.connectSocket(options);
        setState(this, "__WebSocket__", new WebSocketState(this, socketTask));
        state(this).url = targetURL;

        if (socketTask && typeof socketTask === "object") {
            onOpen(this);
            onClose(this);
            onError(this);
            onMessage(this);
        } else {
            throw new Error(`connectSocket can't establish a connection to the server at ${"" + url}.`);
        }
    }

    /** @internal */ declare readonly __WebSocket__: WebSocketState;

    get CONNECTING(): 0 { return 0; }
    get OPEN(): 1 { return 1; }
    get CLOSING(): 2 { return 2; }
    get CLOSED(): 3 { return 3; }

    get binaryType(): BinaryType { return state(this).binaryType; }
    set binaryType(value: BinaryType) { if (value === "blob" || value === "arraybuffer") { state(this).binaryType = value; } }

    get bufferedAmount(): number { return state(this).bufferedAmount; }
    get extensions(): string { return ""; }
    get protocol(): string { return state(this).protocol; }
    get readyState() { return state(this).readyState; }
    get url(): string { return state(this).url; }

    close(code?: number, reason?: string): void {
        let s = state(this);
        if (this.readyState === 2 /* CLOSING */ || this.readyState === 3 /* CLOSED */) return;
        s.readyState = 2 /* CLOSING */;
        s.socketTask.close({
            code: code,
            reason: reason,
            fail(err: unknown) { console.error(err); },
            complete: function () { s.readyState = 3 /* CLOSED */; },
        });
    }

    send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
        checkArgsLength(arguments.length, 1, "WebSocket", "send");
        if (this.readyState === 0 /* CONNECTING */) {
            throw new DOMException("Failed to execute 'send' on 'WebSocket': Still in CONNECTING state.", "InvalidStateError");
        }

        if (this.readyState === 2 /* CLOSING */ || this.readyState === 3 /* CLOSED */) {
            return console.error("WebSocket is already in CLOSING or CLOSED state.");
        }

        const transfer = (function (this: WebSocketP, data: string | ArrayBuffer) {
            if (this.readyState !== 1 /* OPEN */) return;
            state(this).socketTask.send({ data, fail(err: unknown) { console.error(err); } });
        }).bind(this);

        let payload = new Payload(data ?? "" + data);
        payload.promise.then(transfer);
    }

    get onclose() { return state(this).onclose; }
    set onclose(value) { state(this).onclose = value; state(this).attach("close"); }

    get onerror() { return state(this).onerror; }
    set onerror(value) { state(this).onerror = value; state(this).attach("error"); }

    get onmessage() { return state(this).onmessage; }
    set onmessage(value) { state(this).onmessage = value; state(this).attach("message"); }

    get onopen() { return state(this).onopen; }
    set onopen(value) { state(this).onopen = value; state(this).attach("open"); }

    /** @internal */ toString() { return "[object WebSocket]"; }
    /** @internal */ get [_Symbol.toStringTag]() { return "WebSocket"; }
    /** @internal */ get __MPHTTPX__() { return { chain: ["WebSocket", "EventTarget"] }; }
}

/** @internal */
class WebSocketState {
    constructor(target: WebSocket, socketTask: ISocketTask) {
        this.socketTask = socketTask;
        this.attach = attachFn<WebSocket, keyof WebSocketEventMap>(target, getHandlers(target));
    }

    binaryType: BinaryType = "blob";
    bufferedAmount = 0;
    protocol = "";
    readyState: WebSocket["readyState"] = 0;
    url = "";

    socketTask: ISocketTask;
    error: unknown = null;

    attach: (type: keyof WebSocketEventMap) => void;
    onclose: ((this: WebSocket, ev: CloseEvent) => any) | null = null;
    onerror: ((this: WebSocket, ev: Event) => any) | null = null;
    onmessage: ((this: WebSocket, ev: MessageEvent) => any) | null = null;
    onopen: ((this: WebSocket, ev: Event) => any) | null = null;
}

function getHandlers(t: WebSocket) {
    return {
        onclose: function (ev: CloseEvent) { executeFn(t, t.onclose, ev); },
        onerror: function (ev: Event) { executeFn(t, t.onerror, ev); },
        onmessage: function (ev: MessageEvent) { executeFn(t, t.onmessage, ev); },
        onopen: function (ev: Event) { executeFn(t, t.onopen, ev); },
    };
}

function state(target: WebSocketP) {
    return target.__WebSocket__;
}

function emitEvent(target: EventTarget, type: string) {
    let event = new EventP(type);
    // @ts-ignore
    event.__Event__.target = target;
    Event_setTrusted(event, true);
    EventTarget_dispatchEvent(target, event);
}

function onOpen(socket: WebSocketP) {
    let s = state(socket);
    s.socketTask.onOpen(function (res) {
        if ("header" in res && res.header && typeof res.header === "object") {
            let headers = new Headers(res.header as Record<string, string>);
            s.protocol = headers.get("Sec-WebSocket-Protocol") || "";
        }

        s.readyState = 1 /* OPEN */;
        emitEvent(socket, "open");
    });
}

function onClose(socket: WebSocketP) {
    let s = state(socket);
    s.socketTask.onClose(function (res) {
        s.readyState = 3 /* CLOSED */;
        let event = new CloseEventP("close", {
            wasClean: !s.error,
            code: res.code,
            reason: res.reason,
        });

        Event_setTrusted(event, true);
        EventTarget_dispatchEvent(socket, event);
    });
}

function onError(socket: WebSocketP) {
    let s = state(socket);
    s.socketTask.onError(function (res) {
        console.error(res);
        s.error = res;
        s.readyState = 3 /* CLOSED */;
        emitEvent(socket, "error");
    });
}

function onMessage(socket: WebSocketP) {
    state(socket).socketTask.onMessage(function (res) {
        let data = res.data;
        let _data: string | ArrayBuffer | Blob;

        // Alipay Mini Program
        if (data && typeof data === "object" && "data" in data) {
            _data = data.data;
            if ("isBuffer" in data && data.isBuffer && typeof _data === "string") {
                try { _data = platform.mp.base64ToArrayBuffer(_data); } catch (e) { }
            }
        } else {
            _data = data;
        }

        if (isArrayBuffer(_data) && socket.binaryType === "blob") {
            _data = new Blob([_data]);
        }

        let event = new MessageEventP("message", {
            data: _data,
            origin: socket.url,
        });

        Event_setTrusted(event, true);
        EventTarget_dispatchEvent(socket, event);
    });
}

const WebSocketE = (typeof WebSocket !== "undefined" && WebSocket) || WebSocketP;
export { WebSocketE as WebSocket };
