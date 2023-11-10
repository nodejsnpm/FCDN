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
exports.StickerPack = void 0;
const typeorm_1 = require("typeorm");
const _1 = require(".");
const BaseClass_1 = require("./BaseClass");
let StickerPack = class StickerPack extends BaseClass_1.BaseClass {
};
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StickerPack.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StickerPack.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StickerPack.prototype, "banner_asset_id", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => _1.Sticker, (sticker) => sticker.pack, {
        cascade: true,
        orphanedRowAction: "delete",
    }),
    __metadata("design:type", Array)
], StickerPack.prototype, "stickers", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.RelationId)((pack) => pack.cover_sticker),
    __metadata("design:type", String)
], StickerPack.prototype, "cover_sticker_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => _1.Sticker, { nullable: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", _1.Sticker)
], StickerPack.prototype, "cover_sticker", void 0);
StickerPack = __decorate([
    (0, typeorm_1.Entity)("sticker_packs")
], StickerPack);
exports.StickerPack = StickerPack;
