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
const express_1 = require("express");
const util_1 = require("../../../../../util/src/index");
const api_1 = require("../../../index");
const router = (0, express_1.Router)();
router.get("/", (0, api_1.route)({}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const recipients = yield util_1.Recipient.find({
        where: { user_id: req.user_id, closed: false },
        relations: ["channel", "channel.recipients"]
    });
    res.json(yield Promise.all(recipients.map((r) => util_1.DmChannelDTO.from(r.channel, [req.user_id]))));
}));
router.post("/", (0, api_1.route)({ body: "DmChannelCreateSchema" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    res.json(yield util_1.Channel.createDMChannel(body.recipients, req.user_id, body.name));
}));
exports.default = router;
