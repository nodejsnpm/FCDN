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
const crypto_1 = __importDefault(require("crypto"));
const multer_1 = require("../util/multer");
// TODO: check premium and animated pfp are allowed in the config
// TODO: generate different sizes of icon
// TODO: generate different image types of icon
// TODO: delete old icons
const ANIMATED_MIME_TYPES = ["image/apng", "image/gif", "image/gifv"];
const STATIC_MIME_TYPES = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/svg+xml",
    "image/svg",
];
const ALLOWED_MIME_TYPES = [...ANIMATED_MIME_TYPES, ...STATIC_MIME_TYPES];
const router = (0, express_1.Router)();
router.post("/:user_id", multer_1.multer.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.headers.signature !== util_1.Config.get().security.requestSignature)
        throw new lambert_server_1.HTTPError("Invalid request signature");
    if (!req.file)
        throw new lambert_server_1.HTTPError("Missing file");
    const { buffer, mimetype, size, originalname, fieldname } = req.file;
    const { user_id } = req.params;
    var hash = crypto_1.default
        .createHash("md5")
        .update(util_1.Snowflake.generate())
        .digest("hex");
    const type = yield file_type_1.default.fromBuffer(buffer);
    if (!type || !ALLOWED_MIME_TYPES.includes(type.mime))
        throw new lambert_server_1.HTTPError("Invalid file type");
    if (ANIMATED_MIME_TYPES.includes(type.mime))
        hash = `a_${hash}`; // animated icons have a_ infront of the hash
    const path = `avatars/${user_id}/${hash}`;
    const endpoint = util_1.Config.get().cdn.endpointPublic || "http://localhost:3003";
    yield Storage_1.storage.set(path, buffer);
    return res.json({
        id: hash,
        content_type: type.mime,
        size,
        url: `${endpoint}${req.baseUrl}/${user_id}/${hash}`,
    });
}));
router.get("/:user_id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { user_id } = req.params;
    user_id = user_id.split(".")[0]; // remove .file extension
    const path = `avatars/${user_id}`;
    const file = yield Storage_1.storage.get(path);
    if (!file)
        throw new lambert_server_1.HTTPError("not found", 404);
    const type = yield file_type_1.default.fromBuffer(file);
    res.set("Content-Type", type === null || type === void 0 ? void 0 : type.mime);
    res.set("Cache-Control", "public, max-age=31536000");
    return res.send(file);
}));
router.get("/:user_id/:hash", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { user_id, hash } = req.params;
    hash = hash.split(".")[0]; // remove .file extension
    const path = `avatars/${user_id}/${hash}`;
    const file = yield Storage_1.storage.get(path);
    if (!file)
        throw new lambert_server_1.HTTPError("not found", 404);
    const type = yield file_type_1.default.fromBuffer(file);
    res.set("Content-Type", type === null || type === void 0 ? void 0 : type.mime);
    res.set("Cache-Control", "public, max-age=31536000");
    return res.send(file);
}));
router.delete("/:user_id/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.headers.signature !== util_1.Config.get().security.requestSignature)
        throw new lambert_server_1.HTTPError("Invalid request signature");
    const { user_id, id } = req.params;
    const path = `avatars/${user_id}/${id}`;
    yield Storage_1.storage.delete(path);
    return res.send({ success: true });
}));
exports.default = router;
