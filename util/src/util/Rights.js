"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rights = void 0;
const BitField_1 = require("./BitField");
require("missing-native-js-functions");
const BitField_2 = require("./BitField");
var HTTPError;
try {
    HTTPError = require("lambert-server").HTTPError;
}
catch (e) {
    HTTPError = Error;
}
// TODO: just like roles for members, users should have privilidges which combine multiple rights into one and make it easy to assign
class Rights extends BitField_1.BitField {
    constructor(bits = 0) {
        super(bits);
        if (this.bitfield & Rights.FLAGS.OPERATOR) {
            this.bitfield = ALL_RIGHTS;
        }
    }
    any(permission, checkOperator = true) {
        return (checkOperator && super.any(Rights.FLAGS.OPERATOR)) || super.any(permission);
    }
    has(permission, checkOperator = true) {
        return (checkOperator && super.has(Rights.FLAGS.OPERATOR)) || super.has(permission);
    }
    hasThrow(permission) {
        if (this.has(permission))
            return true;
        // @ts-ignore
        throw new HTTPError(`You are missing the following rights ${permission}`, 403);
    }
}
exports.Rights = Rights;
Rights.FLAGS = {
    OPERATOR: (0, BitField_2.BitFlag)(0),
    MANAGE_APPLICATIONS: (0, BitField_2.BitFlag)(1),
    MANAGE_GUILDS: (0, BitField_2.BitFlag)(2),
    MANAGE_MESSAGES: (0, BitField_2.BitFlag)(3),
    MANAGE_RATE_LIMITS: (0, BitField_2.BitFlag)(4),
    MANAGE_ROUTING: (0, BitField_2.BitFlag)(5),
    MANAGE_TICKETS: (0, BitField_2.BitFlag)(6),
    MANAGE_USERS: (0, BitField_2.BitFlag)(7),
    ADD_MEMBERS: (0, BitField_2.BitFlag)(8),
    BYPASS_RATE_LIMITS: (0, BitField_2.BitFlag)(9),
    CREATE_APPLICATIONS: (0, BitField_2.BitFlag)(10),
    CREATE_CHANNELS: (0, BitField_2.BitFlag)(11),
    CREATE_DMS: (0, BitField_2.BitFlag)(12),
    CREATE_DM_GROUPS: (0, BitField_2.BitFlag)(13),
    CREATE_GUILDS: (0, BitField_2.BitFlag)(14),
    CREATE_INVITES: (0, BitField_2.BitFlag)(15),
    CREATE_ROLES: (0, BitField_2.BitFlag)(16),
    CREATE_TEMPLATES: (0, BitField_2.BitFlag)(17),
    CREATE_WEBHOOKS: (0, BitField_2.BitFlag)(18),
    JOIN_GUILDS: (0, BitField_2.BitFlag)(19),
    PIN_MESSAGES: (0, BitField_2.BitFlag)(20),
    SELF_ADD_REACTIONS: (0, BitField_2.BitFlag)(21),
    SELF_DELETE_MESSAGES: (0, BitField_2.BitFlag)(22),
    SELF_EDIT_MESSAGES: (0, BitField_2.BitFlag)(23),
    SELF_EDIT_NAME: (0, BitField_2.BitFlag)(24),
    SEND_MESSAGES: (0, BitField_2.BitFlag)(25),
    USE_ACTIVITIES: (0, BitField_2.BitFlag)(26),
    USE_VIDEO: (0, BitField_2.BitFlag)(27),
    USE_VOICE: (0, BitField_2.BitFlag)(28),
    INVITE_USERS: (0, BitField_2.BitFlag)(29),
    SELF_DELETE_DISABLE: (0, BitField_2.BitFlag)(30),
    DEBTABLE: (0, BitField_2.BitFlag)(31),
    CREDITABLE: (0, BitField_2.BitFlag)(32), // can receive money from monetisation related features
};
const ALL_RIGHTS = Object.values(Rights.FLAGS).reduce((total, val) => total | val, BigInt(0));
