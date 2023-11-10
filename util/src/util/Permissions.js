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
exports.getPermission = exports.Permissions = void 0;
// https://github.com/discordjs/discord.js/blob/master/src/util/Permissions.js
// Apache License Version 2.0 Copyright 2015 - 2021 Amish Shah
const entities_1 = require("../entities");
const BitField_1 = require("./BitField");
require("missing-native-js-functions");
const BitField_2 = require("./BitField");
var HTTPError;
try {
    HTTPError = require("lambert-server").HTTPError;
}
catch (e) {
    HTTPError = Error;
}
// BigInt doesn't have a bit limit (https://stackoverflow.com/questions/53335545/whats-the-biggest-bigint-value-in-js-as-per-spec)
const CUSTOM_PERMISSION_OFFSET = BigInt(1) << BigInt(64); // 27 permission bits left for discord to add new ones
class Permissions extends BitField_1.BitField {
    constructor(bits = 0) {
        super(bits);
        this.cache = {};
        if (this.bitfield & Permissions.FLAGS.ADMINISTRATOR) {
            this.bitfield = ALL_PERMISSIONS;
        }
    }
    any(permission, checkAdmin = true) {
        return (checkAdmin && super.any(Permissions.FLAGS.ADMINISTRATOR)) || super.any(permission);
    }
    /**
     * Checks whether the bitfield has a permission, or multiple permissions.
     */
    has(permission, checkAdmin = true) {
        return (checkAdmin && super.has(Permissions.FLAGS.ADMINISTRATOR)) || super.has(permission);
    }
    /**
     * Checks whether the bitfield has a permission, or multiple permissions, but throws an Error if user fails to match auth criteria.
     */
    hasThrow(permission) {
        if (this.has(permission) && this.has("VIEW_CHANNEL"))
            return true;
        // @ts-ignore
        throw new HTTPError(`You are missing the following permissions ${permission}`, 403);
    }
    overwriteChannel(overwrites) {
        if (!overwrites)
            return this;
        if (!this.cache)
            throw new Error("permission chache not available");
        overwrites = overwrites.filter((x) => {
            var _a;
            if (x.type === 0 && ((_a = this.cache.roles) === null || _a === void 0 ? void 0 : _a.some((r) => r.id === x.id)))
                return true;
            if (x.type === 1 && x.id == this.cache.user_id)
                return true;
            return false;
        });
        return new Permissions(Permissions.channelPermission(overwrites, this.bitfield));
    }
    static channelPermission(overwrites, init) {
        // TODO: do not deny any permissions if admin
        return overwrites.reduce((permission, overwrite) => {
            // apply disallowed permission
            // * permission: current calculated permission (e.g. 010)
            // * deny contains all denied permissions (e.g. 011)
            // * allow contains all explicitly allowed permisions (e.g. 100)
            return (permission & ~BigInt(overwrite.deny)) | BigInt(overwrite.allow);
            // ~ operator inverts deny (e.g. 011 -> 100)
            // & operator only allows 1 for both ~deny and permission (e.g. 010 & 100 -> 000)
            // | operators adds both together (e.g. 000 + 100 -> 100)
        }, init || BigInt(0));
    }
    static rolePermission(roles) {
        // adds all permissions of all roles together (Bit OR)
        return roles.reduce((permission, role) => permission | BigInt(role.permissions), BigInt(0));
    }
    static finalPermission({ user, guild, channel, }) {
        if (user.id === "0")
            return new Permissions("ADMINISTRATOR"); // system user id
        let roles = guild.roles.filter((x) => user.roles.includes(x.id));
        let permission = Permissions.rolePermission(roles);
        if (channel === null || channel === void 0 ? void 0 : channel.overwrites) {
            let overwrites = channel.overwrites.filter((x) => {
                if (x.type === 0 && user.roles.includes(x.id))
                    return true;
                if (x.type === 1 && x.id == user.id)
                    return true;
                return false;
            });
            permission = Permissions.channelPermission(overwrites, permission);
        }
        if (channel === null || channel === void 0 ? void 0 : channel.recipient_ids) {
            if ((channel === null || channel === void 0 ? void 0 : channel.owner_id) === user.id)
                return new Permissions("ADMINISTRATOR");
            if (channel.recipient_ids.includes(user.id)) {
                // Default dm permissions
                return new Permissions([
                    "VIEW_CHANNEL",
                    "SEND_MESSAGES",
                    "STREAM",
                    "ADD_REACTIONS",
                    "EMBED_LINKS",
                    "ATTACH_FILES",
                    "READ_MESSAGE_HISTORY",
                    "MENTION_EVERYONE",
                    "USE_EXTERNAL_EMOJIS",
                    "CONNECT",
                    "SPEAK",
                    "MANAGE_CHANNELS",
                ]);
            }
            return new Permissions();
        }
        return new Permissions(permission);
    }
}
exports.Permissions = Permissions;
Permissions.FLAGS = {
    CREATE_INSTANT_INVITE: (0, BitField_2.BitFlag)(0),
    KICK_MEMBERS: (0, BitField_2.BitFlag)(1),
    BAN_MEMBERS: (0, BitField_2.BitFlag)(2),
    ADMINISTRATOR: (0, BitField_2.BitFlag)(3),
    MANAGE_CHANNELS: (0, BitField_2.BitFlag)(4),
    MANAGE_GUILD: (0, BitField_2.BitFlag)(5),
    ADD_REACTIONS: (0, BitField_2.BitFlag)(6),
    VIEW_AUDIT_LOG: (0, BitField_2.BitFlag)(7),
    PRIORITY_SPEAKER: (0, BitField_2.BitFlag)(8),
    STREAM: (0, BitField_2.BitFlag)(9),
    VIEW_CHANNEL: (0, BitField_2.BitFlag)(10),
    SEND_MESSAGES: (0, BitField_2.BitFlag)(11),
    SEND_TTS_MESSAGES: (0, BitField_2.BitFlag)(12),
    MANAGE_MESSAGES: (0, BitField_2.BitFlag)(13),
    EMBED_LINKS: (0, BitField_2.BitFlag)(14),
    ATTACH_FILES: (0, BitField_2.BitFlag)(15),
    READ_MESSAGE_HISTORY: (0, BitField_2.BitFlag)(16),
    MENTION_EVERYONE: (0, BitField_2.BitFlag)(17),
    USE_EXTERNAL_EMOJIS: (0, BitField_2.BitFlag)(18),
    VIEW_GUILD_INSIGHTS: (0, BitField_2.BitFlag)(19),
    CONNECT: (0, BitField_2.BitFlag)(20),
    SPEAK: (0, BitField_2.BitFlag)(21),
    MUTE_MEMBERS: (0, BitField_2.BitFlag)(22),
    DEAFEN_MEMBERS: (0, BitField_2.BitFlag)(23),
    MOVE_MEMBERS: (0, BitField_2.BitFlag)(24),
    USE_VAD: (0, BitField_2.BitFlag)(25),
    CHANGE_NICKNAME: (0, BitField_2.BitFlag)(26),
    MANAGE_NICKNAMES: (0, BitField_2.BitFlag)(27),
    MANAGE_ROLES: (0, BitField_2.BitFlag)(28),
    MANAGE_WEBHOOKS: (0, BitField_2.BitFlag)(29),
    MANAGE_EMOJIS_AND_STICKERS: (0, BitField_2.BitFlag)(30),
    USE_APPLICATION_COMMANDS: (0, BitField_2.BitFlag)(31),
    REQUEST_TO_SPEAK: (0, BitField_2.BitFlag)(32),
    // TODO: what is permission 33?
    MANAGE_THREADS: (0, BitField_2.BitFlag)(34),
    USE_PUBLIC_THREADS: (0, BitField_2.BitFlag)(35),
    USE_PRIVATE_THREADS: (0, BitField_2.BitFlag)(36),
    USE_EXTERNAL_STICKERS: (0, BitField_2.BitFlag)(37),
    /**
     * CUSTOM PERMISSIONS ideas:
     * - allow user to dm members
     * - allow user to pin messages (without MANAGE_MESSAGES)
     * - allow user to publish messages (without MANAGE_MESSAGES)
     */
    // CUSTOM_PERMISSION: BigInt(1) << BigInt(0) + CUSTOM_PERMISSION_OFFSET
};
const ALL_PERMISSIONS = Object.values(Permissions.FLAGS).reduce((total, val) => total | val, BigInt(0));
function getPermission(user_id, guild_id, channel_id, opts = {}) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (!user_id)
            throw new HTTPError("User not found");
        var channel;
        var member;
        var guild;
        if (channel_id) {
            channel = yield entities_1.Channel.findOneOrFail({
                where: { id: channel_id },
                relations: ["recipients", ...(opts.channel_relations || [])],
                select: [
                    "id",
                    "recipients",
                    "permission_overwrites",
                    "owner_id",
                    "guild_id",
                    // @ts-ignore
                    ...(opts.channel_select || []),
                ],
            });
            if (channel.guild_id)
                guild_id = channel.guild_id; // derive guild_id from the channel
        }
        if (guild_id) {
            guild = yield entities_1.Guild.findOneOrFail({
                where: { id: guild_id },
                select: [
                    "id",
                    "owner_id",
                    // @ts-ignore
                    ...(opts.guild_select || []),
                ],
                relations: opts.guild_relations,
            });
            if (guild.owner_id === user_id)
                return new Permissions(Permissions.FLAGS.ADMINISTRATOR);
            member = yield entities_1.Member.findOneOrFail({
                where: { guild_id, id: user_id },
                relations: ["roles", ...(opts.member_relations || [])],
                select: [
                    "id",
                    "roles",
                    // @ts-ignore
                    ...(opts.member_select || []),
                ],
            });
        }
        let recipient_ids = (_a = channel === null || channel === void 0 ? void 0 : channel.recipients) === null || _a === void 0 ? void 0 : _a.map((x) => x.user_id);
        if (!(recipient_ids === null || recipient_ids === void 0 ? void 0 : recipient_ids.length))
            recipient_ids = null;
        // TODO: remove guild.roles and convert recipient_ids to recipients
        var permission = Permissions.finalPermission({
            user: {
                id: user_id,
                roles: (member === null || member === void 0 ? void 0 : member.roles.map((x) => x.id)) || [],
            },
            guild: {
                roles: (member === null || member === void 0 ? void 0 : member.roles) || [],
            },
            channel: {
                overwrites: channel === null || channel === void 0 ? void 0 : channel.permission_overwrites,
                owner_id: channel === null || channel === void 0 ? void 0 : channel.owner_id,
                recipient_ids,
            },
        });
        const obj = new Permissions(permission);
        // pass cache to permission for possible future getPermission calls
        obj.cache = { guild, member, channel, roles: member === null || member === void 0 ? void 0 : member.roles, user_id };
        return obj;
    });
}
exports.getPermission = getPermission;
