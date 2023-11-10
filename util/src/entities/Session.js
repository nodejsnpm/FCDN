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
exports.PrivateSessionProjection = exports.Session = void 0;
const User_1 = require("./User");
const BaseClass_1 = require("./BaseClass");
const typeorm_1 = require("typeorm");
//TODO we need to remove all sessions on server start because if the server crashes without closing websockets it won't delete them
let Session = class Session extends BaseClass_1.BaseClass {
};
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.RelationId)((session) => session.user),
    __metadata("design:type", String)
], Session.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.JoinColumn)({ name: "user_id" }),
    (0, typeorm_1.ManyToOne)(() => User_1.User, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", User_1.User)
], Session.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, select: false }),
    __metadata("design:type", String)
], Session.prototype, "session_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-json", nullable: true }),
    __metadata("design:type", Array)
], Session.prototype, "activities", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-json", select: false }),
    __metadata("design:type", Object)
], Session.prototype, "client_info", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, type: "varchar" }),
    __metadata("design:type", String)
], Session.prototype, "status", void 0);
Session = __decorate([
    (0, typeorm_1.Entity)("sessions")
], Session);
exports.Session = Session;
exports.PrivateSessionProjection = [
    "user_id",
    "session_id",
    "activities",
    "client_info",
    "status",
];
