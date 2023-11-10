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
exports.AuditLog = exports.AuditLogEvents = void 0;
const typeorm_1 = require("typeorm");
const BaseClass_1 = require("./BaseClass");
const User_1 = require("./User");
var AuditLogEvents;
(function (AuditLogEvents) {
    AuditLogEvents[AuditLogEvents["GUILD_UPDATE"] = 1] = "GUILD_UPDATE";
    AuditLogEvents[AuditLogEvents["CHANNEL_CREATE"] = 10] = "CHANNEL_CREATE";
    AuditLogEvents[AuditLogEvents["CHANNEL_UPDATE"] = 11] = "CHANNEL_UPDATE";
    AuditLogEvents[AuditLogEvents["CHANNEL_DELETE"] = 12] = "CHANNEL_DELETE";
    AuditLogEvents[AuditLogEvents["CHANNEL_OVERWRITE_CREATE"] = 13] = "CHANNEL_OVERWRITE_CREATE";
    AuditLogEvents[AuditLogEvents["CHANNEL_OVERWRITE_UPDATE"] = 14] = "CHANNEL_OVERWRITE_UPDATE";
    AuditLogEvents[AuditLogEvents["CHANNEL_OVERWRITE_DELETE"] = 15] = "CHANNEL_OVERWRITE_DELETE";
    AuditLogEvents[AuditLogEvents["MEMBER_KICK"] = 20] = "MEMBER_KICK";
    AuditLogEvents[AuditLogEvents["MEMBER_PRUNE"] = 21] = "MEMBER_PRUNE";
    AuditLogEvents[AuditLogEvents["MEMBER_BAN_ADD"] = 22] = "MEMBER_BAN_ADD";
    AuditLogEvents[AuditLogEvents["MEMBER_BAN_REMOVE"] = 23] = "MEMBER_BAN_REMOVE";
    AuditLogEvents[AuditLogEvents["MEMBER_UPDATE"] = 24] = "MEMBER_UPDATE";
    AuditLogEvents[AuditLogEvents["MEMBER_ROLE_UPDATE"] = 25] = "MEMBER_ROLE_UPDATE";
    AuditLogEvents[AuditLogEvents["MEMBER_MOVE"] = 26] = "MEMBER_MOVE";
    AuditLogEvents[AuditLogEvents["MEMBER_DISCONNECT"] = 27] = "MEMBER_DISCONNECT";
    AuditLogEvents[AuditLogEvents["BOT_ADD"] = 28] = "BOT_ADD";
    AuditLogEvents[AuditLogEvents["ROLE_CREATE"] = 30] = "ROLE_CREATE";
    AuditLogEvents[AuditLogEvents["ROLE_UPDATE"] = 31] = "ROLE_UPDATE";
    AuditLogEvents[AuditLogEvents["ROLE_DELETE"] = 32] = "ROLE_DELETE";
    AuditLogEvents[AuditLogEvents["INVITE_CREATE"] = 40] = "INVITE_CREATE";
    AuditLogEvents[AuditLogEvents["INVITE_UPDATE"] = 41] = "INVITE_UPDATE";
    AuditLogEvents[AuditLogEvents["INVITE_DELETE"] = 42] = "INVITE_DELETE";
    AuditLogEvents[AuditLogEvents["WEBHOOK_CREATE"] = 50] = "WEBHOOK_CREATE";
    AuditLogEvents[AuditLogEvents["WEBHOOK_UPDATE"] = 51] = "WEBHOOK_UPDATE";
    AuditLogEvents[AuditLogEvents["WEBHOOK_DELETE"] = 52] = "WEBHOOK_DELETE";
    AuditLogEvents[AuditLogEvents["EMOJI_CREATE"] = 60] = "EMOJI_CREATE";
    AuditLogEvents[AuditLogEvents["EMOJI_UPDATE"] = 61] = "EMOJI_UPDATE";
    AuditLogEvents[AuditLogEvents["EMOJI_DELETE"] = 62] = "EMOJI_DELETE";
    AuditLogEvents[AuditLogEvents["MESSAGE_DELETE"] = 72] = "MESSAGE_DELETE";
    AuditLogEvents[AuditLogEvents["MESSAGE_BULK_DELETE"] = 73] = "MESSAGE_BULK_DELETE";
    AuditLogEvents[AuditLogEvents["MESSAGE_PIN"] = 74] = "MESSAGE_PIN";
    AuditLogEvents[AuditLogEvents["MESSAGE_UNPIN"] = 75] = "MESSAGE_UNPIN";
    AuditLogEvents[AuditLogEvents["INTEGRATION_CREATE"] = 80] = "INTEGRATION_CREATE";
    AuditLogEvents[AuditLogEvents["INTEGRATION_UPDATE"] = 81] = "INTEGRATION_UPDATE";
    AuditLogEvents[AuditLogEvents["INTEGRATION_DELETE"] = 82] = "INTEGRATION_DELETE";
})(AuditLogEvents = exports.AuditLogEvents || (exports.AuditLogEvents = {}));
let AuditLog = class AuditLog extends BaseClass_1.BaseClass {
};
__decorate([
    (0, typeorm_1.JoinColumn)({ name: "target_id" }),
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    __metadata("design:type", User_1.User)
], AuditLog.prototype, "target", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.RelationId)((auditlog) => auditlog.user),
    __metadata("design:type", String)
], AuditLog.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.JoinColumn)({ name: "user_id" }),
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.id),
    __metadata("design:type", User_1.User)
], AuditLog.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], AuditLog.prototype, "action_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-json", nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "options", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Column)({ type: "simple-json" }),
    __metadata("design:type", Array)
], AuditLog.prototype, "changes", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "reason", void 0);
AuditLog = __decorate([
    (0, typeorm_1.Entity)("audit_logs")
], AuditLog);
exports.AuditLog = AuditLog;
