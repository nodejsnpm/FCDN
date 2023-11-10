"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../../../../util/src/index");
const express_1 = require("express");
const lambert_server_1 = require("lambert-server");
const util_2 = require("../../../../../util/src/index");
const api_1 = require("../../../index");
const router = (0, express_1.Router)();
const userProjection = ["relationships", ...util_1.PublicUserProjection];
router.get("/", (0, api_1.route)({}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield util_1.User.findOneOrFail({
        where: { id: req.user_id },
        relations: ["relationships", "relationships.to"],
        select: ["relationships"]
    });
    //TODO DTO
    const related_users = user.relationships.map((r) => {
        return {
            id: r.to.id,
            type: r.type,
            nickname: null,
            user: r.to.toPublicUser()
        };
    });
    return res.json(related_users);
}));
router.put("/:id", (0, api_1.route)({ body: "RelationshipPutSchema" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    return yield updateRelationship(req, res, yield util_1.User.findOneOrFail({ id: req.params.id }, { relations: ["relationships", "relationships.to"], select: userProjection }), (_a = req.body.type) !== null && _a !== void 0 ? _a : util_1.RelationshipType.friends);
}));
router.post("/", (0, api_1.route)({ body: "RelationshipPostSchema" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return yield updateRelationship(req, res, yield util_1.User.findOneOrFail({
        relations: ["relationships", "relationships.to"],
        select: userProjection,
        where: {
            discriminator: String(req.body.discriminator).padStart(4, "0"),
            username: req.body.username
        }
    }), req.body.type);
}));
router.delete("/:id", (0, api_1.route)({}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (id === req.user_id)
        throw new lambert_server_1.HTTPError("You can't remove yourself as a friend");
    const user = yield util_1.User.findOneOrFail({ id: req.user_id }, { select: userProjection, relations: ["relationships"] });
    const friend = yield util_1.User.findOneOrFail({ id: id }, { select: userProjection, relations: ["relationships"] });
    const relationship = user.relationships.find((x) => x.to_id === id);
    const friendRequest = friend.relationships.find((x) => x.to_id === req.user_id);
    if (!relationship)
        throw new lambert_server_1.HTTPError("You are not friends with the user", 404);
    if ((relationship === null || relationship === void 0 ? void 0 : relationship.type) === util_1.RelationshipType.blocked) {
        // unblock user
        yield Promise.all([
            util_1.Relationship.delete({ id: relationship.id }),
            (0, util_1.emitEvent)({
                event: "RELATIONSHIP_REMOVE",
                user_id: req.user_id,
                data: relationship.toPublicRelationship()
            })
        ]);
        return res.sendStatus(204);
    }
    if (friendRequest && friendRequest.type !== util_1.RelationshipType.blocked) {
        yield Promise.all([
            util_1.Relationship.delete({ id: friendRequest.id }),
            yield (0, util_1.emitEvent)({
                event: "RELATIONSHIP_REMOVE",
                data: friendRequest.toPublicRelationship(),
                user_id: id
            })
        ]);
    }
    yield Promise.all([
        util_1.Relationship.delete({ id: relationship.id }),
        (0, util_1.emitEvent)({
            event: "RELATIONSHIP_REMOVE",
            data: relationship.toPublicRelationship(),
            user_id: req.user_id
        })
    ]);
    return res.sendStatus(204);
}));
exports.default = router;
function updateRelationship(req, res, friend, type) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = friend.id;
        if (id === req.user_id)
            throw new lambert_server_1.HTTPError("You can't add yourself as a friend");
        const user = yield util_1.User.findOneOrFail({ id: req.user_id }, { relations: ["relationships", "relationships.to"], select: userProjection });
        var relationship = user.relationships.find((x) => x.to_id === id);
        const friendRequest = friend.relationships.find((x) => x.to_id === req.user_id);
        // TODO: you can add infinitely many blocked users (should this be prevented?)
        if (type === util_1.RelationshipType.blocked) {
            if (relationship) {
                if (relationship.type === util_1.RelationshipType.blocked)
                    throw new lambert_server_1.HTTPError("You already blocked the user");
                relationship.type = util_1.RelationshipType.blocked;
                yield relationship.save();
            }
            else {
                relationship = yield new util_1.Relationship({ to_id: id, type: util_1.RelationshipType.blocked, from_id: req.user_id }).save();
            }
            if (friendRequest && friendRequest.type !== util_1.RelationshipType.blocked) {
                yield Promise.all([
                    util_1.Relationship.delete({ id: friendRequest.id }),
                    (0, util_1.emitEvent)({
                        event: "RELATIONSHIP_REMOVE",
                        data: friendRequest.toPublicRelationship(),
                        user_id: id
                    })
                ]);
            }
            yield (0, util_1.emitEvent)({
                event: "RELATIONSHIP_ADD",
                data: relationship.toPublicRelationship(),
                user_id: req.user_id
            });
            return res.sendStatus(204);
        }
        const { maxFriends } = util_1.Config.get().limits.user;
        if (user.relationships.length >= maxFriends)
            throw util_2.DiscordApiErrors.MAXIMUM_FRIENDS.withParams(maxFriends);
        var incoming_relationship = new util_1.Relationship({ nickname: undefined, type: util_1.RelationshipType.incoming, to: user, from: friend });
        var outgoing_relationship = new util_1.Relationship({
            nickname: undefined,
            type: util_1.RelationshipType.outgoing,
            to: friend,
            from: user
        });
        if (friendRequest) {
            if (friendRequest.type === util_1.RelationshipType.blocked)
                throw new lambert_server_1.HTTPError("The user blocked you");
            if (friendRequest.type === util_1.RelationshipType.friends)
                throw new lambert_server_1.HTTPError("You are already friends with the user");
            // accept friend request
            incoming_relationship = friendRequest;
            incoming_relationship.type = util_1.RelationshipType.friends;
        }
        if (relationship) {
            if (relationship.type === util_1.RelationshipType.outgoing)
                throw new lambert_server_1.HTTPError("You already sent a friend request");
            if (relationship.type === util_1.RelationshipType.blocked)
                throw new lambert_server_1.HTTPError("Unblock the user before sending a friend request");
            if (relationship.type === util_1.RelationshipType.friends)
                throw new lambert_server_1.HTTPError("You are already friends with the user");
            outgoing_relationship = relationship;
            outgoing_relationship.type = util_1.RelationshipType.friends;
        }
        yield Promise.all([
            incoming_relationship.save(),
            outgoing_relationship.save(),
            (0, util_1.emitEvent)({
                event: "RELATIONSHIP_ADD",
                data: outgoing_relationship.toPublicRelationship(),
                user_id: req.user_id
            }),
            (0, util_1.emitEvent)({
                event: "RELATIONSHIP_ADD",
                data: Object.assign(Object.assign({}, incoming_relationship.toPublicRelationship()), { should_notify: true }),
                user_id: id
            })
        ]);
        return res.sendStatus(204);
    });
}
