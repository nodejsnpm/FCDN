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
const api_1 = require("../../../../../index");
const router = (0, express_1.Router)();
const skus = new Map([
    [
        "521842865731534868",
        [
            {
                id: "511651856145973248",
                name: "Premium Monthly (Legacy)",
                interval: 1,
                interval_count: 1,
                tax_inclusive: true,
                sku_id: "521842865731534868",
                currency: "usd",
                price: 0,
                price_tier: null
            },
            {
                id: "511651860671627264",
                name: "Premium Yearly (Legacy)",
                interval: 2,
                interval_count: 1,
                tax_inclusive: true,
                sku_id: "521842865731534868",
                currency: "usd",
                price: 0,
                price_tier: null
            }
        ]
    ],
    [
        "521846918637420545",
        [
            {
                id: "511651871736201216",
                name: "Premium Classic Monthly",
                interval: 1,
                interval_count: 1,
                tax_inclusive: true,
                sku_id: "521846918637420545",
                currency: "usd",
                price: 0,
                price_tier: null
            },
            {
                id: "511651876987469824",
                name: "Premium Classic Yearly",
                interval: 2,
                interval_count: 1,
                tax_inclusive: true,
                sku_id: "521846918637420545",
                currency: "usd",
                price: 0,
                price_tier: null
            }
        ]
    ],
    [
        "521847234246082599",
        [
            {
                id: "642251038925127690",
                name: "Premium Quarterly",
                interval: 1,
                interval_count: 3,
                tax_inclusive: true,
                sku_id: "521847234246082599",
                currency: "usd",
                price: 0,
                price_tier: null
            },
            {
                id: "511651880837840896",
                name: "Premium Monthly",
                interval: 1,
                interval_count: 1,
                tax_inclusive: true,
                sku_id: "521847234246082599",
                currency: "usd",
                price: 0,
                price_tier: null
            },
            {
                id: "511651885459963904",
                name: "Premium Yearly",
                interval: 2,
                interval_count: 1,
                tax_inclusive: true,
                sku_id: "521847234246082599",
                currency: "usd",
                price: 0,
                price_tier: null
            }
        ]
    ],
    [
        "590663762298667008",
        [
            {
                id: "590665532894740483",
                name: "Server Boost Monthly",
                interval: 1,
                interval_count: 1,
                tax_inclusive: true,
                sku_id: "590663762298667008",
                discount_price: 0,
                currency: "usd",
                price: 0,
                price_tier: null
            },
            {
                id: "590665538238152709",
                name: "Server Boost Yearly",
                interval: 2,
                interval_count: 1,
                tax_inclusive: true,
                sku_id: "590663762298667008",
                discount_price: 0,
                currency: "usd",
                price: 0,
                price_tier: null
            }
        ]
    ]
]);
router.get("/", (0, api_1.route)({}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // TODO: add the ability to add custom
    const { sku_id } = req.params;
    if (!skus.has(sku_id)) {
        console.log(`Request for invalid SKU ${sku_id}! Please report this!`);
        res.sendStatus(404);
    }
    else {
        res.json(skus.get(sku_id)).status(200);
    }
}));
exports.default = router;
