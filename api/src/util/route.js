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
exports.route = exports.ajv = void 0;
const util_1 = require("../../../util/src/index");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
const SchemaPath = path_1.default.join(__dirname, "..", "..", "assets", "schemas.json");
const schemas = JSON.parse(fs_1.default.readFileSync(SchemaPath, { encoding: "utf8" }));
exports.ajv = new ajv_1.default({
    allErrors: true,
    parseDate: true,
    allowDate: true,
    schemas,
    coerceTypes: true,
    messages: true,
    strict: true,
    strictRequired: true
});
(0, ajv_formats_1.default)(exports.ajv);
// Normalizer is introduced to workaround https://github.com/ajv-validator/ajv/issues/1287
// this removes null values as ajv doesn't treat them as undefined
// normalizeBody allows to handle circular structures without issues
// taken from https://github.com/serverless/serverless/blob/master/lib/classes/ConfigSchemaHandler/index.js#L30 (MIT license)
const normalizeBody = (body = {}) => {
    const normalizedObjectsSet = new WeakSet();
    const normalizeObject = (object) => {
        if (normalizedObjectsSet.has(object))
            return;
        normalizedObjectsSet.add(object);
        if (Array.isArray(object)) {
            for (const [index, value] of object.entries()) {
                if (typeof value === "object")
                    normalizeObject(value);
            }
        }
        else {
            for (const [key, value] of Object.entries(object)) {
                if (value == null) {
                    if (key === "icon" || key === "avatar" || key === "banner" || key === "splash")
                        continue;
                    delete object[key];
                }
                else if (typeof value === "object") {
                    normalizeObject(value);
                }
            }
        }
    };
    normalizeObject(body);
    return body;
};
function route(opts) {
    var validate;
    if (opts.body) {
        validate = exports.ajv.getSchema(opts.body);
        if (!validate)
            throw new Error(`Body schema ${opts.body} not found`);
    }
    return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (opts.permission) {
            const required = new util_1.Permissions(opts.permission);
            req.permission = yield (0, util_1.getPermission)(req.user_id, req.params.guild_id, req.params.channel_id);
            // bitfield comparison: check if user lacks certain permission
            if (!req.permission.has(required)) {
                throw util_1.DiscordApiErrors.MISSING_PERMISSIONS.withParams(opts.permission);
            }
        }
        if (opts.right) {
            const required = new util_1.Rights(opts.right);
            if (!req.rights || !req.rights.has(required)) {
                throw util_1.FosscordApiErrors.MISSING_RIGHTS.withParams(opts.right);
            }
        }
        if (validate) {
            const valid = validate(normalizeBody(req.body));
            if (!valid) {
                const fields = {};
                (_a = validate.errors) === null || _a === void 0 ? void 0 : _a.forEach((x) => (fields[x.instancePath.slice(1)] = { code: x.keyword, message: x.message || "" }));
                throw (0, util_1.FieldErrors)(fields);
            }
        }
        next();
    });
}
exports.route = route;
