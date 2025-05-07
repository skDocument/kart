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
  "1404/01/01",
  "1404/01/02",
  "1404/01/03",
  "1404/01/04",
  "1404/01/11",
  "1404/01/12",
  "1404/01/13",
  "1404/01/14",
  "1404/01/21",
  "1404/02/26",
  "1404/03/14",
  "1404/03/25",
  "1404/04/07",
  "1404/04/17",
  "1404/04/27",
  "1404/05/17",
  "1404/05/26",
  "1404/06/04",
  "1404/07/13",
  "1404/07/20",
  "1404/08/17",
  "1404/08/25",
  "1404/09/17",
  "1404/10/08",
  "1404/10/29",
  "1404/11/22",
  "1404/12/29",
];

export const iranHolidays1405 = [
  "1405/01/01",
  "1405/01/02",
  "1405/01/03",
  "1405/01/04",
  "1405/01/12",
  "1405/01/13",
  "1405/01/14",
  "1405/01/21",
  "1405/02/05",
  "1405/02/26",
  "1405/03/03",
  "1405/03/15",
  "1405/04/05",
  "1405/04/15",
  "1405/04/25",
  "1405/05/14",
  "1405/05/24",
  "1405/06/02",
  "1405/07/11",
  "1405/07/18",
  "1405/08/15",
  "1405/08/23",
  "1405/09/15",
  "1405/10/06",
  "1405/10/27",
  "1405/11/22",
  "1405/12/29",
];
