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
exports.Config = void 0;
require("missing-native-js-functions");
const Config_1 = require("../entities/Config");
// TODO: yaml instead of json
// const overridePath = path.join(process.cwd(), "config.json");
var config;
var pairs;
// TODO: use events to inform about config updates
// Config keys are separated with _
exports.Config = {
    init: function init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (config)
                return config;
            pairs = yield Config_1.ConfigEntity.find();
            config = pairsToConfig(pairs);
            config = (config || {}).merge(Config_1.DefaultConfigOptions);
            // try {
            // 	const overrideConfig = JSON.parse(fs.readFileSync(overridePath, { encoding: "utf8" }));
            // 	config = overrideConfig.merge(config);
            // } catch (error) {
            // 	fs.writeFileSync(overridePath, JSON.stringify(config, null, 4));
            // }
            return this.set(config);
        });
    },
    get: function get() {
        return config;
    },
    set: function set(val) {
        if (!config || !val)
            return;
        config = val.merge(config);
        return applyConfig(config);
    },
};
function applyConfig(val) {
    function apply(obj, key = "") {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof obj === "object" && obj !== null)
                return Promise.all(Object.keys(obj).map((k) => apply(obj[k], key ? `${key}_${k}` : k)));
            let pair = pairs.find((x) => x.key === key);
            if (!pair)
                pair = new Config_1.ConfigEntity();
            pair.key = key;
            pair.value = obj;
            return pair.save();
        });
    }
    // fs.writeFileSync(overridePath, JSON.stringify(val, null, 4));
    return apply(val);
}
function pairsToConfig(pairs) {
    var value = {};
    pairs.forEach((p) => {
        var _a;
        const keys = p.key.split("_");
        let obj = value;
        let prev = "";
        let prevObj = obj;
        let i = 0;
        for (const key of keys) {
            if (!isNaN(Number(key)) && !((_a = prevObj[prev]) === null || _a === void 0 ? void 0 : _a.length))
                prevObj[prev] = obj = [];
            if (i++ === keys.length - 1)
                obj[key] = p.value;
            else if (!obj[key])
                obj[key] = {};
            prev = key;
            prevObj = obj;
            obj = obj[key];
        }
    });
    return value;
}
