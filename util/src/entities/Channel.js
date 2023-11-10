"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var Channel_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelPermissionOverwriteType = exports.Channel = exports.ChannelType = void 0;
const typeorm_1 = require("typeorm");
const BaseClass_1 = require("./BaseClass");
const Guild_1 = require("./Guild");
const User_1 = require("./User");
const lambert_server_1 = require("lambert-server");
const util_1 = require("../util");
const Recipient_1 = require("./Recipient");
const Message_1 = require("./Message");
const ReadState_1 = require("./ReadState");
const Invite_1 = require("./Invite");
const VoiceState_1 = require("./VoiceState");
const Webhook_1 = require("./Webhook");
const dtos_1 = require("../dtos");
var ChannelType;
(function (ChannelType) {
    ChannelType[ChannelType["GUILD_TEXT"] = 0] = "GUILD_TEXT";
    ChannelType[ChannelType["DM"] = 1] = "DM";
    ChannelType[ChannelType["GUILD_VOICE"] = 2] = "GUILD_VOICE";
    ChannelType[ChannelType["GROUP_DM"] = 3] = "GROUP_DM";
    ChannelType[ChannelType["GUILD_CATEGORY"] = 4] = "GUILD_CATEGORY";
    ChannelType[ChannelType["GUILD_NEWS"] = 5] = "GUILD_NEWS";
    ChannelType[ChannelType["GUILD_STORE"] = 6] = "GUILD_STORE";
    // TODO: what are channel types between 7-9?
    ChannelType[ChannelType["GUILD_NEWS_THREAD"] = 10] = "GUILD_NEWS_THREAD";
    ChannelType[ChannelType["GUILD_PUBLIC_THREAD"] = 11] = "GUILD_PUBLIC_THREAD";
    ChannelType[ChannelType["GUILD_PRIVATE_THREAD"] = 12] = "GUILD_PRIVATE_THREAD";
    ChannelType[ChannelType["GUILD_STAGE_VOICE"] = 13] = "GUILD_STAGE_VOICE";
})(ChannelType = exports.ChannelType || (exports.ChannelType = {}));
let Channel = Channel_1 = class Channel extends BaseClass_1.BaseClass {
    // TODO: DM channel
    static createChannel(channel, user_id = "0", opts) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(opts === null || opts === void 0 ? void 0 : opts.skipPermissionCheck)) {
                // Always check if user has permission first
                const permissions = yield (0, util_1.getPermission)(user_id, channel.guild_id);
                permissions.hasThrow("MANAGE_CHANNELS");
            }
            switch (channel.type) {
                case ChannelType.GUILD_TEXT:
                case ChannelType.GUILD_VOICE:
                    if (channel.parent_id && !(opts === null || opts === void 0 ? void 0 : opts.skipExistsCheck)) {
                        const exists = yield Channel_1.findOneOrFail({ id: channel.parent_id });
                        if (!exists)
                            throw new lambert_server_1.HTTPError("Parent id channel doesn't exist", 400);
                        if (exists.guild_id !== channel.guild_id)
                            throw new lambert_server_1.HTTPError("The category channel needs to be in the guild");
                    }
                    break;
                case ChannelType.GUILD_CATEGORY:
                    break;
                case ChannelType.DM:
                case ChannelType.GROUP_DM:
                    throw new lambert_server_1.HTTPError("You can't create a dm channel in a guild");
                // TODO: check if guild is community server
                case ChannelType.GUILD_STORE:
                case ChannelType.GUILD_NEWS:
                default:
                    throw new lambert_server_1.HTTPError("Not yet supported");
            }
            if (!channel.permission_overwrites)
                channel.permission_overwrites = [];
            // TODO: auto generate position
            channel = Object.assign(Object.assign(Object.assign({}, channel), (!(opts === null || opts === void 0 ? void 0 : opts.keepId) && { id: util_1.Snowflake.generate() })), { created_at: new Date(), position: channel.position || 0 });
            yield Promise.all([
                new Channel_1(channel).save(),
                !(opts === null || opts === void 0 ? void 0 : opts.skipEventEmit)
                    ? (0, util_1.emitEvent)({
                        event: "CHANNEL_CREATE",
                        data: channel,
                        guild_id: channel.guild_id,
                    })
                    : Promise.resolve(),
            ]);
            return channel;
        });
    }
    static createDMChannel(recipients, creator_user_id, name) {
        return __awaiter(this, void 0, void 0, function* () {
            recipients = recipients.unique().filter((x) => x !== creator_user_id);
            const otherRecipientsUsers = yield User_1.User.find({ where: recipients.map((x) => ({ id: x })), select: ["id"] });
            // TODO: check config for max number of recipients
            if (otherRecipientsUsers.length !== recipients.length) {
                throw new lambert_server_1.HTTPError("Recipient/s not found");
            }
            const type = recipients.length === 1 ? ChannelType.DM : ChannelType.GROUP_DM;
            let channel = null;
            const channelRecipients = [...recipients, creator_user_id];
            const userRecipients = yield Recipient_1.Recipient.find({
                where: { user_id: creator_user_id },
                relations: ["channel", "channel.recipients"],
            });
            for (let ur of userRecipients) {
                let re = ur.channel.recipients.map((r) => r.user_id);
                if (re.length === channelRecipients.length) {
                    if ((0, util_1.containsAll)(re, channelRecipients)) {
                        if (channel == null) {
                            channel = ur.channel;
                            yield ur.assign({ closed: false }).save();
                        }
                    }
                }
            }
            if (channel == null) {
                name = (0, util_1.trimSpecial)(name);
                channel = yield new Channel_1({
                    name,
                    type,
                    owner_id: type === ChannelType.DM ? undefined : creator_user_id,
                    created_at: new Date(),
                    last_message_id: null,
                    recipients: channelRecipients.map((x) => new Recipient_1.Recipient({ user_id: x, closed: !(type === ChannelType.GROUP_DM || x === creator_user_id) })),
                }).save();
            }
            const channel_dto = yield dtos_1.DmChannelDTO.from(channel);
            if (type === ChannelType.GROUP_DM) {
                for (let recipient of channel.recipients) {
                    yield (0, util_1.emitEvent)({
                        event: "CHANNEL_CREATE",
                        data: channel_dto.excludedRecipients([recipient.user_id]),
                        user_id: recipient.user_id,
                    });
                }
            }
            else {
                yield (0, util_1.emitEvent)({ event: "CHANNEL_CREATE", data: channel_dto, user_id: creator_user_id });
            }
            return channel_dto.excludedRecipients([creator_user_id]);
        });
    }
    static removeRecipientFromChannel(channel, user_id) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            yield Recipient_1.Recipient.delete({ channel_id: channel.id, user_id: user_id });
            channel.recipients = (_a = channel.recipients) === null || _a === void 0 ? void 0 : _a.filter((r) => r.user_id !== user_id);
            if (((_b = channel.recipients) === null || _b === void 0 ? void 0 : _b.length) === 0) {
                yield Channel_1.deleteChannel(channel);
                yield (0, util_1.emitEvent)({
                    event: "CHANNEL_DELETE",
                    data: yield dtos_1.DmChannelDTO.from(channel, [user_id]),
                    user_id: user_id,
                });
                return;
            }
            yield (0, util_1.emitEvent)({
                event: "CHANNEL_DELETE",
                data: yield dtos_1.DmChannelDTO.from(channel, [user_id]),
                user_id: user_id,
            });
            //If the owner leave we make the first recipient in the list the new owner
            if (channel.owner_id === user_id) {
                channel.owner_id = channel.recipients.find((r) => r.user_id !== user_id).user_id; //Is there a criteria to choose the new owner?
                yield (0, util_1.emitEvent)({
                    event: "CHANNEL_UPDATE",
                    data: yield dtos_1.DmChannelDTO.from(channel, [user_id]),
                    channel_id: channel.id,
                });
            }
            yield channel.save();
            yield (0, util_1.emitEvent)({
                event: "CHANNEL_RECIPIENT_REMOVE",
                data: {
                    channel_id: channel.id,
                    user: yield User_1.User.findOneOrFail({ where: { id: user_id }, select: User_1.PublicUserProjection }),
                },
                channel_id: channel.id,
            });
        });
    }
    static deleteChannel(channel) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Message_1.Message.delete({ channel_id: channel.id }); //TODO we should also delete the attachments from the cdn but to do that we need to move cdn.ts in util
            //TODO before deleting the channel we should check and delete other relations
            yield Channel_1.delete({ id: channel.id });
        });
    }
    isDm() {
        return this.type === ChannelType.DM || this.type === ChannelType.GROUP_DM;
    }
};
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Channel.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Channel.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", Object)
], Channel.prototype, "icon", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], Channel.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Recipient_1.Recipient, (recipient) => recipient.channel, {
        cascade: true,
        orphanedRowAction: "delete",
    }),
    __metadata("design:type", Array)
], Channel.prototype, "recipients", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Channel.prototype, "last_message_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.RelationId)((channel) => channel.guild),
    __metadata("design:type", String)
], Channel.prototype, "guild_id", void 0);
__decorate([
    (0, typeorm_1.JoinColumn)({ name: "guild_id" }),
    (0, typeorm_1.ManyToOne)(() => Guild_1.Guild, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", Guild_1.Guild)
], Channel.prototype, "guild", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.RelationId)((channel) => channel.parent),
    __metadata("design:type", String)
], Channel.prototype, "parent_id", void 0);
__decorate([
    (0, typeorm_1.JoinColumn)({ name: "parent_id" }),
    (0, typeorm_1.ManyToOne)(() => Channel_1),
    __metadata("design:type", Channel)
], Channel.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.RelationId)((channel) => channel.owner),
    __metadata("design:type", String)
], Channel.prototype, "owner_id", void 0);
__decorate([
    (0, typeorm_1.JoinColumn)({ name: "owner_id" }),
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    __metadata("design:type", User_1.User)
], Channel.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Channel.prototype, "last_pin_timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Channel.prototype, "default_auto_archive_duration", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Channel.prototype, "position", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-json", nullable: true }),
    __metadata("design:type", Array)
], Channel.prototype, "permission_overwrites", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Channel.prototype, "video_quality_mode", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Channel.prototype, "bitrate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Channel.prototype, "user_limit", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], Channel.prototype, "nsfw", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Channel.prototype, "rate_limit_per_user", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Channel.prototype, "topic", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Invite_1.Invite, (invite) => invite.channel, {
        cascade: true,
        orphanedRowAction: "delete",
    }),
    __metadata("design:type", Array)
], Channel.prototype, "invites", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Message_1.Message, (message) => message.channel, {
        cascade: true,
        orphanedRowAction: "delete",
    }),
    __metadata("design:type", Array)
], Channel.prototype, "messages", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => VoiceState_1.VoiceState, (voice_state) => voice_state.channel, {
        cascade: true,
        orphanedRowAction: "delete",
    }),
    __metadata("design:type", Array)
], Channel.prototype, "voice_states", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ReadState_1.ReadState, (read_state) => read_state.channel, {
        cascade: true,
        orphanedRowAction: "delete",
    }),
    __metadata("design:type", Array)
], Channel.prototype, "read_states", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Webhook_1.Webhook, (webhook) => webhook.channel, {
        cascade: true,
        orphanedRowAction: "delete",
    }),
    __metadata("design:type", Array)
], Channel.prototype, "webhooks", void 0);
Channel = Channel_1 = __decorate([
    (0, typeorm_1.Entity)("channels")
], Channel);
exports.Channel = Channel;
var ChannelPermissionOverwriteType;
(function (ChannelPermissionOverwriteType) {
    ChannelPermissionOverwriteType[ChannelPermissionOverwriteType["role"] = 0] = "role";
    ChannelPermissionOverwriteType[ChannelPermissionOverwriteType["member"] = 1] = "member";
})(ChannelPermissionOverwriteType = exports.ChannelPermissionOverwriteType || (exports.ChannelPermissionOverwriteType = {}));
