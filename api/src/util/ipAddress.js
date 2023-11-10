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
exports.distanceBetweenLocations = exports.getIpAdress = exports.isProxy = exports.IPAnalysis = void 0;
const util_1 = require("../../../util/src/index");
// use ipdata package instead of simple fetch because of integrated caching
const node_fetch_1 = __importDefault(require("node-fetch"));
const exampleData = {
    ip: "",
    is_eu: true,
    city: "",
    region: "",
    region_code: "",
    country_name: "",
    country_code: "",
    continent_name: "",
    continent_code: "",
    latitude: 0,
    longitude: 0,
    postal: "",
    calling_code: "",
    flag: "",
    emoji_flag: "",
    emoji_unicode: "",
    asn: {
        asn: "",
        name: "",
        domain: "",
        route: "",
        type: "isp"
    },
    languages: [
        {
            name: "",
            native: ""
        }
    ],
    currency: {
        name: "",
        code: "",
        symbol: "",
        native: "",
        plural: ""
    },
    time_zone: {
        name: "",
        abbr: "",
        offset: "",
        is_dst: true,
        current_time: ""
    },
    threat: {
        is_tor: false,
        is_proxy: false,
        is_anonymous: false,
        is_known_attacker: false,
        is_known_abuser: false,
        is_threat: false,
        is_bogon: false
    },
    count: 0,
    status: 200
};
//TODO add function that support both ip and domain names
function IPAnalysis(ip) {
    return __awaiter(this, void 0, void 0, function* () {
        const { ipdataApiKey } = util_1.Config.get().security;
        if (!ipdataApiKey)
            return Object.assign(Object.assign({}, exampleData), { ip });
        return (yield (0, node_fetch_1.default)(`https://api.ipdata.co/${ip}?api-key=${ipdataApiKey}`)).json();
    });
}
exports.IPAnalysis = IPAnalysis;
function isProxy(data) {
    if (!data || !data.asn || !data.threat)
        return false;
    if (data.asn.type !== "isp")
        return true;
    if (Object.values(data.threat).some((x) => x))
        return true;
    return false;
}
exports.isProxy = isProxy;
function getIpAdress(req) {
    // @ts-ignore
    return req.headers[util_1.Config.get().security.forwadedFor] || req.socket.remoteAddress;
}
exports.getIpAdress = getIpAdress;
function distanceBetweenLocations(loc1, loc2) {
    return distanceBetweenCoords(loc1.latitude, loc1.longitude, loc2.latitude, loc2.longitude);
}
exports.distanceBetweenLocations = distanceBetweenLocations;
//Haversine function
function distanceBetweenCoords(lat1, lon1, lat2, lon2) {
    const p = 0.017453292519943295; // Math.PI / 180
    const c = Math.cos;
    const a = 0.5 - c((lat2 - lat1) * p) / 2 + (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;
    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}
