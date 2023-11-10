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
exports.TeamMember = exports.TeamMemberState = void 0;
const typeorm_1 = require("typeorm");
const BaseClass_1 = require("./BaseClass");
const User_1 = require("./User");
var TeamMemberState;
(function (TeamMemberState) {
    TeamMemberState[TeamMemberState["INVITED"] = 1] = "INVITED";
    TeamMemberState[TeamMemberState["ACCEPTED"] = 2] = "ACCEPTED";
})(TeamMemberState = exports.TeamMemberState || (exports.TeamMemberState = {}));
let TeamMember = class TeamMember extends BaseClass_1.BaseClass {
};
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], TeamMember.prototype, "membership_state", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-array" }),
    __metadata("design:type", Array)
], TeamMember.prototype, "permissions", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.RelationId)((member) => member.team),
    __metadata("design:type", String)
], TeamMember.prototype, "team_id", void 0);
__decorate([
    (0, typeorm_1.JoinColumn)({ name: "team_id" }),
    (0, typeorm_1.ManyToOne)(() => require("./Team").Team, (team) => team.members, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", Object)
], TeamMember.prototype, "team", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.RelationId)((member) => member.user),
    __metadata("design:type", String)
], TeamMember.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.JoinColumn)({ name: "user_id" }),
    (0, typeorm_1.ManyToOne)(() => User_1.User, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", User_1.User)
], TeamMember.prototype, "user", void 0);
TeamMember = __decorate([
    (0, typeorm_1.Entity)("team_members")
], TeamMember);
exports.TeamMember = TeamMember;
