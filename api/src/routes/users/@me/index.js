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
const router = (0, express_1.Router)();
router.get("/", (0, api_1.route)({}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json(yield util_1.User.findOne({ select: util_1.PrivateUserProjection, where: { id: req.user_id } }));
}));
router.patch("/", (0, api_1.route)({ body: "UserModifySchema" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const body = req.body;
    if (body.avatar)
        body.avatar = yield (0, util_1.handleFile)(`/avatars/${req.user_id}`, body.avatar);
    if (body.banner)
        body.banner = yield (0, util_1.handleFile)(`/banners/${req.user_id}`, body.banner);
    const user = yield util_1.User.findOneOrFail({ where: { id: req.user_id }, select: [...util_1.PrivateUserProjection, "data"] });
    if (body.password) {
        if ((_a = user.data) === null || _a === void 0 ? void 0 : _a.hash) {
            const same_password = yield bcrypt_1.default.compare(body.password, user.data.hash || "");
            if (!same_password) {
                throw (0, util_1.FieldErrors)({ password: { message: req.t("auth:login.INVALID_PASSWORD"), code: "INVALID_PASSWORD" } });
            }
        }
        else {
            user.data.hash = yield bcrypt_1.default.hash(body.password, 12);
        }
    }
    user.assign(body);
    if (body.new_password) {
        if (!body.password && !user.email) {
            throw (0, util_1.FieldErrors)({
                password: { code: "BASE_TYPE_REQUIRED", message: req.t("common:field.BASE_TYPE_REQUIRED") }
            });
        }
        user.data.hash = yield bcrypt_1.default.hash(body.new_password, 12);
    }
    yield user.save();
    // @ts-ignore
    delete user.data;
    // TODO: send update member list event in gateway
    yield (0, util_1.emitEvent)({
        event: "USER_UPDATE",
        user_id: req.user_id,
        data: user
    });
    res.json(user);
}));
exports.default = router;
// {"message": "Invalid two-factor code", "code": 60008}
