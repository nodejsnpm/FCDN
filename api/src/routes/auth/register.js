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
const util_1 = require("../../../../util/src/index");
const api_1 = require("../../index");
require("missing-native-js-functions");
const bcrypt_1 = __importDefault(require("bcrypt"));
const lambert_server_1 = require("lambert-server");
const router = (0, express_1.Router)();
router.post("/", (0, api_1.route)({ body: "RegisterSchema" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const { register, security } = util_1.Config.get();
    const ip = (0, api_1.getIpAdress)(req);
    // email will be slightly modified version of the user supplied email -> e.g. protection against GMail Trick
    let email = (0, util_1.adjustEmail)(body.email);
    // check if registration is allowed
    if (!register.allowNewRegistration) {
        throw (0, util_1.FieldErrors)({
            email: { code: "REGISTRATION_DISABLED", message: req.t("auth:register.REGISTRATION_DISABLED") }
        });
    }
    // check if the user agreed to the Terms of Service
    if (!body.consent) {
        throw (0, util_1.FieldErrors)({
            consent: { code: "CONSENT_REQUIRED", message: req.t("auth:register.CONSENT_REQUIRED") }
        });
    }
    if (register.disabled) {
        throw (0, util_1.FieldErrors)({
            email: {
                code: "DISABLED",
                message: "registration is disabled on this instance"
            }
        });
    }
    if (register.requireCaptcha && security.captcha.enabled) {
        if (!body.captcha_key) {
            const { sitekey, service } = security.captcha;
            return res === null || res === void 0 ? void 0 : res.status(400).json({
                captcha_key: ["captcha-required"],
                captcha_sitekey: sitekey,
                captcha_service: service
            });
        }
        // TODO: check captcha
    }
    if (!register.allowMultipleAccounts) {
        // TODO: check if fingerprint was eligible generated
        const exists = yield util_1.User.findOne({ where: { fingerprints: body.fingerprint }, select: ["id"] });
        if (exists) {
            throw (0, util_1.FieldErrors)({
                email: {
                    code: "EMAIL_ALREADY_REGISTERED",
                    message: req.t("auth:register.EMAIL_ALREADY_REGISTERED")
                }
            });
        }
    }
    if (register.blockProxies) {
        if ((0, api_1.isProxy)(yield (0, api_1.IPAnalysis)(ip))) {
            console.log(`proxy ${ip} blocked from registration`);
            throw new lambert_server_1.HTTPError("Your IP is blocked from registration");
        }
    }
    // TODO: gift_code_sku_id?
    // TODO: check password strength
    if (email) {
        // replace all dots and chars after +, if its a gmail.com email
        if (!email) {
            throw (0, util_1.FieldErrors)({ email: { code: "INVALID_EMAIL", message: req === null || req === void 0 ? void 0 : req.t("auth:register.INVALID_EMAIL") } });
        }
        // check if there is already an account with this email
        const exists = yield util_1.User.findOne({ email: email });
        if (exists) {
            throw (0, util_1.FieldErrors)({
                email: {
                    code: "EMAIL_ALREADY_REGISTERED",
                    message: req.t("auth:register.EMAIL_ALREADY_REGISTERED")
                }
            });
        }
    }
    else if (register.email.required) {
        throw (0, util_1.FieldErrors)({
            email: { code: "BASE_TYPE_REQUIRED", message: req.t("common:field.BASE_TYPE_REQUIRED") }
        });
    }
    if (register.dateOfBirth.required && !body.date_of_birth) {
        throw (0, util_1.FieldErrors)({
            date_of_birth: { code: "BASE_TYPE_REQUIRED", message: req.t("common:field.BASE_TYPE_REQUIRED") }
        });
    }
    else if (register.dateOfBirth.minimum) {
        const minimum = new Date();
        minimum.setFullYear(minimum.getFullYear() - register.dateOfBirth.minimum);
        body.date_of_birth = new Date(body.date_of_birth);
        // higher is younger
        if (body.date_of_birth > minimum) {
            throw (0, util_1.FieldErrors)({
                date_of_birth: {
                    code: "DATE_OF_BIRTH_UNDERAGE",
                    message: req.t("auth:register.DATE_OF_BIRTH_UNDERAGE", { years: register.dateOfBirth.minimum })
                }
            });
        }
    }
    if (body.password) {
        // the salt is saved in the password refer to bcrypt docs
        body.password = yield bcrypt_1.default.hash(body.password, 12);
    }
    else if (register.password.required) {
        throw (0, util_1.FieldErrors)({
            password: { code: "BASE_TYPE_REQUIRED", message: req.t("common:field.BASE_TYPE_REQUIRED") }
        });
    }
    if (!body.invite && (register.requireInvite || (register.guestsRequireInvite && !register.email))) {
        // require invite to register -> e.g. for organizations to send invites to their employees
        throw (0, util_1.FieldErrors)({
            email: { code: "INVITE_ONLY", message: req.t("auth:register.INVITE_ONLY") }
        });
    }
    const user = yield util_1.User.register(Object.assign(Object.assign({}, body), { req }));
    if (body.invite) {
        // await to fail if the invite doesn't exist (necessary for requireInvite to work properly) (username only signups are possible)
        yield util_1.Invite.joinGuild(user.id, body.invite);
    }
    console.log("register", body.email, body.username, ip);
    return res.json({ token: yield (0, util_1.generateToken)(user.id) });
}));
exports.default = router;
/**
 * POST /auth/register
 * @argument { "fingerprint":"805826570869932034.wR8vi8lGlFBJerErO9LG5NViJFw", "email":"qo8etzvaf@gmail.com", "username":"qp39gr98", "password":"wtp9gep9gw", "invite":null, "consent":true, "date_of_birth":"2000-04-04", "gift_code_sku_id":null, "captcha_key":null}
 *
 * Field Error
 * @returns { "code": 50035, "errors": { "consent": { "_errors": [{ "code": "CONSENT_REQUIRED", "message": "You must agree to Discord's Terms of Service and Privacy Policy." }]}}, "message": "Invalid Form Body"}
 *
 * Success 200:
 * @returns {token: "OMITTED"}
 */
