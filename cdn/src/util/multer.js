"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multer = void 0;
const multer_1 = __importDefault(require("multer"));
exports.multer = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fields: 10,
        files: 10,
        fileSize: 1024 * 1024 * 100, // 100 mb
    },
});
