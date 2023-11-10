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
exports.onPresenceUpdate = void 0;
const util_1 = require("../../../util/src/index");
const Activity_1 = require("../schema/Activity");
const instanceOf_1 = require("./instanceOf");
function onPresenceUpdate({ d }) {
    return __awaiter(this, void 0, void 0, function* () {
        instanceOf_1.check.call(this, Activity_1.ActivitySchema, d);
        const presence = d;
        yield util_1.Session.update({ session_id: this.session_id }, { status: presence.status, activities: presence.activities });
        yield (0, util_1.emitEvent)({
            event: "PRESENCE_UPDATE",
            user_id: this.user_id,
            data: {
                user: yield util_1.User.getPublicUser(this.user_id),
                activities: presence.activities,
                client_status: {},
                status: presence.status,
            },
        });
    });
}
exports.onPresenceUpdate = onPresenceUpdate;
