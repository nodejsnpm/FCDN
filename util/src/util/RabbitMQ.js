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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQ = void 0;
// import Config from "./Config";
exports.RabbitMQ = {
    connection: null,
    channel: null,
    init: function () {
        return __awaiter(this, void 0, void 0, function* () {
            return;
            // const host = Config.get().rabbitmq.host;
            // if (!host) return;
            // console.log(`[RabbitMQ] connect: ${host}`);
            // this.connection = await amqp.connect(host, {
            // 	timeout: 1000 * 60,
            // });
            // console.log(`[RabbitMQ] connected`);
            // this.channel = await this.connection.createChannel();
            // console.log(`[RabbitMQ] channel created`);
        });
    },
};
