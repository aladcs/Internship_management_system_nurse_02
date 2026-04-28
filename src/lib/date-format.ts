type ThaiDateInput = Date | string | number | null | undefined;

const THAI_LOCALE = "th-TH";
const THAI_TIME_ZONE = "Asia/Bangkok";

const thaiDateFormatter = new Intl.DateTimeFormat(THAI_LOCALE, {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: THAI_TIME_ZONE,
});

const thaiDateTimeFormatter = new Intl.DateTimeFormat(THAI_LOCALE, {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: THAI_TIME_ZONE,
});

function toValidDate(value: ThaiDateInput) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function formatThaiDate(value: ThaiDateInput, fallback = "") {
  const date = toValidDate(value);

  if (!date) {
    return fallback;
  }

  return thaiDateFormatter.format(date);
}

export function formatThaiDateTime(value: ThaiDateInput, fallback = "") {
  const date = toValidDate(value);

  if (!date) {
    return fallback;
  }

  return thaiDateTimeFormatter.format(date);
}