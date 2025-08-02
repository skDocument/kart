import moment, { Moment } from "moment-jalaali";

export function generateWorkDays(month: Moment): string[] {
  const start = month.clone().startOf("jMonth");
  const end = month.clone().endOf("jMonth");
  const days: string[] = [];

  for (let m = start.clone(); m.isSameOrBefore(end); m.add(1, "day")) {
    const weekday = m.format("d"); // 0 = Sunday, 6 = Saturday
    const jWeekday = parseInt(weekday); // in Jalaali: 6 = Friday, 5 = Thursday

    if (jWeekday < 5) {
      days.push(m.format("jYYYY/jMM/jDD"));
    }
  }

  return days;
}

function getRandomOffset(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateRandomTimes(entry: string, exit: string) {
  const [entryHour, entryMinute] = entry.split(":").map(Number);
  const [exitHour, exitMinute] = exit.split(":").map(Number);

  const entryBase = moment().hours(entryHour).minutes(entryMinute);
  const exitBase = moment().hours(exitHour).minutes(exitMinute);

  const entryRand = entryBase
    .clone()
    .subtract(getRandomOffset(0, 20), "minutes");
  const exitRand = exitBase.clone().add(getRandomOffset(0, 25), "minutes");

  const totalMinutes = exitRand.diff(entryRand, "minutes");
  const normalMinutes = Math.min(totalMinutes, 9 * 60);
  const overtimeMinutes = Math.max(0, totalMinutes - 9 * 60);

  return {
    entry: entryRand.format("HH:mm"),
    exit: exitRand.format("HH:mm"),
    normalHours: parseFloat((normalMinutes / 60).toFixed(2)),
    overtime: parseFloat((overtimeMinutes / 60).toFixed(2)),
  };
}

export const iranHolidays1404 = [
  "1404/01/01", // جمعه – آغاز نوروز
  "1404/01/02", // شنبه – نوروز و شهادت حضرت علی
  "1404/01/03", // یکشنبه – نوروز
  "1404/01/04", // دوشنبه – نوروز
  "1404/01/11", // دوشنبه – عید سعید فطر
  "1404/01/12", // سه‌شنبه – روز جمهوری اسلامی
  "1404/01/13", // چهارشنبه – روز طبیعت
  "1404/02/04", // پنج‌شنبه – شهادت امام جعفر صادق
  "1404/03/14", // چهارشنبه – رحلت امام خمینی
  "1404/03/15", // پنج‌شنبه – قیام ۱۵ خرداد
  "1404/03/16", // جمعه – عید سعید قربان
  "1404/03/24", // شنبه – عید سعید غدیر خم
  "1404/04/14", // شنبه – تاسوعای حسینی
  "1404/04/15", // یکشنبه – عاشورای حسینی
  "1404/05/23", // پنج‌شنبه – اربعین حسینی
  "1404/05/31", // جمعه – رحلت پیامبر و شهادت امام حسن مجتبی
  "1404/06/02", // یکشنبه – شهادت امام رضا
  "1404/06/10", // دوشنبه – شهادت امام حسن عسکری و آغاز امامت حضرت ولیعصر
  "1404/06/19", // چهارشنبه – میلاد پیامبر و امام جعفر صادق
  "1404/09/03", // دوشنبه – شهادت حضرت فاطمه زهرا
  "1404/10/13", // شنبه – ولادت امام علی و روز پدر
  "1404/10/27", // شنبه – مبعث پیامبر
  "1404/11/15", // چهارشنبه – ولادت حضرت قائم (عج)
  "1404/11/22", // چهارشنبه – پیروزی انقلاب اسلامی
  "1404/12/20", // چهارشنبه – شهادت حضرت علی
  "1404/12/29", // جمعه – روز ملی شدن صنعت نفت
];

// export const iranHolidays1405 = [
//   "1405/01/01",
//   "1405/01/02",
//   "1405/01/03",
//   "1405/01/04",
//   "1405/01/12",
//   "1405/01/13",
//   "1405/01/14",
//   "1405/01/21",
//   "1405/02/05",
//   "1405/02/26",
//   "1405/03/03",
//   "1405/03/15",
//   "1405/04/05",
//   "1405/04/15",
//   "1405/04/25",
//   "1405/05/14",
//   "1405/05/24",
//   "1405/06/02",
//   "1405/07/11",
//   "1405/07/18",
//   "1405/08/15",
//   "1405/08/23",
//   "1405/09/15",
//   "1405/10/06",
//   "1405/10/27",
//   "1405/11/22",
//   "1405/12/29",
// ];


export const iranHolidays1405 = [
  "1405/01/01",
  "1405/01/02",
  "1405/01/03",
  "1405/01/04",
  "1405/01/12",
  "1405/01/13",
  "1405/01/14",
  // مناسبت‌های مذهبی قمری که حوالی تاریخ‌های زیر قابل‌پیش‌بینی‌اند:
  "1405/02/??", // شهادت امام جعفر صادق
  "1405/03/??", // رحلت امام خمینی و قیام
  "1405/03/??", // عید قربان
  "1405/04/??", // عید غدیر
  "1405/04/??", // تاسوعا
  "1405/04/??", // عاشورا
  "1405/05/??", // اربعین
  "1405/06/??", // رحلت پیامبر و امام حسن
  "1405/06/??", // شهادت امام رضا
  "1405/06/??", // شهادت امام حسن عسکری و آغاز امامت
  "1405/06/??", // میلاد پیامبر و امام جعفر صادق
  "1405/09/??", // شهادت حضرت فاطمه
  "1405/10/??", // ولادت امام علی / روز پدر
  "1405/10/??", // مبعث
  "1405/11/??", // ولادت حضرت قائم (عج)
  "1405/11/22",
  "1405/12/29"
];
