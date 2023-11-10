"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const api_1 = require("../../../index");
const router = (0, express_1.Router)();
router.get("/", (0, api_1.route)({}), (req, res) => {
    // TODO:
    res.json({
        categories: {
            social: true,
            communication: true,
            tips: false,
            updates_and_announcements: false,
            recommendations_and_events: false
        },
        initialized: false
    }).status(200);
});
exports.default = router;
