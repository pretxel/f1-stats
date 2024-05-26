import dayjs from "dayjs";
const isBetween = require("dayjs/plugin/isBetween");
dayjs.extend(isBetween);

const isLiveSessionNow = (sessionStartDate: Date, sessionEndDate: Date) => {
  const now = new Date();

  const daySession = sessionStartDate.getDate();
  const monthSession = sessionStartDate.getMonth();
  const dayNow = now.getDate();
  const monthNow = now.getMonth();

  if (
    daySession === dayNow &&
    monthSession === monthNow &&
    dayjs(now).isBetween(dayjs(sessionStartDate), dayjs(sessionEndDate))
  ) {
    return true;
  }

  return false;
};

export default isLiveSessionNow;
