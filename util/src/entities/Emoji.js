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
exports.Emoji = void 0;
const typeorm_1 = require("typeorm");
const _1 = require(".");
const BaseClass_1 = require("./BaseClass");
const Guild_1 = require("./Guild");
let Emoji = class Emoji extends BaseClass_1.BaseClass {
};
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], Emoji.prototype, "animated", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], Emoji.prototype, "available", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Emoji.prototype, "guild_id", void 0);
__decorate([
    (0, typeorm_1.JoinColumn)({ name: "guild_id" }),
    (0, typeorm_1.ManyToOne)(() => Guild_1.Guild, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", Guild_1.Guild)
], Emoji.prototype, "guild", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.RelationId)((emoji) => emoji.user),
    __metadata("design:type", String)
], Emoji.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.JoinColumn)({ name: "user_id" }),
    (0, typeorm_1.ManyToOne)(() => _1.User),
    __metadata("design:type", _1.User)
], Emoji.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], Emoji.prototype, "managed", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Emoji.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], Emoji.prototype, "require_colons", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-array" }),
    __metadata("design:type", Array)
], Emoji.prototype, "roles", void 0);
Emoji = __decorate([
    (0, typeorm_1.Entity)("emojis")
], Emoji);
exports.Emoji = Emoji;
