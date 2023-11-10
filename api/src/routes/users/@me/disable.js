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
const util_1 = require("../../../../../util/src/index");
const express_1 = require("express");
const api_1 = require("../../../index");
const bcrypt_1 = __importDefault(require("bcrypt"));
const router = (0, express_1.Router)();
router.post("/", (0, api_1.route)({}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield util_1.User.findOneOrFail({ where: { id: req.user_id }, select: ["data"] }); //User object
    let correctpass = true;
    if (user.data.hash) {
        // guest accounts can delete accounts without password
        correctpass = yield bcrypt_1.default.compare(req.body.password, user.data.hash); //Not sure if user typed right password :/
    }
    if (correctpass) {
        yield util_1.User.update({ id: req.user_id }, { disabled: true });
        res.sendStatus(204);
    }
    else {
        res.status(400).json({ message: "Password does not match", code: 50018 });
    }
}));
exports.default = router;
