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
exports.onLazyRequest = void 0;
const util_1 = require("../../../util/src/index");
const LazyRequest_1 = require("../schema/LazyRequest");
const Send_1 = require("../util/Send");
const Constants_1 = require("../util/Constants");
const gateway_1 = require("../index");
const instanceOf_1 = require("./instanceOf");
require("missing-native-js-functions");
const typeorm_1 = require("typeorm");
require("missing-native-js-functions");
// TODO: only show roles/members that have access to this channel
// TODO: config: to list all members (even those who are offline) sorted by role, or just those who are online
// TODO: rewrite typeorm
function getMembers(guild_id, range) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!Array.isArray(range) || range.length !== 2) {
            throw new Error("range is not a valid array");
        }
        // TODO: wait for typeorm to implement ordering for .find queries https://github.com/typeorm/typeorm/issues/2620
        let members = yield (0, typeorm_1.getRepository)(util_1.Member)
            .createQueryBuilder("member")
            .where("member.guild_id = :guild_id", { guild_id })
            .leftJoinAndSelect("member.roles", "role")
            .leftJoinAndSelect("member.user", "user")
            .leftJoinAndSelect("user.sessions", "session")
            .addSelect("CASE WHEN session.status = 'offline' THEN 0 ELSE 1 END", "_status")
            .orderBy("role.position", "DESC")
            .addOrderBy("_status", "DESC")
            .addOrderBy("user.username", "ASC")
            .offset(Number(range[0]) || 0)
            .limit(Number(range[1]) || 100)
            .getMany();
        const groups = [];
        const items = [];
        const member_roles = members
            .map((m) => m.roles)
            .flat()
            .unique((r) => r.id);
        for (const role of member_roles) {
            // @ts-ignore
            const [role_members, other_members] = partition(members, (m) => m.roles.find((r) => r.id === role.id));
            const group = {
                count: role_members.length,
                id: role.id === guild_id ? "online" : role.id,
            };
            items.push({ group });
            groups.push(group);
            for (const member of role_members) {
                const roles = member.roles
                    .filter((x) => x.id !== guild_id)
                    .map((x) => x.id);
                const session = member.user.sessions.first();
                // TODO: properly mock/hide offline/invisible status
                items.push({
                    member: Object.assign(Object.assign({}, member), { roles, user: Object.assign(Object.assign({}, member.user), { sessions: undefined }), presence: Object.assign(Object.assign({}, session), { activities: (session === null || session === void 0 ? void 0 : session.activities) || [], user: { id: member.user.id } }) }),
                });
            }
            members = other_members;
        }
        return {
            items,
            groups,
            range,
            members: items.map((x) => x.member).filter((x) => x),
        };
    });
}
function onLazyRequest({ d }) {
    return __awaiter(this, void 0, void 0, function* () {
        // TODO: check data
        instanceOf_1.check.call(this, LazyRequest_1.LazyRequest, d);
        const { guild_id, typing, channels, activities } = d;
        const channel_id = Object.keys(channels || {}).first();
        if (!channel_id)
            return;
        const permissions = yield (0, util_1.getPermission)(this.user_id, guild_id, channel_id);
        permissions.hasThrow("VIEW_CHANNEL");
        const ranges = channels[channel_id];
        if (!Array.isArray(ranges))
            throw new Error("Not a valid Array");
        const member_count = yield util_1.Member.count({ guild_id });
        const ops = yield Promise.all(ranges.map((x) => getMembers(guild_id, x)));
        // TODO: unsubscribe member_events that are not in op.members
        ops.forEach((op) => {
            op.members.forEach((member) => __awaiter(this, void 0, void 0, function* () {
                if (this.events[member.user.id])
                    return; // already subscribed as friend
                if (this.member_events[member.user.id])
                    return; // already subscribed in member list
                this.member_events[member.user.id] = yield (0, util_1.listenEvent)(member.user.id, gateway_1.handlePresenceUpdate.bind(this), this.listen_options);
            }));
        });
        return (0, Send_1.Send)(this, {
            op: Constants_1.OPCODES.Dispatch,
            s: this.sequence++,
            t: "GUILD_MEMBER_LIST_UPDATE",
            d: {
                ops: ops.map((x) => ({
                    items: x.items,
                    op: "SYNC",
                    range: x.range,
                })),
                online_count: member_count,
                member_count,
                id: "everyone",
                guild_id,
                groups: ops
                    .map((x) => x.groups)
                    .flat()
                    .unique(),
            },
        });
    });
}
exports.onLazyRequest = onLazyRequest;
function partition(array, isValid) {
    // @ts-ignore
    return array.reduce(
    // @ts-ignore
    ([pass, fail], elem) => {
        return isValid(elem)
            ? [[...pass, elem], fail]
            : [pass, [...fail, elem]];
    }, [[], []]);
}
