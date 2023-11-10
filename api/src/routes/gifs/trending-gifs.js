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
const node_fetch_1 = __importDefault(require("node-fetch"));
const proxy_agent_1 = __importDefault(require("proxy-agent"));
const api_1 = require("../../index");
const trending_1 = require("./trending");
const router = (0, express_1.Router)();
router.get("/", (0, api_1.route)({}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // TODO: Custom providers
    const { media_format, locale } = req.query;
    const apiKey = (0, trending_1.getGifApiKey)();
    const agent = new proxy_agent_1.default();
    const response = yield (0, node_fetch_1.default)(`https://g.tenor.com/v1/trending?media_format=${media_format}&locale=${locale}&key=${apiKey}`, {
        agent,
        method: "get",
        headers: { "Content-Type": "application/json" }
    });
    const { results } = yield response.json();
    res.json(results.map(trending_1.parseGifResult)).status(200);
}));
exports.default = router;
