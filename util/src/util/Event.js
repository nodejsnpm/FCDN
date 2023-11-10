"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listenEvent = exports.initEvent = exports.emitEvent = exports.events = void 0;
const RabbitMQ_1 = require("./RabbitMQ");
const events_1 = __importDefault(require("events"));
exports.events = new events_1.default();
function emitEvent(payload) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const id = (payload.channel_id || payload.user_id || payload.guild_id);
        if (!id)
            return console.error("event doesn't contain any id", payload);
        if (RabbitMQ_1.RabbitMQ.connection) {
            const data = typeof payload.data === "object" ? JSON.stringify(payload.data) : payload.data; // use rabbitmq for event transmission
            yield ((_a = RabbitMQ_1.RabbitMQ.channel) === null || _a === void 0 ? void 0 : _a.assertExchange(id, "fanout", { durable: false }));
            // assertQueue isn't needed, because a queue will automatically created if it doesn't exist
            const successful = (_b = RabbitMQ_1.RabbitMQ.channel) === null || _b === void 0 ? void 0 : _b.publish(id, "", Buffer.from(`${data}`), { type: payload.event });
            if (!successful)
                throw new Error("failed to send event");
        }
        else if (process.env.EVENT_TRANSMISSION === "process") {
            (_c = process.send) === null || _c === void 0 ? void 0 : _c.call(process, { type: "event", event: payload, id });
        }
        else {
            exports.events.emit(id, payload);
        }
    });
}
exports.emitEvent = emitEvent;
function initEvent() {
    return __awaiter(this, void 0, void 0, function* () {
        yield RabbitMQ_1.RabbitMQ.init(); // does nothing if rabbitmq is not setup
        if (RabbitMQ_1.RabbitMQ.connection) {
        }
        else {
            // use event emitter
            // use process messages
        }
    });
}
exports.initEvent = initEvent;
function listenEvent(event, callback, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        if (RabbitMQ_1.RabbitMQ.connection) {
            // @ts-ignore
            return rabbitListen((opts === null || opts === void 0 ? void 0 : opts.channel) || RabbitMQ_1.RabbitMQ.channel, event, callback, { acknowledge: opts === null || opts === void 0 ? void 0 : opts.acknowledge });
        }
        else if (process.env.EVENT_TRANSMISSION === "process") {
            const cancel = () => {
                process.removeListener("message", listener);
                process.setMaxListeners(process.getMaxListeners() - 1);
            };
            const listener = (msg) => {
                msg.type === "event" && msg.id === event && callback(Object.assign(Object.assign({}, msg.event), { cancel }));
            };
            process.addListener("message", listener);
            process.setMaxListeners(process.getMaxListeners() + 1);
            return cancel;
        }
        else {
            const listener = (opts) => callback(Object.assign(Object.assign({}, opts), { cancel }));
            const cancel = () => {
                exports.events.removeListener(event, listener);
                exports.events.setMaxListeners(exports.events.getMaxListeners() - 1);
            };
            exports.events.setMaxListeners(exports.events.getMaxListeners() + 1);
            exports.events.addListener(event, listener);
            return cancel;
        }
    });
}
exports.listenEvent = listenEvent;
function rabbitListen(channel, id, callback, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        yield channel.assertExchange(id, "fanout", { durable: false });
        const q = yield channel.assertQueue("", { exclusive: true, autoDelete: true });
        const cancel = () => {
            channel.cancel(q.queue);
            channel.unbindQueue(q.queue, id, "");
        };
        channel.bindQueue(q.queue, id, "");
        channel.consume(q.queue, (opts) => {
            if (!opts)
                return;
            const data = JSON.parse(opts.content.toString());
            const event = opts.properties.type;
            callback({
                event,
                data,
                acknowledge() {
                    channel.ack(opts);
                },
                channel,
                cancel,
            });
            // rabbitCh.ack(opts);
        }, {
            noAck: !(opts === null || opts === void 0 ? void 0 : opts.acknowledge),
        });
        return cancel;
    });
}
