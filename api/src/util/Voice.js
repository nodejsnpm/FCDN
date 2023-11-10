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
exports.getVoiceRegions = void 0;
const util_1 = require("../../../util/src/index");
const ipAddress_1 = require("./ipAddress");
function getVoiceRegions(ipAddress, vip) {
    return __awaiter(this, void 0, void 0, function* () {
        const regions = util_1.Config.get().regions;
        const availableRegions = regions.available.filter((ar) => (vip ? true : !ar.vip));
        let optimalId = regions.default;
        if (!regions.useDefaultAsOptimal) {
            const clientIpAnalysis = yield (0, ipAddress_1.IPAnalysis)(ipAddress);
            let min = Number.POSITIVE_INFINITY;
            for (let ar of availableRegions) {
                //TODO the endpoint location should be saved in the database if not already present to prevent IPAnalysis call
                const dist = (0, ipAddress_1.distanceBetweenLocations)(clientIpAnalysis, ar.location || (yield (0, ipAddress_1.IPAnalysis)(ar.endpoint)));
                if (dist < min) {
                    min = dist;
                    optimalId = ar.id;
                }
            }
        }
        return availableRegions.map((ar) => ({
            id: ar.id,
            name: ar.name,
            custom: ar.custom,
            deprecated: ar.deprecated,
            optimal: ar.id === optimalId
        }));
    });
}
exports.getVoiceRegions = getVoiceRegions;
