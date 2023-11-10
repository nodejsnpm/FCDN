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
exports.Sticker = exports.StickerFormatType = exports.StickerType = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const BaseClass_1 = require("./BaseClass");
const Guild_1 = require("./Guild");
var StickerType;
(function (StickerType) {
    StickerType[StickerType["STANDARD"] = 1] = "STANDARD";
    StickerType[StickerType["GUILD"] = 2] = "GUILD";
})(StickerType = exports.StickerType || (exports.StickerType = {}));
var StickerFormatType;
(function (StickerFormatType) {
    StickerFormatType[StickerFormatType["GIF"] = 0] = "GIF";
    StickerFormatType[StickerFormatType["PNG"] = 1] = "PNG";
    StickerFormatType[StickerFormatType["APNG"] = 2] = "APNG";
    StickerFormatType[StickerFormatType["LOTTIE"] = 3] = "LOTTIE";
})(StickerFormatType = exports.StickerFormatType || (exports.StickerFormatType = {}));
let Sticker = class Sticker extends BaseClass_1.BaseClass {
};
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Sticker.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Sticker.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], Sticker.prototype, "available", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Sticker.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.RelationId)((sticker) => sticker.pack),
    __metadata("design:type", String)
], Sticker.prototype, "pack_id", void 0);
__decorate([
    (0, typeorm_1.JoinColumn)({ name: "pack_id" }),
    (0, typeorm_1.ManyToOne)(() => require("./StickerPack").StickerPack, {
        onDelete: "CASCADE",
        nullable: true,
    }),
    __metadata("design:type", Object)
], Sticker.prototype, "pack", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Sticker.prototype, "guild_id", void 0);
__decorate([
    (0, typeorm_1.JoinColumn)({ name: "guild_id" }),
    (0, typeorm_1.ManyToOne)(() => Guild_1.Guild, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", Guild_1.Guild)
], Sticker.prototype, "guild", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Sticker.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.JoinColumn)({ name: "user_id" }),
    (0, typeorm_1.ManyToOne)(() => User_1.User, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", User_1.User)
], Sticker.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], Sticker.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], Sticker.prototype, "format_type", void 0);
Sticker = __decorate([
    (0, typeorm_1.Entity)("stickers")
], Sticker);
exports.Sticker = Sticker;
