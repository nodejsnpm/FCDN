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
exports.FosscordServer = void 0;
require("missing-native-js-functions");
const lambert_server_1 = require("lambert-server");
const middlewares_1 = require("./middlewares/");
const util_1 = require("../../util/src/index");
const ErrorHandler_1 = require("./middlewares/ErrorHandler");
const BodyParser_1 = require("./middlewares/BodyParser");
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const RateLimit_1 = require("./middlewares/RateLimit");
const TestClient_1 = __importDefault(require("./middlewares/TestClient"));
const Translation_1 = require("./middlewares/Translation");
const morgan_1 = __importDefault(require("morgan"));
const Instance_1 = require("./util/Instance");
const util_2 = require("../../util/src/index");
class FosscordServer extends lambert_server_1.Server {
    constructor(opts) {
        // @ts-ignore
        super(Object.assign(Object.assign({}, opts), { errorHandler: false, jsonBody: false }));
    }
    start() {
        const _super = Object.create(null, {
            start: { get: () => super.start }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, util_1.initDatabase)();
            yield util_1.Config.init();
            yield (0, util_1.initEvent)();
            yield (0, Instance_1.initInstance)();
            /*
            DOCUMENTATION: uses LOG_REQUESTS environment variable
            
            # only log 200 and 204
            LOG_REQUESTS=200 204
            # log everything except 200 and 204
            LOG_REQUESTS=-200 204
            # log all requests
            LOG_REQUESTS=-
            */
            let logRequests = process.env["LOG_REQUESTS"] != undefined;
            if (logRequests) {
                this.app.use((0, morgan_1.default)("combined", {
                    skip: (req, res) => {
                        var _a, _b, _c;
                        var skip = !((_b = (_a = process.env["LOG_REQUESTS"]) === null || _a === void 0 ? void 0 : _a.includes(res.statusCode.toString())) !== null && _b !== void 0 ? _b : false);
                        if (((_c = process.env["LOG_REQUESTS"]) === null || _c === void 0 ? void 0 : _c.charAt(0)) == "-")
                            skip = !skip;
                        return skip;
                    }
                }));
            }
            this.app.use(middlewares_1.CORS);
            this.app.use((0, BodyParser_1.BodyParser)({ inflate: true, limit: "10mb" }));
            const app = this.app;
            const api = (0, express_1.Router)(); // @ts-ignore
            this.app = api;
            api.use(middlewares_1.Authentication);
            yield (0, RateLimit_1.initRateLimits)(api);
            yield (0, Translation_1.initTranslation)(api);
            this.routes = yield (0, util_2.registerRoutes)(this, path_1.default.join(__dirname, "routes", "/"));
            api.use("*", (error, req, res, next) => {
                if (error)
                    return next(error);
                res.status(404).json({
                    message: "404 endpoint not found",
                    code: 0
                });
                next();
            });
            this.app = app;
            app.use("/api/v6", api);
            app.use("/api/v7", api);
            app.use("/api/v8", api);
            app.use("/api/v9", api);
            app.use("/api", api); // allow unversioned requests
            this.app.use(ErrorHandler_1.ErrorHandler);
            (0, TestClient_1.default)(this.app);
            if (logRequests) {
                console.log("Warning: Request logging is enabled! This will spam your console!\nTo disable this, unset the 'LOG_REQUESTS' environment variable!");
            }
            return _super.start.call(this);
        });
    }
}
exports.FosscordServer = FosscordServer;
