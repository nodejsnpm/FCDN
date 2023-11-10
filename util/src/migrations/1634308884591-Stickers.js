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
exports.Stickers1634308884591 = void 0;
const typeorm_1 = require("typeorm");
class Stickers1634308884591 {
    constructor() {
        this.name = "Stickers1634308884591";
    }
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.dropForeignKey("read_states", "FK_6f255d873cfbfd7a93849b7ff74");
            yield queryRunner.changeColumn("stickers", "tags", new typeorm_1.TableColumn({ name: "tags", type: "varchar", isNullable: true }));
            yield queryRunner.changeColumn("stickers", "pack_id", new typeorm_1.TableColumn({ name: "pack_id", type: "varchar", isNullable: true }));
            yield queryRunner.changeColumn("stickers", "type", new typeorm_1.TableColumn({ name: "type", type: "integer" }));
            yield queryRunner.changeColumn("stickers", "format_type", new typeorm_1.TableColumn({ name: "format_type", type: "integer" }));
            yield queryRunner.changeColumn("stickers", "available", new typeorm_1.TableColumn({ name: "available", type: "boolean", isNullable: true }));
            yield queryRunner.changeColumn("stickers", "user_id", new typeorm_1.TableColumn({ name: "user_id", type: "boolean", isNullable: true }));
            yield queryRunner.createForeignKey("stickers", new typeorm_1.TableForeignKey({
                name: "FK_8f4ee73f2bb2325ff980502e158",
                columnNames: ["user_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE",
            }));
            yield queryRunner.createTable(new typeorm_1.Table({
                name: "sticker_packs",
                columns: [
                    new typeorm_1.TableColumn({ name: "id", type: "varchar", isPrimary: true }),
                    new typeorm_1.TableColumn({ name: "name", type: "varchar" }),
                    new typeorm_1.TableColumn({ name: "description", type: "varchar", isNullable: true }),
                    new typeorm_1.TableColumn({ name: "banner_asset_id", type: "varchar", isNullable: true }),
                    new typeorm_1.TableColumn({ name: "cover_sticker_id", type: "varchar", isNullable: true }),
                ],
                foreignKeys: [
                    new typeorm_1.TableForeignKey({
                        columnNames: ["cover_sticker_id"],
                        referencedColumnNames: ["id"],
                        referencedTableName: "stickers",
                    }),
                ],
            }));
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
exports.Stickers1634308884591 = Stickers1634308884591;
