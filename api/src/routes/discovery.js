"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const api_1 = require("../index");
const router = (0, express_1.Router)();
router.get("/categories", (0, api_1.route)({}), (req, res) => {
    // TODO:
    //const { locale, primary_only } = req.query;
    res.json([]).status(200);
});
exports.default = router;
