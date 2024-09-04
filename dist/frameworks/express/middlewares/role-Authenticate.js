"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const verifyRole = (theRole) => {
    return (req, res, next) => {
        const { role, verified } = req.user;
        if (theRole === role) {
            if (verified)
                return next();
            else
                return res.status(403).json({ message: "not yet verified" });
        }
        else {
            return res.status(403).json({ message: 'Access denied' });
        }
    };
};
exports.default = verifyRole;
