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
exports.VanityInvite1633881705509 = void 0;
class VanityInvite1633881705509 {
    constructor() {
        this.name = "VanityInvite1633881705509";
    }
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield queryRunner.query(`ALTER TABLE "emojis" DROP COLUMN vanity_url_code`);
                yield queryRunner.query(`ALTER TABLE "emojis" DROP CONSTRAINT FK_c2c1809d79eb120ea0cb8d342ad`);
            }
            catch (error) { }
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "emojis" ADD vanity_url_code varchar`);
            yield queryRunner.query(`ALTER TABLE "emojis" ADD CONSTRAINT FK_c2c1809d79eb120ea0cb8d342ad FOREIGN KEY ("vanity_url_code") REFERENCES "invites"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        });
    }
}
exports.VanityInvite1633881705509 = VanityInvite1633881705509;
