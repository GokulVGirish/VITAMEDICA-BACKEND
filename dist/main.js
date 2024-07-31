"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./frameworks/express/app"));
const db_1 = __importDefault(require("./frameworks/config/db"));
(0, db_1.default)();
app_1.default.listen(process.env.PORT, () => {
    console.log(`server listening and is ready to go ${process.env.PORT}`);
});
