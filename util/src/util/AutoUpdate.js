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
exports.enableAutoUpdate = void 0;
require("missing-native-js-functions");
const node_fetch_1 = __importDefault(require("node-fetch"));
const proxy_agent_1 = __importDefault(require("proxy-agent"));
const readline_1 = __importDefault(require("readline"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout,
});
function enableAutoUpdate(opts) {
    if (!opts.checkInterval)
        return;
    var interval = 1000 * 60 * 60 * 24;
    if (typeof opts.checkInterval === "number")
        opts.checkInterval = 1000 * interval;
    const i = setInterval(() => __awaiter(this, void 0, void 0, function* () {
        const currentVersion = yield getCurrentVersion(opts.path);
        const latestVersion = yield getLatestVersion(opts.packageJsonLink);
        if (currentVersion !== latestVersion) {
            clearInterval(i);
            console.log(`[Auto Update] Current version (${currentVersion}) is out of date, updating ...`);
            yield download(opts.downloadUrl, opts.path);
        }
    }), interval);
    setImmediate(() => __awaiter(this, void 0, void 0, function* () {
        const currentVersion = yield getCurrentVersion(opts.path);
        const latestVersion = yield getLatestVersion(opts.packageJsonLink);
        if (currentVersion !== latestVersion) {
            rl.question(`[Auto Update] Current version (${currentVersion}) is out of date, would you like to update? (yes/no)`, (answer) => {
                if (answer.toBoolean()) {
                    console.log(`[Auto update] updating ...`);
                    download(opts.downloadUrl, opts.path);
                }
                else {
                    console.log(`[Auto update] aborted`);
                }
            });
        }
    }));
}
exports.enableAutoUpdate = enableAutoUpdate;
function download(url, dir) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // TODO: use file stream instead of buffer (to prevent crash because of high memory usage for big files)
            // TODO check file hash
            const agent = new proxy_agent_1.default();
            const response = yield (0, node_fetch_1.default)(url, { agent });
            const buffer = yield response.buffer();
            const tempDir = yield promises_1.default.mkdtemp("fosscord");
            promises_1.default.writeFile(path_1.default.join(tempDir, "Fosscord.zip"), buffer);
        }
        catch (error) {
            console.error(`[Auto Update] download failed`, error);
        }
    });
}
function getCurrentVersion(dir) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const content = yield promises_1.default.readFile(path_1.default.join(dir, "package.json"), { encoding: "utf8" });
            return JSON.parse(content).version;
        }
        catch (error) {
            throw new Error("[Auto update] couldn't get current version in " + dir);
        }
    });
}
function getLatestVersion(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const agent = new proxy_agent_1.default();
            const response = yield (0, node_fetch_1.default)(url, { agent });
            const content = yield response.json();
            return content.version;
        }
        catch (error) {
            throw new Error("[Auto update] check failed for " + url);
        }
    });
}
