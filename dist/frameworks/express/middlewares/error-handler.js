"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler = (error, req, res, next) => {
    res.status(500).json({ error: error.message });
};
exports.default = errorHandler;
