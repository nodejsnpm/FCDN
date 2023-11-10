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
exports.initTranslation = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const i18next_1 = __importDefault(require("i18next"));
const i18next_http_middleware_1 = __importDefault(require("i18next-http-middleware"));
const i18next_node_fs_backend_1 = __importDefault(require("i18next-node-fs-backend"));
function initTranslation(router) {
    return __awaiter(this, void 0, void 0, function* () {
        const languages = fs_1.default.readdirSync(path_1.default.join(__dirname, "..", "..", "locales"));
        const namespaces = fs_1.default.readdirSync(path_1.default.join(__dirname, "..", "..", "locales", "en"));
        const ns = namespaces.filter((x) => x.endsWith(".json")).map((x) => x.slice(0, x.length - 5));
        yield i18next_1.default
            .use(i18next_node_fs_backend_1.default)
            .use(i18next_http_middleware_1.default.LanguageDetector)
            .init({
            preload: languages,
            // debug: true,
            fallbackLng: "en",
            ns,
            backend: {
                loadPath: __dirname + "/../../locales/{{lng}}/{{ns}}.json"
            },
            load: "all"
        });
        router.use(i18next_http_middleware_1.default.handle(i18next_1.default, {}));
    });
}
exports.initTranslation = initTranslation;
