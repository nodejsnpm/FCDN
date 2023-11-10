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
exports.EmojiUser1633864669243 = void 0;
class EmojiUser1633864669243 {
    constructor() {
        this.name = "EmojiUser1633864669243";
    }
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "emojis" ADD "user_id" varchar`);
            try {
                yield queryRunner.query(`ALTER TABLE "emojis" ADD CONSTRAINT FK_fa7ddd5f9a214e28ce596548421 FOREIGN KEY (user_id) REFERENCES users(id)`);
            }
            catch (error) {
                console.error("sqlite doesn't support altering foreign keys: https://stackoverflow.com/questions/1884818/how-do-i-add-a-foreign-key-to-an-existing-sqlite-table");
            }
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "emojis" DROP COLUMN column_name "user_id"`);
            yield queryRunner.query(`ALTER TABLE "emojis" DROP CONSTRAINT FK_fa7ddd5f9a214e28ce596548421`);
        });
    }
}
exports.EmojiUser1633864669243 = EmojiUser1633864669243;
