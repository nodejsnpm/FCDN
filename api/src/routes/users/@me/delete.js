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
const express_1 = require("express");
const util_1 = require("../../../../../util/src/index");
const api_1 = require("../../../index");
const bcrypt_1 = __importDefault(require("bcrypt"));
const lambert_server_1 = require("lambert-server");
const router = (0, express_1.Router)();
router.post("/", (0, api_1.route)({}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield util_1.User.findOneOrFail({ where: { id: req.user_id }, select: ["data"] }); //User object
    let correctpass = true;
    if (user.data.hash) {
        // guest accounts can delete accounts without password
        correctpass = yield bcrypt_1.default.compare(req.body.password, user.data.hash);
        if (!correctpass) {
            throw new lambert_server_1.HTTPError(req.t("auth:login.INVALID_PASSWORD"));
        }
    }
    // TODO: decrement guild member count
    if (correctpass) {
        yield Promise.all([util_1.User.delete({ id: req.user_id }), util_1.Member.delete({ id: req.user_id })]);
        res.sendStatus(204);
    }
    else {
        res.sendStatus(401);
    }
}));
exports.default = router;
