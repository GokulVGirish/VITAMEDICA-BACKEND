import { startOfMonth, endOfMonth } from "date-fns";
export const getCurrentWeekDates = () => {
  const today = new Date();
  const firstDay = today.getDate() - today.getDay();
  const lastDay = firstDay + 6;

  const startOfWeek = new Date(today.setDate(firstDay));
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(today.setDate(lastDay));
  endOfWeek.setHours(23, 59, 59, 999);

  return { startOfWeek, endOfWeek };
};

export const getCurrentMonthDates = () => {
  const now = new Date();
  return {
    startOfMonth: startOfMonth(now),
    endOfMonth: endOfMonth(now),
  };
};
