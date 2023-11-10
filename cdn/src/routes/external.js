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
const lambert_server_1 = require("lambert-server");
const util_1 = require("../../../util/src/index");
const Storage_1 = require("../util/Storage");
const file_type_1 = __importDefault(require("file-type"));
const util_2 = require("../../../util/src/index");
// TODO: somehow handle the deletion of images posted to the /external route
const router = (0, express_1.Router)();
const DEFAULT_FETCH_OPTIONS = {
    redirect: "follow",
    follow: 1,
    headers: {
        "user-agent": "Mozilla/5.0 (compatible Fosscordbot/0.1; +https://fosscord.com)",
    },
    size: 1024 * 1024 * 8,
    compress: true,
    method: "GET",
};
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.headers.signature !== util_2.Config.get().security.requestSignature)
        throw new lambert_server_1.HTTPError("Invalid request signature");
    if (!req.body)
        throw new lambert_server_1.HTTPError("Invalid Body");
    const { url } = req.body;
    if (!url || typeof url !== "string")
        throw new lambert_server_1.HTTPError("Invalid url");
    const id = util_1.Snowflake.generate();
    try {
        const response = yield (0, node_fetch_1.default)(url, DEFAULT_FETCH_OPTIONS);
        const buffer = yield response.buffer();
        yield Storage_1.storage.set(`/external/${id}`, buffer);
        res.send({ id });
    }
    catch (error) {
        throw new lambert_server_1.HTTPError("Couldn't fetch website");
    }
}));
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const file = yield Storage_1.storage.get(`/external/${id}`);
    if (!file)
        throw new lambert_server_1.HTTPError("File not found");
    const result = yield file_type_1.default.fromBuffer(file);
    res.set("Content-Type", result === null || result === void 0 ? void 0 : result.mime);
    return res.send(file);
}));
exports.default = router;
