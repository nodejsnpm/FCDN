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
router.patch("/", (0, api_1.route)({ body: "UserSettingsSchema" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    if (body.locale === "en")
        body.locale = "en-US"; // fix discord client crash on unkown locale
    const user = yield util_1.User.findOneOrFail({ id: req.user_id, bot: false });
    user.settings = Object.assign(Object.assign({}, user.settings), body);
    yield user.save();
    res.sendStatus(204);
}));
exports.default = router;
