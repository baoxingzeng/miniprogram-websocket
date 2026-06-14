import { EventP } from "fetch-xhr-shim";
import { _Symbol, setState } from "fetch-xhr-shim/dev";

export class CloseEventP extends EventP implements CloseEvent {
    constructor(type: string, eventInitDict?: CloseEventInit) {
        super(type, eventInitDict);
        setState(this, "__CloseEvent__", new CloseEventState());
        const s = state(this);

        let _code = Number(eventInitDict?.code); s.code = isNaN(_code) ? 0 : _code;
        if (eventInitDict?.reason !== undefined) s.reason = "" + eventInitDict.reason;
        s.wasClean = !!eventInitDict?.wasClean;
    }

    /** @internal */ declare readonly __CloseEvent__: CloseEventState;

    get code(): number { return state(this).code; }
    get reason(): string { return state(this).reason; }
    get wasClean(): boolean { return state(this).wasClean; }

    /** @internal */ toString() { return "[object CloseEvent]"; }
    /** @internal */ get [_Symbol.toStringTag]() { return "CloseEvent"; }
    /** @internal */ get __MPHTTPX__() { return { chain: ["CloseEvent", "Event"] }; }
}

/** @internal */
class CloseEventState {
    code = 0;
    reason = "";
    wasClean = false;
}

function state(target: CloseEventP) {
    return target.__CloseEvent__;
}
