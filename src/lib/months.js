const monthFormatter = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
});

const monthNumbers = [
  "Nol",
  "Satu",
  "Dua",
  "Tiga",
  "Empat",
  "Lima",
  "Enam",
  "Tujuh",
  "Delapan",
  "Sembilan",
  "Sepuluh",
  "Sebelas",
  "Dua Belas",
];

const englishNumbers = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
];

export function currentMonthId(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

export function monthLabel(monthId) {
  if (!monthId) return "";

  const date = new Date(`${monthId}-01T00:00:00`);
  if (Number.isNaN(date.getTime())) return monthId;

  return monthFormatter.format(date);
}

export function nextMonthId(monthId) {
  const date = new Date(`${monthId}-01T00:00:00`);
  if (Number.isNaN(date.getTime())) return currentMonthId();

  date.setMonth(date.getMonth() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

export function monthsTogether(startDate, monthId) {
  if (!startDate || !monthId) return 0;

  const start = new Date(startDate);
  const monthStart = new Date(`${monthId}-01T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(monthStart.getTime())) {
    return 0;
  }

  const lastDay = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth() + 1,
    0
  ).getDate();
  const anniversary = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth(),
    Math.min(start.getDate(), lastDay)
  );

  if (anniversary < start) return 0;

  const count =
    (anniversary.getFullYear() - start.getFullYear()) * 12 +
    (anniversary.getMonth() - start.getMonth());

  return Math.max(0, count);
}

export function monthTitle(monthsCount) {
  if (monthsCount <= 0) return "Bulan Pertama";
  if (monthsCount === 1) return "Satu Bulan";
  if (monthsCount <= 12) return `${monthNumbers[monthsCount]} Bulan`;
  return `Bulan ke-${monthsCount}`;
}

export function monthTitleFor(startDate, monthId) {
  return monthTitle(monthsTogether(startDate, monthId));
}

export function monthScript(monthsCount) {
  if (monthsCount <= 0) return "Our First Chapter";
  if (monthsCount === 1) return "Happy One Month";
  if (monthsCount <= 12) {
    return `Happy ${englishNumbers[monthsCount]} Months`;
  }
  return `Happy ${monthsCount} Months`;
}

export function monthScriptFor(startDate, monthId) {
  return monthScript(monthsTogether(startDate, monthId));
}
