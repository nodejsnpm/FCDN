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
exports.inactiveMembers = void 0;
const express_1 = require("express");
const util_1 = require("../../../../../util/src/index");
const typeorm_1 = require("typeorm");
const api_1 = require("../../../index");
const router = (0, express_1.Router)();
//Returns all inactive members, respecting role hierarchy
const inactiveMembers = (guild_id, user_id, days, roles = []) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    var date = new Date();
    date.setDate(date.getDate() - days);
    //Snowflake should have `generateFromTime` method? Or similar?
    var minId = BigInt(date.valueOf() - util_1.Snowflake.EPOCH) << BigInt(22);
    var members = yield util_1.Member.find({
        where: [
            {
                guild_id,
                last_message_id: (0, typeorm_1.LessThan)(minId.toString())
            },
            {
                last_message_id: (0, typeorm_1.IsNull)()
            }
        ],
        relations: ["roles"]
    });
    console.log(members);
    if (!members.length)
        return [];
    //I'm sure I can do this in the above db query ( and it would probably be better to do so ), but oh well.
    if (roles.length && members.length)
        members = members.filter((user) => { var _a; return (_a = user.roles) === null || _a === void 0 ? void 0 : _a.some((role) => roles.includes(role.id)); });
    const me = yield util_1.Member.findOneOrFail({ id: user_id, guild_id }, { relations: ["roles"] });
    const myHighestRole = Math.max(...(((_a = me.roles) === null || _a === void 0 ? void 0 : _a.map((x) => x.position)) || []));
    const guild = yield util_1.Guild.findOneOrFail({ where: { id: guild_id } });
    members = members.filter((member) => {
        var _a;
        return member.id !== guild.owner_id && //can't kick owner
            ((_a = member.roles) === null || _a === void 0 ? void 0 : _a.some((role) => role.position < myHighestRole || //roles higher than me can't be kicked
                me.id === guild.owner_id //owner can kick anyone
            ));
    });
    return members;
});
exports.inactiveMembers = inactiveMembers;
router.get("/", (0, api_1.route)({ permission: "KICK_MEMBERS" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const days = parseInt(req.query.days);
    var roles = req.query.include_roles;
    if (typeof roles === "string")
        roles = [roles]; //express will return array otherwise
    const members = yield (0, exports.inactiveMembers)(req.params.guild_id, req.user_id, days, roles);
    res.send({ pruned: members.length });
}));
router.post("/", (0, api_1.route)({ permission: "KICK_MEMBERS" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const days = parseInt(req.body.days);
    var roles = req.query.include_roles;
    if (typeof roles === "string")
        roles = [roles];
    const { guild_id } = req.params;
    const members = yield (0, exports.inactiveMembers)(guild_id, req.user_id, days, roles);
    yield Promise.all(members.map((x) => util_1.Member.removeFromGuild(x.id, guild_id)));
    res.send({ purged: members.length });
}));
exports.default = router;
