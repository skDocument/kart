/* eslint-disable @typescript-eslint/no-explicit-any */
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface TimesheetRow {
  date: string;
  weekday: string;
  entry: string;
  exit: string;
  normalHours: number; // in HH:MM
  overtime: string; // in HH:MM
  entryDate?: string;
  exitDate?: string;
  isVacation?: boolean;
}

export function exportToExcel(data: TimesheetRow[]) {
  const wsData: any[][] = [];

  // Header rows
  wsData.push([
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "اضافه کار",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "کسر کار",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "مرخصی",
    "",
    "",
  ]);

  wsData.push([
    "ردیف",
    "روز هفته",
    "تاریخ",
    "تاریخ ورود",
    "تاریخ خروج",
    "ورود",
    "خروج",
    "ساعت کار کل",
    "ساعت کار عادی",
    "اضافه کار عادی",
    "اضافه کار تعطیل",
    "اضافه کار در ماموریت",
    "اضافه کار ویژه",
    "",
    "",
    "",
    "",
    "تاخیر شروع",
    "تعجیل خروج",
    "غیبت",
    "تاخیر غیرمجاز",
    "تعجیل غیرمجاز",
    "ویژه",
    "",
    "",
    "مرخصی با حقوق",
    "بدون حقوق",
  ]);

  // Data rows
  data.forEach((row, index) => {
    const normalMins = Math.round((row.normalHours || 0) * 60);
    const isVacation = row.isVacation;

    wsData.push([
      index + 1,
      row.weekday,
      row.date,
      isVacation ? "" : row.entryDate,
      isVacation ? "" : row.exitDate,
      isVacation ? "0:00" : row.entry,
      isVacation ? "0:00" : row.exit,
      isVacation ? "" : formatHM(normalMins),
      isVacation ? "" : formatHM(normalMins),
      isVacation ? "" : row.overtime,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      isVacation ? "9:00" : "",
      "",
      "",
    ]);
  });

  // Totals
  const totalNormalMins = data.reduce(
    (sum, row) => sum + (row.isVacation ? 0 : Math.round(row.normalHours * 60)),
    0
  );
  const totalOverMin = data.reduce((sum, row) => {
    if (!row.overtime) return sum;
    const [h, m] = row.overtime.split(":").map(Number);
    return sum + h * 60 + m;
  }, 0);
  const totalVacationMins = data.filter((r) => r.isVacation).length * 540;

  wsData.push([
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    formatHM(totalNormalMins),
    formatHM(totalNormalMins),
    formatHM(totalOverMin),
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    formatHM(totalVacationMins),
    "",
    "",
  ]);

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Merge headers
  const merges = [
    { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }, // ردیف
    { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } }, // روز هفته
    { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } }, // تاریخ
    { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } }, // تاریخ ورود
    { s: { r: 0, c: 4 }, e: { r: 1, c: 4 } }, // تاریخ خروج
    { s: { r: 0, c: 5 }, e: { r: 1, c: 5 } }, // ورود
    { s: { r: 0, c: 6 }, e: { r: 1, c: 6 } }, // خروج
    { s: { r: 0, c: 7 }, e: { r: 1, c: 7 } }, // ساعت کل
    { s: { r: 0, c: 8 }, e: { r: 1, c: 8 } }, // ساعت عادی

    { s: { r: 0, c: 9 }, e: { r: 0, c: 15 } }, // اضافه کار
    { s: { r: 1, c: 9 }, e: { r: 1, c: 15 } }, // زیربخش‌ها

    { s: { r: 0, c: 16 }, e: { r: 0, c: 23 } }, // کسر کار
    { s: { r: 1, c: 16 }, e: { r: 1, c: 23 } },

    { s: { r: 0, c: 24 }, e: { r: 0, c: 26 } }, // مرخصی
    { s: { r: 1, c: 24 }, e: { r: 1, c: 26 } },
  ];
  ws["!merges"] = merges;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "کارکرد ماهانه");

  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(
    new Blob([wbout], { type: "application/octet-stream" }),
    "timesheet.xlsx"
  );
}

function formatHM(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}
