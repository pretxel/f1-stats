import dayjs from "dayjs";
const isBetween = require("dayjs/plugin/isBetween");
dayjs.extend(isBetween);

const isLiveSessionNow = (sessionStartDate: Date, sessionEndDate: Date) => {
  const now = new Date();

  const daySession = sessionStartDate.getDate();
  const monthSession = sessionStartDate.getMonth();
  const yearSession = sessionStartDate.getFullYear();
  const dayNow = now.getDate();
  const monthNow = now.getMonth();
  const yearNow = now.getFullYear();

  if (
    daySession === dayNow &&
    monthSession === monthNow &&
    yearSession === yearNow &&
    dayjs(now).isBetween(dayjs(sessionStartDate), dayjs(sessionEndDate))
  ) {
    return true;
  }

  return false;
};

export default isLiveSessionNow;
