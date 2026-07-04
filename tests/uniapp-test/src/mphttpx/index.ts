// @ts-nocheck
import { Protagonist } from "../../../exports.js";
import { _test as WebSocket_suite, setWebSocketClass } from "../../../WebSocketTest.js";

setWebSocketClass(Protagonist.WebSocket);
WebSocket_suite.run();
