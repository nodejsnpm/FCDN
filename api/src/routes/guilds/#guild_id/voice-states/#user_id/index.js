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
const util_1 = require("../../../../../../../util/src/index");
const api_1 = require("../../../../../index");
const express_1 = require("express");
const router = (0, express_1.Router)();
router.patch("/", (0, api_1.route)({ body: "VoiceStateUpdateSchema" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    var { guild_id, user_id } = req.params;
    if (user_id === "@me")
        user_id = req.user_id;
    const perms = yield (0, util_1.getPermission)(req.user_id, guild_id, body.channel_id);
    /*
    From https://discord.com/developers/docs/resources/guild#modify-current-user-voice-state
    You must have the MUTE_MEMBERS permission to unsuppress others. You can always suppress yourself.
    You must have the REQUEST_TO_SPEAK permission to request to speak. You can always clear your own request to speak.
     */
    if (body.suppress && user_id !== req.user_id) {
        perms.hasThrow("MUTE_MEMBERS");
    }
    if (!body.suppress)
        body.request_to_speak_timestamp = new Date();
    if (body.request_to_speak_timestamp)
        perms.hasThrow("REQUEST_TO_SPEAK");
    const voice_state = yield util_1.VoiceState.findOne({
        guild_id,
        channel_id: body.channel_id,
        user_id
    });
    if (!voice_state)
        throw util_1.DiscordApiErrors.UNKNOWN_VOICE_STATE;
    voice_state.assign(body);
    const channel = yield util_1.Channel.findOneOrFail({ guild_id, id: body.channel_id });
    if (channel.type !== util_1.ChannelType.GUILD_STAGE_VOICE) {
        throw util_1.DiscordApiErrors.CANNOT_EXECUTE_ON_THIS_CHANNEL_TYPE;
    }
    yield Promise.all([
        voice_state.save(),
        (0, util_1.emitEvent)({
            event: "VOICE_STATE_UPDATE",
            data: voice_state,
            guild_id
        })
    ]);
    return res.sendStatus(204);
}));
exports.default = router;
