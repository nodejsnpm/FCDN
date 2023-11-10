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
exports.DmChannelDTO = void 0;
const UserDTO_1 = require("./UserDTO");
const entities_1 = require("../entities");
class DmChannelDTO {
    static from(channel, excluded_recipients = [], origin_channel_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const obj = new DmChannelDTO();
            obj.icon = channel.icon || null;
            obj.id = channel.id;
            obj.last_message_id = channel.last_message_id || null;
            obj.name = channel.name || null;
            obj.origin_channel_id = origin_channel_id || null;
            obj.owner_id = channel.owner_id;
            obj.type = channel.type;
            obj.recipients = (yield Promise.all(channel
                .recipients.filter((r) => !excluded_recipients.includes(r.user_id))
                .map((r) => __awaiter(this, void 0, void 0, function* () {
                return yield entities_1.User.findOneOrFail({ where: { id: r.user_id }, select: entities_1.PublicUserProjection });
            })))).map((u) => new UserDTO_1.MinimalPublicUserDTO(u));
            return obj;
        });
    }
    excludedRecipients(excluded_recipients) {
        return Object.assign(Object.assign({}, this), { recipients: this.recipients.filter((r) => !excluded_recipients.includes(r.id)) });
    }
}
exports.DmChannelDTO = DmChannelDTO;
