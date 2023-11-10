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
const api_1 = require("../../index");
const bcrypt_1 = __importDefault(require("bcrypt"));
const util_1 = require("../../../../util/src/index");
const router = (0, express_1.Router)();
exports.default = router;
router.post("/", (0, api_1.route)({ body: "LoginSchema" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { login, password, captcha_key, undelete } = req.body;
    const email = (0, util_1.adjustEmail)(login);
    console.log("login", email);
    const config = util_1.Config.get();
    if (config.login.requireCaptcha && config.security.captcha.enabled) {
        if (!captcha_key) {
            const { sitekey, service } = config.security.captcha;
            return res.status(400).json({
                captcha_key: ["captcha-required"],
                captcha_sitekey: sitekey,
                captcha_service: service
            });
        }
        // TODO: check captcha
    }
    const user = yield util_1.User.findOneOrFail({
        where: [{ phone: login }, { email: login }],
        select: ["data", "id", "disabled", "deleted", "settings"]
    }).catch((e) => {
        throw (0, util_1.FieldErrors)({ login: { message: req.t("auth:login.INVALID_LOGIN"), code: "INVALID_LOGIN" } });
    });
    if (undelete) {
        // undelete refers to un'disable' here
        if (user.disabled)
            yield util_1.User.update({ id: user.id }, { disabled: false });
        if (user.deleted)
            yield util_1.User.update({ id: user.id }, { deleted: false });
    }
    else {
        if (user.deleted)
            return res.status(400).json({ message: "This account is scheduled for deletion.", code: 20011 });
        if (user.disabled)
            return res.status(400).json({ message: req.t("auth:login.ACCOUNT_DISABLED"), code: 20013 });
    }
    // the salt is saved in the password refer to bcrypt docs
    const same_password = yield bcrypt_1.default.compare(password, user.data.hash || "");
    if (!same_password) {
        throw (0, util_1.FieldErrors)({ password: { message: req.t("auth:login.INVALID_PASSWORD"), code: "INVALID_PASSWORD" } });
    }
    const token = yield (0, util_1.generateToken)(user.id);
    // Notice this will have a different token structure, than discord
    // Discord header is just the user id as string, which is not possible with npm-jsonwebtoken package
    // https://user-images.githubusercontent.com/6506416/81051916-dd8c9900-8ec2-11ea-8794-daf12d6f31f0.png
    res.json({ token, settings: user.settings });
}));
/**
 * POST /auth/login
 * @argument { login: "email@gmail.com", password: "cleartextpassword", undelete: false, captcha_key: null, login_source: null, gift_code_sku_id: null, }

 * MFA required:
 * @returns {"token": null, "mfa": true, "sms": true, "ticket": "SOME TICKET JWT TOKEN"}

 * Captcha required:
 * @returns {"captcha_key": ["captcha-required"], "captcha_sitekey": null, "captcha_service": "recaptcha"}

 * Sucess:
 * @returns {"token": "USERTOKEN", "settings": {"locale": "en", "theme": "dark"}}

 */
