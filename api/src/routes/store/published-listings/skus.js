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
const router = (0, express_1.Router)();
router.get("/:id", (0, api_1.route)({}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //TODO
    const id = req.params.id;
    res.json({
        id: "",
        summary: "",
        sku: {
            id: "",
            type: 1,
            dependent_sku_id: null,
            application_id: "",
            manifets_labels: [],
            access_type: 2,
            name: "",
            features: [],
            relase_date: "",
            premium: false,
            slug: "",
            flags: 4,
            genres: [],
            legal_notice: "",
            application: {
                id: "",
                name: "",
                icon: "",
                description: "",
                summary: "",
                cover_image: "",
                primary_sku_id: "",
                hook: true,
                slug: "",
                guild_id: "",
                bot_public: "",
                bot_require_code_grant: false,
                verify_key: "",
                publishers: [
                    {
                        id: "",
                        name: ""
                    }
                ],
                developers: [
                    {
                        id: "",
                        name: ""
                    }
                ],
                system_requirements: {},
                show_age_gate: false,
                price: {
                    amount: 0,
                    currency: "EUR"
                },
                locales: []
            },
            tagline: "",
            description: "",
            carousel_items: [
                {
                    asset_id: ""
                }
            ],
            header_logo_dark_theme: {},
            header_logo_light_theme: {},
            box_art: {},
            thumbnail: {},
            header_background: {},
            hero_background: {},
            assets: []
        }
    }).status(200);
}));
exports.default = router;
