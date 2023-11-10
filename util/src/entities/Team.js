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
exports.Team = void 0;
const typeorm_1 = require("typeorm");
const BaseClass_1 = require("./BaseClass");
const TeamMember_1 = require("./TeamMember");
const User_1 = require("./User");
let Team = class Team extends BaseClass_1.BaseClass {
};
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Team.prototype, "icon", void 0);
__decorate([
    (0, typeorm_1.JoinColumn)({ name: "member_ids" }),
    (0, typeorm_1.OneToMany)(() => TeamMember_1.TeamMember, (member) => member.team, {
        orphanedRowAction: "delete",
    }),
    __metadata("design:type", Array)
], Team.prototype, "members", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Team.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.RelationId)((team) => team.owner_user),
    __metadata("design:type", String)
], Team.prototype, "owner_user_id", void 0);
__decorate([
    (0, typeorm_1.JoinColumn)({ name: "owner_user_id" }),
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    __metadata("design:type", User_1.User)
], Team.prototype, "owner_user", void 0);
Team = __decorate([
    (0, typeorm_1.Entity)("teams")
], Team);
exports.Team = Team;
