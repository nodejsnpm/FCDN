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
exports.ReadState = void 0;
const typeorm_1 = require("typeorm");
const BaseClass_1 = require("./BaseClass");
const Channel_1 = require("./Channel");
const User_1 = require("./User");
// for read receipts
// notification cursor and public read receipt need to be forwards-only (the former to prevent re-pinging when marked as unread, and the latter to be acceptable as a legal acknowledgement in criminal proceedings), and private read marker needs to be advance-rewind capable
// public read receipt ≥ notification cursor ≥ private fully read marker
let ReadState = class ReadState extends BaseClass_1.BaseClass {
};
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.RelationId)((read_state) => read_state.channel),
    __metadata("design:type", String)
], ReadState.prototype, "channel_id", void 0);
__decorate([
    (0, typeorm_1.JoinColumn)({ name: "channel_id" }),
    (0, typeorm_1.ManyToOne)(() => Channel_1.Channel, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", Channel_1.Channel)
], ReadState.prototype, "channel", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.RelationId)((read_state) => read_state.user),
    __metadata("design:type", String)
], ReadState.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.JoinColumn)({ name: "user_id" }),
    (0, typeorm_1.ManyToOne)(() => User_1.User, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", User_1.User)
], ReadState.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ReadState.prototype, "last_message_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], ReadState.prototype, "last_pin_timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ReadState.prototype, "mention_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], ReadState.prototype, "manual", void 0);
ReadState = __decorate([
    (0, typeorm_1.Entity)("read_states"),
    (0, typeorm_1.Index)(["channel_id", "user_id"], { unique: true })
], ReadState);
exports.ReadState = ReadState;
