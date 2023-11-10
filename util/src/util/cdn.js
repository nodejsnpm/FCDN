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
exports.deleteFile = exports.handleFile = exports.uploadFile = void 0;
const form_data_1 = __importDefault(require("form-data"));
const lambert_server_1 = require("lambert-server");
const node_fetch_1 = __importDefault(require("node-fetch"));
const Config_1 = require("./Config");
function uploadFile(path, file) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(file === null || file === void 0 ? void 0 : file.buffer))
            throw new lambert_server_1.HTTPError("Missing file in body");
        const form = new form_data_1.default();
        form.append("file", file.buffer, {
            contentType: file.mimetype,
            filename: file.originalname,
        });
        const response = yield (0, node_fetch_1.default)(`${Config_1.Config.get().cdn.endpointPrivate || "http://localhost:3003"}${path}`, {
            headers: Object.assign({ signature: Config_1.Config.get().security.requestSignature }, form.getHeaders()),
            method: "POST",
            body: form,
        });
        const result = yield response.json();
        if (response.status !== 200)
            throw result;
        return result;
    });
}
exports.uploadFile = uploadFile;
function handleFile(path, body) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!body || !body.startsWith("data:"))
            return undefined;
        try {
            const mimetype = body.split(":")[1].split(";")[0];
            const buffer = Buffer.from(body.split(",")[1], "base64");
            // @ts-ignore
            const { id } = yield uploadFile(path, { buffer, mimetype, originalname: "banner" });
            return id;
        }
        catch (error) {
            console.error(error);
            throw new lambert_server_1.HTTPError("Invalid " + path);
        }
    });
}
exports.handleFile = handleFile;
function deleteFile(path) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield (0, node_fetch_1.default)(`${Config_1.Config.get().cdn.endpointPrivate || "http://localhost:3003"}${path}`, {
            headers: {
                signature: Config_1.Config.get().security.requestSignature,
            },
            method: "DELETE",
        });
        const result = yield response.json();
        if (response.status !== 200)
            throw result;
        return result;
    });
}
exports.deleteFile = deleteFile;
