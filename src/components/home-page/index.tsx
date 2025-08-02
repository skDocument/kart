// Next.js App entry with Persian calendar, vacation days, and total calculations (TypeScript + react-datepicker2)

"use client";

import { useState, useEffect } from "react";
import moment, { Moment } from "moment-jalaali";
import {
  LocalizationProvider,
  DatePicker as MUIDatePicker,
} from "@mui/x-date-pickers";
import { AdapterMomentJalaali } from "@mui/x-date-pickers/AdapterMomentJalaali";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import { iranHolidays1404, iranHolidays1405 } from "@/lib/constants";
import { exportToExcel } from "@/lib/utils";
import styles from "./styles.module.css";
interface TimesheetRow {
  date: string;
  weekday: string;
  entry: string;
  exit: string;
  normalHours: number;
  overtime: string;
  isVacation?: boolean;
  entryDate?: string;
  exitDate?: string;
}

function generateRandomTimes(entry: string, exit: string) {
  const [entryHour, entryMin] = entry.split(":").map(Number);
  const [exitHour, exitMin] = exit.split(":").map(Number);

  const entryBase = moment().hour(entryHour).minute(entryMin);
  const exitBase = moment().hour(exitHour).minute(exitMin);

  const beforeOffset = Math.floor(Math.random() * 21);
  const afterOffset = Math.floor(Math.random() * 26);

  const entryFinal = moment(entryBase).subtract(beforeOffset, "minutes");
  const exitFinal = moment(exitBase).add(afterOffset, "minutes");

  return {
    entry: entryFinal.format("HH:mm"),
    exit: exitFinal.format("HH:mm"),
    beforeMinutes: beforeOffset,
    afterMinutes: afterOffset,
  };
}

function generateWorkDays(month: Moment): string[] {
  const daysInMonth = getDaysInJalaliMonth(month.jYear(), month.jMonth() + 1); // +1 because month is 0-indexed in moment

  const days: string[] = [];
  console.log('daysInMonth ',daysInMonth);
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = moment(
      `${month.jYear()}/${month.jMonth() + 1}/${day}`,
      "jYYYY/jM/jD"
    );
    days.push(date.format("jYYYY/jMM/jDD"));
  }
  return days;
}

// Helper function to get number of days in a given month of a given year in Jalali calendar
function getDaysInJalaliMonth(year: number, month: number): number {
  // These are the days in each month in the Jalali calendar
  const daysInMonths = [
    31,
    // year % 4 === 3 && month === 12 ? 30 : 31,
    31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29,
  ];
  return daysInMonths[month - 1];
}

function fetchIranHolidays(year: number): string[] {
  if (year === 1404) return iranHolidays1404;
  if (year === 1405) return iranHolidays1405;
  return [];
}

