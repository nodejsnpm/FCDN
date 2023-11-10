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
var Invite_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invite = exports.PublicInviteRelation = void 0;
const typeorm_1 = require("typeorm");
const Member_1 = require("./Member");
const BaseClass_1 = require("./BaseClass");
const Channel_1 = require("./Channel");
const Guild_1 = require("./Guild");
const User_1 = require("./User");
exports.PublicInviteRelation = ["inviter", "guild", "channel"];
let Invite = Invite_1 = class Invite extends BaseClass_1.BaseClassWithoutId {
    static joinGuild(user_id, code) {
        return __awaiter(this, void 0, void 0, function* () {
            const invite = yield Invite_1.findOneOrFail({ code });
            if (invite.uses++ >= invite.max_uses && invite.max_uses !== 0)
                yield Invite_1.delete({ code });
            else
                yield invite.save();
            yield Member_1.Member.addToGuild(user_id, invite.guild_id);
            return invite;
        });
    }
};
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], Invite.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], Invite.prototype, "temporary", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Invite.prototype, "uses", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Invite.prototype, "max_uses", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Invite.prototype, "max_age", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Invite.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Invite.prototype, "expires_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.RelationId)((invite) => invite.guild),
    __metadata("design:type", String)
], Invite.prototype, "guild_id", void 0);
__decorate([
    (0, typeorm_1.JoinColumn)({ name: "guild_id" }),
    (0, typeorm_1.ManyToOne)(() => Guild_1.Guild, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", Guild_1.Guild)
], Invite.prototype, "guild", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.RelationId)((invite) => invite.channel),
    __metadata("design:type", String)
], Invite.prototype, "channel_id", void 0);
__decorate([
    (0, typeorm_1.JoinColumn)({ name: "channel_id" }),
    (0, typeorm_1.ManyToOne)(() => Channel_1.Channel, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", Channel_1.Channel)
], Invite.prototype, "channel", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.RelationId)((invite) => invite.inviter),
    __metadata("design:type", String)
], Invite.prototype, "inviter_id", void 0);
__decorate([
    (0, typeorm_1.JoinColumn)({ name: "inviter_id" }),
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    __metadata("design:type", User_1.User)
], Invite.prototype, "inviter", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.RelationId)((invite) => invite.target_user),
    __metadata("design:type", String)
], Invite.prototype, "target_user_id", void 0);
__decorate([
    (0, typeorm_1.JoinColumn)({ name: "target_user_id" }),
    (0, typeorm_1.ManyToOne)(() => User_1.User, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", String)
], Invite.prototype, "target_user", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Invite.prototype, "target_user_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], Invite.prototype, "vanity_url", void 0);
Invite = Invite_1 = __decorate([
    (0, typeorm_1.Entity)("invites")
], Invite);
exports.Invite = Invite;
