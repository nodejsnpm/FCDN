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
exports.CDNServer = void 0;
const lambert_server_1 = require("lambert-server");
const util_1 = require("../../util/src/index");
const path_1 = __importDefault(require("path"));
const avatars_1 = __importDefault(require("./routes/avatars"));
const body_parser_1 = __importDefault(require("body-parser"));
class CDNServer extends lambert_server_1.Server {
    constructor(options) {
        super(options);
    }
    start() {
        const _super = Object.create(null, {
            start: { get: () => super.start }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, util_1.initDatabase)();
            yield util_1.Config.init();
            this.app.use((req, res, next) => {
                res.set("Access-Control-Allow-Origin", "*");
                // TODO: use better CSP policy
                res.set("Content-security-policy", "default-src *  data: blob: filesystem: about: ws: wss: 'unsafe-inline' 'unsafe-eval'; script-src * data: blob: 'unsafe-inline' 'unsafe-eval'; connect-src * data: blob: 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src * data: blob: ; style-src * data: blob: 'unsafe-inline'; font-src * data: blob: 'unsafe-inline';");
                res.set("Access-Control-Allow-Headers", req.header("Access-Control-Request-Headers") || "*");
                res.set("Access-Control-Allow-Methods", req.header("Access-Control-Request-Methods") || "*");
                next();
            });
            this.app.use(body_parser_1.default.json({ inflate: true, limit: "10mb" }));
            yield (0, util_1.registerRoutes)(this, path_1.default.join(__dirname, "routes/"));
            this.app.use("/icons/", avatars_1.default);
            this.log("verbose", "[Server] Route /icons registered");
            this.app.use("/emojis/", avatars_1.default);
            this.log("verbose", "[Server] Route /emojis registered");
            this.app.use("/stickers/", avatars_1.default);
            this.log("verbose", "[Server] Route /stickers registered");
            this.app.use("/banners/", avatars_1.default);
            this.log("verbose", "[Server] Route /banners registered");
            this.app.use("/splashes/", avatars_1.default);
            this.log("verbose", "[Server] Route /splashes registered");
            this.app.use("/app-icons/", avatars_1.default);
            this.log("verbose", "[Server] Route /app-icons registered");
            this.app.use("/app-assets/", avatars_1.default);
            this.log("verbose", "[Server] Route /app-assets registered");
            this.app.use("/discover-splashes/", avatars_1.default);
            this.log("verbose", "[Server] Route /discover-splashes registered");
            this.app.use("/team-icons/", avatars_1.default);
            this.log("verbose", "[Server] Route /team-icons registered");
            this.app.use("/channel-icons/", avatars_1.default);
            this.log("verbose", "[Server] Route /channel-icons registered");
            return _super.start.call(this);
        });
    }
    stop() {
        const _super = Object.create(null, {
            stop: { get: () => super.stop }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.stop.call(this);
        });
    }
}
exports.CDNServer = CDNServer;
