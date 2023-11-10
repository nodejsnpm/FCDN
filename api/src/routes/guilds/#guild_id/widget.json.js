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
const express_1 = require("express");
const util_1 = require("../../../../../util/src/index");
const lambert_server_1 = require("lambert-server");
const api_1 = require("../../../index");
const router = (0, express_1.Router)();
// Undocumented API notes:
// An invite is created for the widget_channel_id on request (only if an existing one created by the widget doesn't already exist)
// This invite created doesn't include an inviter object like user created ones and has a default expiry of 24 hours
// Missing user object information is intentional (https://github.com/discord/discord-api-docs/issues/1287)
// channels returns voice channel objects where @everyone has the CONNECT permission
// members (max 100 returned) is a sample of all members, and bots par invisible status, there exists some alphabetical distribution pattern between the members returned
// https://discord.com/developers/docs/resources/guild#get-guild-widget
// TODO: Cache the response for a guild for 5 minutes regardless of response
router.get("/", (0, api_1.route)({}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { guild_id } = req.params;
    const guild = yield util_1.Guild.findOneOrFail({ id: guild_id });
    if (!guild.widget_enabled)
        throw new lambert_server_1.HTTPError("Widget Disabled", 404);
    // Fetch existing widget invite for widget channel
    var invite = yield util_1.Invite.findOne({ channel_id: guild.widget_channel_id });
    if (guild.widget_channel_id && !invite) {
        // Create invite for channel if none exists
        // TODO: Refactor invite create code to a shared function
        const max_age = 86400; // 24 hours
        const expires_at = new Date(max_age * 1000 + Date.now());
        const body = {
            code: (0, api_1.random)(),
            temporary: false,
            uses: 0,
            max_uses: 0,
            max_age: max_age,
            expires_at,
            created_at: new Date(),
            guild_id,
            channel_id: guild.widget_channel_id,
            inviter_id: null
        };
        invite = yield new util_1.Invite(body).save();
    }
    // Fetch voice channels, and the @everyone permissions object
    const channels = [];
    (yield util_1.Channel.find({ where: { guild_id: guild_id, type: 2 }, order: { position: "ASC" } })).filter((doc) => {
        // Only return channels where @everyone has the CONNECT permission
        if (doc.permission_overwrites === undefined ||
            util_1.Permissions.channelPermission(doc.permission_overwrites, util_1.Permissions.FLAGS.CONNECT) === util_1.Permissions.FLAGS.CONNECT) {
            channels.push({
                id: doc.id,
                name: doc.name,
                position: doc.position
            });
        }
    });
    // Fetch members
    // TODO: Understand how Discord's max 100 random member sample works, and apply to here (see top of this file)
    let members = yield util_1.Member.find({ guild_id: guild_id });
    // Construct object to respond with
    const data = {
        id: guild_id,
        name: guild.name,
        instant_invite: invite === null || invite === void 0 ? void 0 : invite.code,
        channels: channels,
        members: members,
        presence_count: guild.presence_count
    };
    res.set("Cache-Control", "public, max-age=300");
    return res.json(data);
}));
exports.default = router;
