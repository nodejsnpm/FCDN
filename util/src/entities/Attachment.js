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
exports.Attachment = void 0;
const typeorm_1 = require("typeorm");
const url_1 = require("url");
const cdn_1 = require("../util/cdn");
const BaseClass_1 = require("./BaseClass");
let Attachment = class Attachment extends BaseClass_1.BaseClass {
    onDelete() {
        return (0, cdn_1.deleteFile)(new url_1.URL(this.url).pathname);
    }
};
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Attachment.prototype, "filename", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Attachment.prototype, "size", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Attachment.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Attachment.prototype, "proxy_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Attachment.prototype, "height", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Attachment.prototype, "width", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Attachment.prototype, "content_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.RelationId)((attachment) => attachment.message),
    __metadata("design:type", String)
], Attachment.prototype, "message_id", void 0);
__decorate([
    (0, typeorm_1.JoinColumn)({ name: "message_id" }),
    (0, typeorm_1.ManyToOne)(() => require("./Message").Message, (message) => message.attachments, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", Object)
], Attachment.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.BeforeRemove)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Attachment.prototype, "onDelete", null);
Attachment = __decorate([
    (0, typeorm_1.Entity)("attachments")
], Attachment);
exports.Attachment = Attachment;
