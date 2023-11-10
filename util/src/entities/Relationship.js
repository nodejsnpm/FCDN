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
exports.Relationship = exports.RelationshipType = void 0;
const typeorm_1 = require("typeorm");
const BaseClass_1 = require("./BaseClass");
const User_1 = require("./User");
var RelationshipType;
(function (RelationshipType) {
    RelationshipType[RelationshipType["outgoing"] = 4] = "outgoing";
    RelationshipType[RelationshipType["incoming"] = 3] = "incoming";
    RelationshipType[RelationshipType["blocked"] = 2] = "blocked";
    RelationshipType[RelationshipType["friends"] = 1] = "friends";
})(RelationshipType = exports.RelationshipType || (exports.RelationshipType = {}));
let Relationship = class Relationship extends BaseClass_1.BaseClass {
    toPublicRelationship() {
        var _a, _b;
        return {
            id: ((_a = this.to) === null || _a === void 0 ? void 0 : _a.id) || this.to_id,
            type: this.type,
            nickname: this.nickname,
            user: (_b = this.to) === null || _b === void 0 ? void 0 : _b.toPublicUser(),
        };
    }
};
__decorate([
    (0, typeorm_1.Column)({}),
    (0, typeorm_1.RelationId)((relationship) => relationship.from),
    __metadata("design:type", String)
], Relationship.prototype, "from_id", void 0);
__decorate([
    (0, typeorm_1.JoinColumn)({ name: "from_id" }),
    (0, typeorm_1.ManyToOne)(() => User_1.User, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", User_1.User)
], Relationship.prototype, "from", void 0);
__decorate([
    (0, typeorm_1.Column)({}),
    (0, typeorm_1.RelationId)((relationship) => relationship.to),
    __metadata("design:type", String)
], Relationship.prototype, "to_id", void 0);
__decorate([
    (0, typeorm_1.JoinColumn)({ name: "to_id" }),
    (0, typeorm_1.ManyToOne)(() => User_1.User, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", User_1.User)
], Relationship.prototype, "to", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Relationship.prototype, "nickname", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], Relationship.prototype, "type", void 0);
Relationship = __decorate([
    (0, typeorm_1.Entity)("relationships"),
    (0, typeorm_1.Index)(["from_id", "to_id"], { unique: true })
], Relationship);
exports.Relationship = Relationship;
