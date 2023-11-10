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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onVoiceStateUpdate = void 0;
const VoiceStateUpdateSchema_1 = require("../schema/VoiceStateUpdateSchema");
const SessionUtils_1 = require("../util/SessionUtils");
const instanceOf_1 = require("./instanceOf");
const util_1 = require("../../../util/src/index");
// TODO: check if a voice server is setup
// Notice: Bot users respect the voice channel's user limit, if set. When the voice channel is full, you will not receive the Voice State Update or Voice Server Update events in response to your own Voice State Update. Having MANAGE_CHANNELS permission bypasses this limit and allows you to join regardless of the channel being full or not.
function onVoiceStateUpdate(data) {
    return __awaiter(this, void 0, void 0, function* () {
        instanceOf_1.check.call(this, VoiceStateUpdateSchema_1.VoiceStateUpdateSchema, data.d);
        const body = data.d;
        let voiceState;
        try {
            voiceState = yield util_1.VoiceState.findOneOrFail({
                where: { user_id: this.user_id },
            });
            if (voiceState.session_id !== this.session_id &&
                body.channel_id === null) {
                //Should we also check guild_id === null?
                //changing deaf or mute on a client that's not the one with the same session of the voicestate in the database should be ignored
                return;
            }
            //If a user change voice channel between guild we should send a left event first
            if (voiceState.guild_id !== body.guild_id &&
                voiceState.session_id === this.session_id) {
                yield (0, util_1.emitEvent)({
                    event: "VOICE_STATE_UPDATE",
                    data: Object.assign(Object.assign({}, voiceState), { channel_id: null }),
                    guild_id: voiceState.guild_id,
                });
            }
            //The event send by Discord's client on channel leave has both guild_id and channel_id as null
            if (body.guild_id === null)
                body.guild_id = voiceState.guild_id;
            voiceState.assign(body);
        }
        catch (error) {
            voiceState = new util_1.VoiceState(Object.assign(Object.assign({}, body), { user_id: this.user_id, deaf: false, mute: false, suppress: false }));
        }
        //TODO the member should only have these properties: hoisted_role, deaf, joined_at, mute, roles, user
        //TODO the member.user should only have these properties: avatar, discriminator, id, username
        //TODO this may fail
        voiceState.member = yield util_1.Member.findOneOrFail({
            where: { id: voiceState.user_id, guild_id: voiceState.guild_id },
            relations: ["user", "roles"],
        });
        //If the session changed we generate a new token
        if (voiceState.session_id !== this.session_id)
            voiceState.token = (0, SessionUtils_1.genVoiceToken)();
        voiceState.session_id = this.session_id;
        const { id } = voiceState, newObj = __rest(voiceState, ["id"]);
        yield Promise.all([
            voiceState.save(),
            (0, util_1.emitEvent)({
                event: "VOICE_STATE_UPDATE",
                data: newObj,
                guild_id: voiceState.guild_id,
            }),
        ]);
        //If it's null it means that we are leaving the channel and this event is not needed
        if (voiceState.channel_id !== null) {
            const guild = yield util_1.Guild.findOne({ id: voiceState.guild_id });
            const regions = util_1.Config.get().regions;
            let guildRegion;
            if (guild && guild.region) {
                guildRegion = regions.available.filter((r) => r.id === guild.region)[0];
            }
            else {
                guildRegion = regions.available.filter((r) => r.id === regions.default)[0];
            }
            yield (0, util_1.emitEvent)({
                event: "VOICE_SERVER_UPDATE",
                data: {
                    token: voiceState.token,
                    guild_id: voiceState.guild_id,
                    endpoint: guildRegion.endpoint,
                },
                guild_id: voiceState.guild_id,
            });
        }
    });
}
exports.onVoiceStateUpdate = onVoiceStateUpdate;
