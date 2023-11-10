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
exports.setupListener = exports.handlePresenceUpdate = void 0;
const util_1 = require("../../../util/src/index");
const Constants_1 = require("../util/Constants");
const Send_1 = require("../util/Send");
require("missing-native-js-functions");
const util_2 = require("../../../util/src/index");
// TODO: close connection on Invalidated Token
// TODO: check intent
// TODO: Guild Member Update is sent for current-user updates regardless of whether the GUILD_MEMBERS intent is set.
// Sharding: calculate if the current shard id matches the formula: shard_id = (guild_id >> 22) % num_shards
// https://discord.com/developers/docs/topics/gateway#sharding
function handlePresenceUpdate({ event, acknowledge, data }) {
    acknowledge === null || acknowledge === void 0 ? void 0 : acknowledge();
    if (event === util_1.EVENTEnum.PresenceUpdate) {
        return (0, Send_1.Send)(this, {
            op: Constants_1.OPCODES.Dispatch,
            t: event,
            d: data,
            s: this.sequence++,
        });
    }
}
exports.handlePresenceUpdate = handlePresenceUpdate;
// TODO: use already queried guilds/channels of Identify and don't fetch them again
function setupListener() {
    return __awaiter(this, void 0, void 0, function* () {
        const [members, recipients, relationships] = yield Promise.all([
            util_1.Member.find({
                where: { id: this.user_id },
                relations: ["guild", "guild.channels"],
            }),
            util_2.Recipient.find({
                where: { user_id: this.user_id, closed: false },
                relations: ["channel"],
            }),
            util_1.Relationship.find({
                from_id: this.user_id,
                type: util_1.RelationshipType.friends,
            }),
        ]);
        const guilds = members.map((x) => x.guild);
        const dm_channels = recipients.map((x) => x.channel);
        const opts = {
            acknowledge: true,
        };
        this.listen_options = opts;
        const consumer = consume.bind(this);
        if (util_1.RabbitMQ.connection) {
            opts.channel = yield util_1.RabbitMQ.connection.createChannel();
            // @ts-ignore
            opts.channel.queues = {};
        }
        this.events[this.user_id] = yield (0, util_1.listenEvent)(this.user_id, consumer, opts);
        relationships.forEach((relationship) => __awaiter(this, void 0, void 0, function* () {
            this.events[relationship.to_id] = yield (0, util_1.listenEvent)(relationship.to_id, handlePresenceUpdate.bind(this), opts);
        }));
        dm_channels.forEach((channel) => __awaiter(this, void 0, void 0, function* () {
            this.events[channel.id] = yield (0, util_1.listenEvent)(channel.id, consumer, opts);
        }));
        guilds.forEach((guild) => __awaiter(this, void 0, void 0, function* () {
            const permission = yield (0, util_1.getPermission)(this.user_id, guild.id);
            this.permissions[guild.id] = permission;
            this.events[guild.id] = yield (0, util_1.listenEvent)(guild.id, consumer, opts);
            guild.channels.forEach((channel) => __awaiter(this, void 0, void 0, function* () {
                if (permission
                    .overwriteChannel(channel.permission_overwrites)
                    .has("VIEW_CHANNEL")) {
                    this.events[channel.id] = yield (0, util_1.listenEvent)(channel.id, consumer, opts);
                }
            }));
        }));
        this.once("close", () => {
            if (opts.channel)
                opts.channel.close();
            else {
                Object.values(this.events).forEach((x) => x());
                Object.values(this.member_events).forEach((x) => x());
            }
        });
    });
}
exports.setupListener = setupListener;
// TODO: only subscribe for events that are in the connection intents
function consume(opts) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const { data, event } = opts;
        let id = data.id;
        const permission = this.permissions[id] || new util_1.Permissions("ADMINISTRATOR"); // default permission for dm
        const consumer = consume.bind(this);
        const listenOpts = opts;
        (_a = opts.acknowledge) === null || _a === void 0 ? void 0 : _a.call(opts);
        // console.log("event", event);
        // subscription managment
        switch (event) {
            case "GUILD_MEMBER_REMOVE":
                (_c = (_b = this.member_events)[data.user.id]) === null || _c === void 0 ? void 0 : _c.call(_b);
                delete this.member_events[data.user.id];
            case "GUILD_MEMBER_ADD":
                if (this.member_events[data.user.id])
                    break; // already subscribed
                this.member_events[data.user.id] = yield (0, util_1.listenEvent)(data.user.id, handlePresenceUpdate.bind(this), this.listen_options);
                break;
            case "GUILD_MEMBER_REMOVE":
                if (!this.member_events[data.user.id])
                    break;
                this.member_events[data.user.id]();
                break;
            case "RELATIONSHIP_REMOVE":
            case "CHANNEL_DELETE":
            case "GUILD_DELETE":
                delete this.events[id];
                opts.cancel();
                break;
            case "CHANNEL_CREATE":
                if (!permission
                    .overwriteChannel(data.permission_overwrites)
                    .has("VIEW_CHANNEL")) {
                    return;
                }
                this.events[id] = yield (0, util_1.listenEvent)(id, consumer, listenOpts);
                break;
            case "RELATIONSHIP_ADD":
                this.events[data.user.id] = yield (0, util_1.listenEvent)(data.user.id, handlePresenceUpdate.bind(this), this.listen_options);
                break;
            case "GUILD_CREATE":
                this.events[id] = yield (0, util_1.listenEvent)(id, consumer, listenOpts);
                break;
            case "CHANNEL_UPDATE":
                const exists = this.events[id];
                // @ts-ignore
                if (permission
                    .overwriteChannel(data.permission_overwrites)
                    .has("VIEW_CHANNEL")) {
                    if (exists)
                        break;
                    this.events[id] = yield (0, util_1.listenEvent)(id, consumer, listenOpts);
                }
                else {
                    if (!exists)
                        return; // return -> do not send channel update events for hidden channels
                    opts.cancel(id);
                    delete this.events[id];
                }
                break;
        }
        // permission checking
        switch (event) {
            case "INVITE_CREATE":
            case "INVITE_DELETE":
            case "GUILD_INTEGRATIONS_UPDATE":
                if (!permission.has("MANAGE_GUILD"))
                    return;
                break;
            case "WEBHOOKS_UPDATE":
                if (!permission.has("MANAGE_WEBHOOKS"))
                    return;
                break;
            case "GUILD_MEMBER_ADD":
            case "GUILD_MEMBER_REMOVE":
            case "GUILD_MEMBER_UPDATE":
            // only send them, if the user subscribed for this part of the member list, or is a bot
            case "PRESENCE_UPDATE": // exception if user is friend
                break;
            case "GUILD_BAN_ADD":
            case "GUILD_BAN_REMOVE":
                if (!permission.has("BAN_MEMBERS"))
                    break;
                break;
            case "VOICE_STATE_UPDATE":
            case "MESSAGE_CREATE":
            case "MESSAGE_DELETE":
            case "MESSAGE_DELETE_BULK":
            case "MESSAGE_UPDATE":
            case "CHANNEL_PINS_UPDATE":
            case "MESSAGE_REACTION_ADD":
            case "MESSAGE_REACTION_REMOVE":
            case "MESSAGE_REACTION_REMOVE_ALL":
            case "MESSAGE_REACTION_REMOVE_EMOJI":
            case "TYPING_START":
                // only gets send if the user is alowed to view the current channel
                if (!permission.has("VIEW_CHANNEL"))
                    return;
                break;
            case "GUILD_CREATE":
            case "GUILD_DELETE":
            case "GUILD_UPDATE":
            case "GUILD_ROLE_CREATE":
            case "GUILD_ROLE_UPDATE":
            case "GUILD_ROLE_DELETE":
            case "CHANNEL_CREATE":
            case "CHANNEL_DELETE":
            case "CHANNEL_UPDATE":
            case "GUILD_EMOJIS_UPDATE":
            case "READY": // will be sent by the gateway
            case "USER_UPDATE":
            case "APPLICATION_COMMAND_CREATE":
            case "APPLICATION_COMMAND_DELETE":
            case "APPLICATION_COMMAND_UPDATE":
            default:
                // always gets sent
                // Any events not defined in an intent are considered "passthrough" and will always be sent
                break;
        }
        (0, Send_1.Send)(this, {
            op: Constants_1.OPCODES.Dispatch,
            t: event,
            d: data,
            s: this.sequence++,
        });
    });
}
