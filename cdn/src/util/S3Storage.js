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
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Storage = void 0;
const readableToBuffer = (readable) => new Promise((resolve, reject) => {
    const chunks = [];
    readable.on("data", (chunk) => chunks.push(chunk));
    readable.on("error", reject);
    readable.on("end", () => resolve(Buffer.concat(chunks)));
});
class S3Storage {
    constructor(client, bucket, basePath) {
        this.client = client;
        this.bucket = bucket;
        this.basePath = basePath;
    }
    /**
     * Always return a string, to ensure consistency.
     */
    get bucketBasePath() {
        var _a;
        return (_a = this.basePath) !== null && _a !== void 0 ? _a : "";
    }
    set(path, data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.putObject({
                Bucket: this.bucket,
                Key: `${this.bucketBasePath}${path}`,
                Body: data,
            });
        });
    }
    get(path) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const s3Object = yield this.client.getObject({
                    Bucket: this.bucket,
                    Key: `${(_a = this.bucketBasePath) !== null && _a !== void 0 ? _a : ""}${path}`,
                });
                if (!s3Object.Body)
                    return null;
                const body = s3Object.Body;
                return yield readableToBuffer(body);
            }
            catch (err) {
                console.error(`[CDN] Unable to get S3 object at path ${path}.`);
                console.error(err);
                return null;
            }
        });
    }
    delete(path) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.deleteObject({
                Bucket: this.bucket,
                Key: `${this.bucketBasePath}${path}`,
            });
        });
    }
}
exports.S3Storage = S3Storage;
