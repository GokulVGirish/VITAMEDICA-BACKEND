"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hasStatusCode = (error) => {
    return typeof error.statusCode === "number";
};
const errorHandler = (error, req, res, next) => {
    if (hasStatusCode(error)) {
        res.status(error.statusCode).json({ error: error.message });
    }
    else {
        res.status(500).json({ error: error.message });
    }
};
exports.default = errorHandler;
