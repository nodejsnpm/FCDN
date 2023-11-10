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
const util_1 = require("../../../../../../../../../util/src/index");
const api_1 = require("../../../../../../../index");
const express_1 = require("express");
const router = (0, express_1.Router)();
router.delete("/", (0, api_1.route)({ permission: "MANAGE_ROLES" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { guild_id, role_id, member_id } = req.params;
    yield util_1.Member.removeRole(member_id, guild_id, role_id);
    res.sendStatus(204);
}));
router.put("/", (0, api_1.route)({ permission: "MANAGE_ROLES" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { guild_id, role_id, member_id } = req.params;
    yield util_1.Member.addRole(member_id, guild_id, role_id);
    res.sendStatus(204);
}));
exports.default = router;
