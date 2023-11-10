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
exports.getGifApiKey = exports.parseGifResult = void 0;
const express_1 = require("express");
const node_fetch_1 = __importDefault(require("node-fetch"));
const proxy_agent_1 = __importDefault(require("proxy-agent"));
const api_1 = require("../../index");
const util_1 = require("../../../../util/src/index");
const lambert_server_1 = require("lambert-server");
const router = (0, express_1.Router)();
function parseGifResult(result) {
    return {
        id: result.id,
        title: result.title,
        url: result.itemurl,
        src: result.media[0].mp4.url,
        gif_src: result.media[0].gif.url,
        width: result.media[0].mp4.dims[0],
        height: result.media[0].mp4.dims[1],
        preview: result.media[0].mp4.preview
    };
}
exports.parseGifResult = parseGifResult;
function getGifApiKey() {
    const { enabled, provider, apiKey } = util_1.Config.get().gif;
    if (!enabled)
        throw new lambert_server_1.HTTPError(`Gifs are disabled`);
    if (provider !== "tenor" || !apiKey)
        throw new lambert_server_1.HTTPError(`${provider} gif provider not supported`);
    return apiKey;
}
exports.getGifApiKey = getGifApiKey;
router.get("/", (0, api_1.route)({}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // TODO: Custom providers
    // TODO: return gifs as mp4
    const { media_format, locale } = req.query;
    const apiKey = getGifApiKey();
    const agent = new proxy_agent_1.default();
    const [responseSource, trendGifSource] = yield Promise.all([
        (0, node_fetch_1.default)(`https://g.tenor.com/v1/categories?locale=${locale}&key=${apiKey}`, {
            agent,
            method: "get",
            headers: { "Content-Type": "application/json" }
        }),
        (0, node_fetch_1.default)(`https://g.tenor.com/v1/trending?locale=${locale}&key=${apiKey}`, {
            agent,
            method: "get",
            headers: { "Content-Type": "application/json" }
        })
    ]);
    const { tags } = yield responseSource.json();
    const { results } = yield trendGifSource.json();
    res.json({
        categories: tags.map((x) => ({ name: x.searchterm, src: x.image })),
        gifs: [parseGifResult(results[0])]
    }).status(200);
}));
exports.default = router;
