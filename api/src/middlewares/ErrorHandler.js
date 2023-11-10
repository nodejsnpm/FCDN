"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
const lambert_server_1 = require("lambert-server");
const util_1 = require("../../../util/src/index");
const EntityNotFoundErrorRegex = /"(\w+)"/;
function ErrorHandler(error, req, res, next) {
    var _a, _b, _c;
    if (!error)
        return next();
    try {
        let code = 400;
        let httpcode = code;
        let message = error === null || error === void 0 ? void 0 : error.toString();
        let errors = undefined;
        if (error instanceof lambert_server_1.HTTPError && error.code)
            code = httpcode = error.code;
        else if (error instanceof util_1.ApiError) {
            code = error.code;
            message = error.message;
            httpcode = error.httpStatus;
        }
        else if (error.name === "EntityNotFoundError") {
            message = `${((_a = error.message.match(EntityNotFoundErrorRegex)) === null || _a === void 0 ? void 0 : _a[1]) || "Item"} could not be found`;
            code = httpcode = 404;
        }
        else if (error instanceof util_1.FieldError) {
            code = Number(error.code);
            message = error.message;
            errors = error.errors;
        }
        else {
            console.error(`[Error] ${code} ${req.url}\n`, errors || error, "\nbody:", req.body);
            if ((_c = (_b = req.server) === null || _b === void 0 ? void 0 : _b.options) === null || _c === void 0 ? void 0 : _c.production) {
                // don't expose internal errors to the user, instead human errors should be thrown as HTTPError
                message = "Internal Server Error";
            }
            code = httpcode = 500;
        }
        if (httpcode > 511)
            httpcode = 400;
        res.status(httpcode).json({ code: code, message, errors });
    }
    catch (error) {
        console.error(`[Internal Server Error] 500`, error);
        return res.status(500).json({ code: 500, message: "Internal Server Error" });
    }
}
exports.ErrorHandler = ErrorHandler;
