"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentMonthDates = exports.getCurrentWeekDates = void 0;
const date_fns_1 = require("date-fns");
const getCurrentWeekDates = () => {
    const today = new Date();
    const firstDay = today.getDate() - today.getDay();
    const lastDay = firstDay + 6;
    const startOfWeek = new Date(today.setDate(firstDay));
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(today.setDate(lastDay));
    endOfWeek.setHours(23, 59, 59, 999);
    return { startOfWeek, endOfWeek };
};
exports.getCurrentWeekDates = getCurrentWeekDates;
const getCurrentMonthDates = () => {
    const now = new Date();
    return {
        startOfMonth: (0, date_fns_1.startOfMonth)(now),
        endOfMonth: (0, date_fns_1.endOfMonth)(now),
    };
};
exports.getCurrentMonthDates = getCurrentMonthDates;
