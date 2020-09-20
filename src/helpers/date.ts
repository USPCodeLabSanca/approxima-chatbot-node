
export const msInASecond = 1000;
export const msInAMinute = msInASecond * 60;
export const msInAnHour = msInAMinute * 60;
export const msInADay = msInAnHour * 24;
export const msInAWeek = msInADay * 7;
export const msInAMonth = msInADay * 30;
export const msInAYear = msInADay * 365;

export const getTimeUnitFromDates = (startDate: Date, endDate: Date): string => {
  const timeDiff = endDate.getTime() - startDate.getTime();
  return getTimeUnitFromDiff(timeDiff);
};

export const getTimeUnitFromDiff = (timeDiff: number, digits = 2): string => {
  if (timeDiff >= msInADay) {
    return `${getDaysFromDiff(timeDiff, digits)} days`;
  }
  else if (timeDiff >= msInAnHour) {
    return `${getHoursFromDiff(timeDiff, digits)} h`;
  }
  else if (timeDiff >= msInAMinute) {
    return `${getMinutesFromDiff(timeDiff, digits)} min`;
  }
  else if (timeDiff >= msInASecond) {
    return `${getMinutesFromDiff(timeDiff, digits)} s`;
  }
  else {
    return `${timeDiff} ms`;
  }
};

export const getDaysFromDiff = (timeDiff: number, digits = 2): number => {
  return +(timeDiff / msInADay).toFixed(digits);
};

export const getHoursFromDiff = (timeDiff: number, digits = 2): number => {
  return +(timeDiff / msInAnHour).toFixed(digits);
};

export const getMinutesFromDiff = (timeDiff: number, digits = 2): number => {
  return +(timeDiff / msInAMinute).toFixed(digits);
};

export const getSecondsFromDiff = (timeDiff: number, digits = 2): number => {
  return +(timeDiff / msInASecond).toFixed(digits);
};

export const getTodayString = (separator = '-'): string => {
  const now = new Date();
  return parseDate(now, separator);
};

export const parseDate = (date: Date, separator = '-'): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}${separator}${month}${separator}${day}`;
};
