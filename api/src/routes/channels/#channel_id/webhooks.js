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
const express_1 = require("express");
const api_1 = require("../../../index");
const util_1 = require("../../../../../util/src/index");
const lambert_server_1 = require("lambert-server");
const index_1 = require("./messages/index");
const util_2 = require("../../../../../util/src/index");
const router = (0, express_1.Router)();
// TODO: use Image Data Type for avatar instead of String
router.post("/", (0, api_1.route)({ body: "WebhookCreateSchema", permission: "MANAGE_WEBHOOKS" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const channel_id = req.params.channel_id;
    const channel = yield util_1.Channel.findOneOrFail({ id: channel_id });
    (0, index_1.isTextChannel)(channel.type);
    if (!channel.guild_id)
        throw new lambert_server_1.HTTPError("Not a guild channel", 400);
    const webhook_count = yield util_1.Webhook.count({ channel_id });
    const { maxWebhooks } = util_1.Config.get().limits.channel;
    if (webhook_count > maxWebhooks)
        throw util_2.DiscordApiErrors.MAXIMUM_WEBHOOKS.withParams(maxWebhooks);
    var { avatar, name } = req.body;
    name = (0, util_1.trimSpecial)(name);
    if (name === "clyde")
        throw new lambert_server_1.HTTPError("Invalid name", 400);
    // TODO: save webhook in database and send response
}));
exports.default = router;
