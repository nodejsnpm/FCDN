"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinimalPublicUserDTO = void 0;
class MinimalPublicUserDTO {
    constructor(user) {
        this.avatar = user.avatar;
        this.discriminator = user.discriminator;
        this.id = user.id;
        this.public_flags = user.public_flags;
        this.username = user.username;
    }
}
exports.MinimalPublicUserDTO = MinimalPublicUserDTO;
