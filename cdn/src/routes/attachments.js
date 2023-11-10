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
const util_1 = require("../../../util/src/index");
const Storage_1 = require("../util/Storage");
const file_type_1 = __importDefault(require("file-type"));
const lambert_server_1 = require("lambert-server");
const multer_1 = require("../util/multer");
const image_size_1 = __importDefault(require("image-size"));
const router = (0, express_1.Router)();
const SANITIZED_CONTENT_TYPE = [
    "text/html",
    "text/mhtml",
    "multipart/related",
    "application/xhtml+xml",
];
router.post("/:channel_id", multer_1.multer.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (req.headers.signature !== util_1.Config.get().security.requestSignature)
        throw new lambert_server_1.HTTPError("Invalid request signature");
    if (!req.file)
        throw new lambert_server_1.HTTPError("file missing");
    const { buffer, mimetype, size, originalname, fieldname } = req.file;
    const { channel_id } = req.params;
    const filename = originalname
        .replaceAll(" ", "_")
        .replace(/[^a-zA-Z0-9._]+/g, "");
    const id = util_1.Snowflake.generate();
    const path = `attachments/${channel_id}/${id}/${filename}`;
    const endpoint = ((_a = util_1.Config.get()) === null || _a === void 0 ? void 0 : _a.cdn.endpointPublic) || "http://localhost:3003";
    yield Storage_1.storage.set(path, buffer);
    var width;
    var height;
    if (mimetype.includes("image")) {
        const dimensions = (0, image_size_1.default)(buffer);
        if (dimensions) {
            width = dimensions.width;
            height = dimensions.height;
        }
    }
    const file = {
        id,
        content_type: mimetype,
        filename: filename,
        size,
        url: `${endpoint}/${path}`,
        width,
        height,
    };
    return res.json(file);
}));
router.get("/:channel_id/:id/:filename", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { channel_id, id, filename } = req.params;
    const file = yield Storage_1.storage.get(`attachments/${channel_id}/${id}/${filename}`);
    if (!file)
        throw new lambert_server_1.HTTPError("File not found");
    const type = yield file_type_1.default.fromBuffer(file);
    let content_type = (type === null || type === void 0 ? void 0 : type.mime) || "application/octet-stream";
    if (SANITIZED_CONTENT_TYPE.includes(content_type)) {
        content_type = "application/octet-stream";
    }
    res.set("Content-Type", content_type);
    res.set("Cache-Control", "public, max-age=31536000");
    return res.send(file);
}));
router.delete("/:channel_id/:id/:filename", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.headers.signature !== util_1.Config.get().security.requestSignature)
        throw new lambert_server_1.HTTPError("Invalid request signature");
    const { channel_id, id, filename } = req.params;
    const path = `attachments/${channel_id}/${id}/${filename}`;
    yield Storage_1.storage.delete(path);
    return res.send({ success: true });
}));
exports.default = router;
