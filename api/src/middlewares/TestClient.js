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
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const proxy_agent_1 = __importDefault(require("proxy-agent"));
const util_1 = require("../../../util/src/index");
function TestClient(app) {
    var _a, _b;
    const agent = new proxy_agent_1.default();
    const assetCache = new Map();
    const indexHTML = fs_1.default.readFileSync(path_1.default.join(__dirname, "..", "..", "client_test", "index.html"), { encoding: "utf8" });
    var html = indexHTML;
    const CDN_ENDPOINT = (util_1.Config.get().cdn.endpointClient || ((_a = util_1.Config.get()) === null || _a === void 0 ? void 0 : _a.cdn.endpointPublic) || process.env.CDN || "").replace(/(https?)?(:\/\/?)/g, "");
    const GATEWAY_ENDPOINT = util_1.Config.get().gateway.endpointClient || ((_b = util_1.Config.get()) === null || _b === void 0 ? void 0 : _b.gateway.endpointPublic) || process.env.GATEWAY || "";
    if (CDN_ENDPOINT) {
        html = html.replace(/CDN_HOST: .+/, `CDN_HOST: \`${CDN_ENDPOINT}\`,`);
    }
    if (GATEWAY_ENDPOINT) {
        html = html.replace(/GATEWAY_ENDPOINT: .+/, `GATEWAY_ENDPOINT: \`${GATEWAY_ENDPOINT}\`,`);
    }
    // inline plugins
    var files = fs_1.default.readdirSync(path_1.default.join(__dirname, "..", "..", "assets", "preload-plugins"));
    var plugins = "";
    files.forEach(x => { if (x.endsWith(".js"))
        plugins += `<script>${fs_1.default.readFileSync(path_1.default.join(__dirname, "..", "..", "assets", "preload-plugins", x))}</script>\n`; });
    html = html.replaceAll("<!-- preload plugin marker -->", plugins);
    // plugins
    files = fs_1.default.readdirSync(path_1.default.join(__dirname, "..", "..", "assets", "plugins"));
    plugins = "";
    files.forEach(x => { if (x.endsWith(".js"))
        plugins += `<script src='/assets/plugins/${x}'></script>\n`; });
    html = html.replaceAll("<!-- plugin marker -->", plugins);
    //preload plugins
    files = fs_1.default.readdirSync(path_1.default.join(__dirname, "..", "..", "assets", "preload-plugins"));
    plugins = "";
    files.forEach(x => { if (x.endsWith(".js"))
        plugins += `<script>${fs_1.default.readFileSync(path_1.default.join(__dirname, "..", "..", "assets", "preload-plugins", x))}</script>\n`; });
    html = html.replaceAll("<!-- preload plugin marker -->", plugins);
    app.use("/assets", express_1.default.static(path_1.default.join(__dirname, "..", "..", "assets")));
    app.get("/assets/:file", (req, res) => __awaiter(this, void 0, void 0, function* () {
        delete req.headers.host;
        var response;
        var buffer;
        const cache = assetCache.get(req.params.file);
        if (!cache) {
            response = yield (0, node_fetch_1.default)(`https://discord.com/assets/${req.params.file}`, {
                agent,
                // @ts-ignore
                headers: Object.assign({}, req.headers)
            });
            buffer = yield response.buffer();
        }
        else {
            response = cache.response;
            buffer = cache.buffer;
        }
        response.headers.forEach((value, name) => {
            if ([
                "content-length",
                "content-security-policy",
                "strict-transport-security",
                "set-cookie",
                "transfer-encoding",
                "expect-ct",
                "access-control-allow-origin",
                "content-encoding"
            ].includes(name.toLowerCase())) {
                return;
            }
            res.set(name, value);
        });
        assetCache.set(req.params.file, { buffer, response });
        return res.send(buffer);
    }));
    app.get("*", (req, res) => {
        res.set("Cache-Control", "public, max-age=" + 60 * 60 * 24);
        res.set("content-type", "text/html");
        if (req.url.startsWith("/invite"))
            return res.send(html.replace("9b2b7f0632acd0c5e781", "9f24f709a3de09b67c49"));
        res.send(html);
    });
}
exports.default = TestClient;
