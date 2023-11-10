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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Webhook = exports.WebhookType = void 0;
const typeorm_1 = require("typeorm");
const Application_1 = require("./Application");
const BaseClass_1 = require("./BaseClass");
const Channel_1 = require("./Channel");
const Guild_1 = require("./Guild");
const User_1 = require("./User");
var WebhookType;
(function (WebhookType) {
    WebhookType[WebhookType["Incoming"] = 1] = "Incoming";
    WebhookType[WebhookType["ChannelFollower"] = 2] = "ChannelFollower";
})(WebhookType = exports.WebhookType || (exports.WebhookType = {}));
let Webhook = class Webhook extends BaseClass_1.BaseClass {
};
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], Webhook.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Webhook.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Webhook.prototype, "avatar", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Webhook.prototype, "token", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.RelationId)((webhook) => webhook.guild),
    __metadata("design:type", String)
], Webhook.prototype, "guild_id", void 0);
__decorate([
    (0, typeorm_1.JoinColumn)({ name: "guild_id" }),
    (0, typeorm_1.ManyToOne)(() => Guild_1.Guild, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", Guild_1.Guild)
], Webhook.prototype, "guild", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.RelationId)((webhook) => webhook.channel),
    __metadata("design:type", String)
], Webhook.prototype, "channel_id", void 0);
__decorate([
    (0, typeorm_1.JoinColumn)({ name: "channel_id" }),
    (0, typeorm_1.ManyToOne)(() => Channel_1.Channel, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", Channel_1.Channel)
], Webhook.prototype, "channel", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.RelationId)((webhook) => webhook.application),
    __metadata("design:type", String)
], Webhook.prototype, "application_id", void 0);
__decorate([
    (0, typeorm_1.JoinColumn)({ name: "application_id" }),
    (0, typeorm_1.ManyToOne)(() => Application_1.Application, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", Application_1.Application)
], Webhook.prototype, "application", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.RelationId)((webhook) => webhook.user),
    __metadata("design:type", String)
], Webhook.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.JoinColumn)({ name: "user_id" }),
    (0, typeorm_1.ManyToOne)(() => User_1.User, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", User_1.User)
], Webhook.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.RelationId)((webhook) => webhook.guild),
    __metadata("design:type", String)
], Webhook.prototype, "source_guild_id", void 0);
__decorate([
    (0, typeorm_1.JoinColumn)({ name: "source_guild_id" }),
    (0, typeorm_1.ManyToOne)(() => Guild_1.Guild, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", Guild_1.Guild)
], Webhook.prototype, "source_guild", void 0);
Webhook = __decorate([
    (0, typeorm_1.Entity)("webhooks")
], Webhook);
exports.Webhook = Webhook;
