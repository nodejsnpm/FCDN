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
exports.Authentication = exports.API_PREFIX_TRAILING_SLASH = exports.API_PREFIX = exports.NO_AUTHORIZATION_ROUTES = void 0;
const lambert_server_1 = require("lambert-server");
const util_1 = require("../../../util/src/index");
exports.NO_AUTHORIZATION_ROUTES = [
    "/auth/login",
    "/auth/register",
    "/webhooks/",
    "/ping",
    "/gateway",
    "/experiments",
    "/-/readyz",
    "/-/healthz",
    "/science",
    "/track",
    "/policies/instance",
    /\/guilds\/\d+\/widget\.(json|png)/
];
exports.API_PREFIX = /^\/api(\/v\d+)?/;
exports.API_PREFIX_TRAILING_SLASH = /^\/api(\/v\d+)?\//;
function Authentication(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.method === "OPTIONS")
            return res.sendStatus(204);
        const url = req.url.replace(exports.API_PREFIX, "");
        if (url.startsWith("/invites") && req.method === "GET")
            return next();
        if (exports.NO_AUTHORIZATION_ROUTES.some((x) => {
            if (typeof x === "string")
                return url.startsWith(x);
            return x.test(url);
        }))
            return next();
        if (!req.headers.authorization)
            return next(new lambert_server_1.HTTPError("Missing Authorization Header", 401));
        try {
            const { jwtSecret } = util_1.Config.get().security;
            const { decoded, user } = yield (0, util_1.checkToken)(req.headers.authorization, jwtSecret);
            req.token = decoded;
            req.user_id = decoded.id;
            req.user_bot = user.bot;
            req.rights = new util_1.Rights(Number(user.rights));
            return next();
        }
        catch (error) {
            return next(new lambert_server_1.HTTPError(error === null || error === void 0 ? void 0 : error.toString(), 400));
        }
    });
}
exports.Authentication = Authentication;
