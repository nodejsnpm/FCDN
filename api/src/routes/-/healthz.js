"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const api_1 = require("../../index");
const typeorm_1 = require("typeorm");
const router = (0, express_1.Router)();
router.get("/", (0, api_1.route)({}), (req, res) => {
    try {
        // test that the database is alive & responding
        (0, typeorm_1.getConnection)();
        return res.sendStatus(200);
    }
    catch (e) {
        res.sendStatus(503);
    }
});
exports.default = router;
