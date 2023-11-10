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
exports.FileStorage = void 0;
const fs_1 = __importDefault(require("fs"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = require("path");
require("missing-native-js-functions");
const stream_1 = require("stream");
const ExifTransformer = require("exif-be-gone");
// TODO: split stored files into separate folders named after cloned route
function getPath(path) {
    // STORAGE_LOCATION has a default value in start.ts
    const root = process.env.STORAGE_LOCATION || "../";
    var filename = (0, path_1.join)(root, path);
    if (path.indexOf("\0") !== -1 || !filename.startsWith(root))
        throw new Error("invalid path");
    return filename;
}
class FileStorage {
    get(path) {
        return __awaiter(this, void 0, void 0, function* () {
            path = getPath(path);
            try {
                return fs_1.default.readFileSync(path);
            }
            catch (error) {
                try {
                    const files = fs_1.default.readdirSync(path);
                    if (!files.length)
                        return null;
                    return fs_1.default.readFileSync((0, path_1.join)(path, files[0]));
                }
                catch (error) {
                    return null;
                }
            }
        });
    }
    set(path, value) {
        return __awaiter(this, void 0, void 0, function* () {
            path = getPath(path);
            fs_extra_1.default.ensureDirSync((0, path_1.dirname)(path));
            value = stream_1.Readable.from(value);
            const cleaned_file = fs_1.default.createWriteStream(path);
            return value.pipe(new ExifTransformer()).pipe(cleaned_file);
        });
    }
    delete(path) {
        return __awaiter(this, void 0, void 0, function* () {
            //TODO we should delete the parent directory if empty
            fs_1.default.unlinkSync(getPath(path));
        });
    }
}
exports.FileStorage = FileStorage;
