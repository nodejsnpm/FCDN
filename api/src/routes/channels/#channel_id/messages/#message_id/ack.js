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
const util_1 = require("../../../../../../../util/src/index");
const express_1 = require("express");
const api_1 = require("../../../../../index");
const router = (0, express_1.Router)();
router.post("/", (0, api_1.route)({ body: "MessageAcknowledgeSchema" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { channel_id, message_id } = req.params;
    const permission = yield (0, util_1.getPermission)(req.user_id, undefined, channel_id);
    permission.hasThrow("VIEW_CHANNEL");
    let read_state = yield util_1.ReadState.findOne({ user_id: req.user_id, channel_id });
    if (!read_state)
        read_state = new util_1.ReadState({ user_id: req.user_id, channel_id });
    read_state.last_message_id = message_id;
    yield read_state.save();
    yield (0, util_1.emitEvent)({
        event: "MESSAGE_ACK",
        user_id: req.user_id,
        data: {
            channel_id,
            message_id,
            version: 3763
        }
    });
    res.sendStatus(204);
}));
exports.default = router;
