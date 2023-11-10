"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = void 0;
const FileStorage_1 = require("./FileStorage");
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const nanocolors_1 = require("nanocolors");
const client_s3_1 = require("@aws-sdk/client-s3");
const S3Storage_1 = require("./S3Storage");
process.cwd();
let storage;
exports.storage = storage;
if (process.env.STORAGE_PROVIDER === "file" || !process.env.STORAGE_PROVIDER) {
    let location = process.env.STORAGE_LOCATION;
    if (location) {
        location = path_1.default.resolve(location);
    }
    else {
        location = path_1.default.join(process.cwd(), "files");
    }
    console.log(`[CDN] storage location: ${(0, nanocolors_1.bgCyan)(`${(0, nanocolors_1.black)(location)}`)}`);
    fs_extra_1.default.ensureDirSync(location);
    process.env.STORAGE_LOCATION = location;
    exports.storage = storage = new FileStorage_1.FileStorage();
}
else if (process.env.STORAGE_PROVIDER === "s3") {
    const region = process.env.STORAGE_REGION, bucket = process.env.STORAGE_BUCKET;
    if (!region) {
        console.error(`[CDN] You must provide a region when using the S3 storage provider.`);
        process.exit(1);
    }
    if (!bucket) {
        console.error(`[CDN] You must provide a bucket when using the S3 storage provider.`);
        process.exit(1);
    }
    // in the S3 provider, this should be the root path in the bucket
    let location = process.env.STORAGE_LOCATION;
    if (!location) {
        console.warn(`[CDN] STORAGE_LOCATION unconfigured for S3 provider, defaulting to the bucket root...`);
        location = undefined;
    }
    const client = new client_s3_1.S3({ region });
    exports.storage = storage = new S3Storage_1.S3Storage(client, bucket, location);
}