export default function Home() {
  moment.loadPersian({ dialect: "persian-modern", usePersianDigits: false });

  const [month, setMonth] = useState<Moment>(moment());
  const [entryTime, setEntryTime] = useState<string>("10:00");
  const [exitTime, setExitTime] = useState<string>("19:00");
  const [vacationDays, setVacationDays] = useState<string[]>([]);
  // const [manualVacationTimes, setManualVacationTimes] = useState<
  //   Record<string, { entry: string; exit: string }>
  // >({});
  const [holidays, setHolidays] = useState<string[]>([]);
  const [data, setData] = useState<TimesheetRow[]>([]);

  useEffect(() => {
    const loadHolidays = async () => {
      const year = month.jYear();
      const hdays = await fetchIranHolidays(year);
      setHolidays(hdays);
    };
    loadHolidays();
  }, [month]);

  const handleGenerate = () => {
    const workdays = generateWorkDays(month);
    const result = workdays.map((date: string) => {
      const weekday = moment(date, "jYYYY/jMM/jDD").format("dddd");
      const isWeekend = weekday === "پنج‌شنبه" || weekday === "جمعه";
      const isHoliday = holidays.includes(date);

      const formattedEntryDate = moment(date, "jYYYY/jMM/jDD").format(
        "jMM/jDD"
      );
      const formattedExitDate = formattedEntryDate;

      if (isWeekend || isHoliday) {
        return {
          date,
          weekday:
            weekday === "جمعه" || isHoliday
              ? `${weekday} تعطیل رسمی`
              : weekday === "پنج‌شنبه"
              ? "پنجشنبه تعطیل توافقی"
              : weekday,
          entry: "0:00",
          exit: "0:00",
          normalHours: 0,
          overtime: "",
          isVacation: false,
          entryDate: "",
          exitDate: "",
        };
      }

      if (vacationDays.includes(date)) {
        // const manual = manualVacationTimes[date];
        // const entry = manual?.entry || entryTime;
        // const exit = manual?.exit || exitTime;
        return {
          //   date,
          //   weekday,
          //   entry,
          //   exit,
          //   normalHours: 9,
          //   overtime: "0:00",
          //   isVacation: true,
          //   entryDate: formattedEntryDate,
          //   exitDate: formattedExitDate,
          date,
          weekday,
          entry: "0:00",
          exit: "0:00",
          normalHours: 0,
          overtime: "",
          isVacation: true,
          entryDate: "",
          exitDate: "",
        };
      } else {
        const { entry, exit } = generateRandomTimes(entryTime, exitTime);
        const start = moment(entry, "HH:mm");
        const end = moment(exit, "HH:mm");
        const workedMinutes = end.diff(start, "minutes");
        const baseWorkMinutes = 9 * 60;

        const normalMinutes = Math.min(workedMinutes, baseWorkMinutes);
        let overtimeRaw = workedMinutes - baseWorkMinutes;
        overtimeRaw = Math.max(0, overtimeRaw);
        overtimeRaw = Math.min(overtimeRaw, 60);

        const overtimeHours = Math.floor(overtimeRaw / 60);
        const overtimeMinutes = overtimeRaw % 60;
        const overtimeFormatted = `${overtimeHours}:${overtimeMinutes
          .toString()
          .padStart(2, "0")}`;

        return {
          date,
          weekday,
          entry,
          exit,
          normalHours: parseFloat((normalMinutes / 60).toFixed(2)),
          overtime: overtimeFormatted,
          isVacation: false,
          entryDate: formattedEntryDate,
          exitDate: formattedExitDate,
        };
      }
    });
    setData(result);
  };

  // const generateExcel = () => {
  //   const ws = XLSX.utils.json_to_sheet(data);
  //   const wb = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, "Timesheet");
  //   XLSX.writeFile(wb, "timesheet.xlsx");
  // };

  const handleVacationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const lines = e.target.value
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    setVacationDays(lines);
  };

  const totalNormal = data.reduce((sum, row) => sum + row.normalHours, 0);

  let totalOverMin = 0;
  data.forEach((row) => {
    if (row.overtime) {
      const [h, m] = row.overtime.split(":").map(Number);
      totalOverMin += h * 60 + m;
    }
  });
  const totalOvertime = `${Math.floor(totalOverMin / 60)}:${(totalOverMin % 60)
    .toString()
    .padStart(2, "0")}`;
  const totalVacation = data.filter((row) => row.isVacation).length * 9;
  function formatDecimalHoursToHHMM(hoursDecimal: number): string {
    const totalMinutes = Math.round(hoursDecimal * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(1, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }

  return (
    <main className="p-8 max-w-6xl mx-auto  flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4 mt-16 ">فیش حضور و غیاب</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div dir="rtl" className="mr-6">
          <label className="block mb-1">ماه</label>
          <LocalizationProvider
            dateAdapter={AdapterMomentJalaali}
            adapterLocale="fa"
          >
            <MUIDatePicker
              views={["year", "month"]}
              value={month}
              onChange={(newValue) => {
                if (newValue) setMonth(newValue);
              }}
              label="انتخاب ماه"
              slotProps={{ textField: { size: "small", fullWidth: true } }}
              className={styles.month_picker}
            />
          </LocalizationProvider>
        </div>
        <div>
          <label dir="rtl" className="block mb-1">
            ساعت ورود
          </label>
          <TimePicker
            onChange={(value) => setEntryTime(value as string)}
            value={entryTime}
            disableClock
            format="HH:mm"
            className="w-full border-2 border-solid border-blue-500 h-[40px] rounded-[8px] flex flex-row-reverse"
          />
        </div>
        <div>
          <label dir="rtl" className="block mb-1">
            ساعت خروج
          </label>
          <TimePicker
            onChange={(value) => setExitTime(value as string)}
            value={exitTime}
            disableClock
            format="HH:mm"
            className="w-full border-2 border-solid border-blue-500 h-[40px] rounded-[8px] flex flex-row-reverse "
          />
        </div>
        <div>
          <label dir="rtl" className="block mb-1">
            روزهای مرخصی (هر خط یک تاریخ)
          </label>
          <textarea
            onChange={handleVacationChange}
            rows={4}
            className="w-full   p-2 text-lg text-right border-2 border-solid border-blue-500 rounded-[8px] focus:outline-0"
            placeholder="مثال: 1403/02/10"
          />
        </div>
      </div>
      <div>
        <button
          onClick={handleGenerate}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          تولید جدول
        </button>

        <button
          onClick={() => exportToExcel(data)}
          // onClick={() => generateExcel()}
          className="bg-green-500 text-white px-4 py-2 rounded mt-4 ml-4"
        >
          دریافت خروجی اکسل
        </button>
      </div>
      <div className="mt-8 overflow-x-auto" dir="rtl">
        <table
          className={`w-full text-right border-b border-gray-50 text-sm ${styles.table}`}
        >
          <thead>
            <tr className="bg-[#07B8C9]">
              <th className="border px-2">ردیف</th>
              <th className="border px-2">روز هفته</th>
              <th className="border px-2">تاریخ </th>
              <th className="border px-2">تاریخ ورود</th>
              <th className="border px-2">ساعت ورود</th>
              <th className="border px-2">تاریخ خروج</th>
              <th className="border px-2">ساعت خروج</th>
              <th className="border px-2">کارکرد کل</th>
              <th className="border px-2">عادی مجاز</th>
              <th className="border px-2">مرخصی</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className={row.isVacation ? "bg-[#CC7C00]" : ""}>
                <td className="border px-2">{i + 1}</td>
                <td className="border px-2">{row.weekday}</td>
                <td className="border px-2 whitespace-nowrap">
                  {moment(row.date, "jYYYY/jMM/jDD").format("MM/DD")}
                </td>
                <td className="border px-2">{row.entryDate}</td>
                <td className="border px-2">{row.entry}</td>
                <td className="border px-2">{row.exitDate}</td>
                <td className="border px-2">{row.exit}</td>
                <td className="border px-2">
                  {row.normalHours ? `${row.normalHours}:00` : ""}
                </td>
                <td className="border px-2">{row.overtime}</td>
                <td className="border px-2">{row.isVacation ? "9:00" : ""}</td>
              </tr>
            ))}
            <tr className="font-bold bg-[#bb3036] p-4">
              <td className="border px-2" colSpan={7}>
                مجموع
              </td>
              <td className="border px-2">
                {formatDecimalHoursToHHMM(totalNormal)}
              </td>
              <td className="border px-2">{totalOvertime}</td>
              <td className="border px-2">
                {formatDecimalHoursToHHMM(totalVacation)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}
