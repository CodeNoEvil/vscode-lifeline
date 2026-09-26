const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function pad(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

/** Moment-style clock tokens used by `lifeline.clock.format`. Text in `[brackets]` is copied through. */
export function formatClock(date: Date, pattern: string): string {
  const hours24 = date.getHours();
  const hours12 = hours24 % 12 || 12;
  const values: Record<string, string> = {
    YYYY: String(date.getFullYear()),
    YY: String(date.getFullYear()).slice(-2),
    MMMM: MONTHS[date.getMonth()],
    MMM: MONTHS_SHORT[date.getMonth()],
    MM: pad(date.getMonth() + 1),
    M: String(date.getMonth() + 1),
    DD: pad(date.getDate()),
    D: String(date.getDate()),
    dddd: WEEKDAYS[date.getDay()],
    ddd: WEEKDAYS_SHORT[date.getDay()],
    HH: pad(hours24),
    H: String(hours24),
    hh: pad(hours12),
    h: String(hours12),
    mm: pad(date.getMinutes()),
    m: String(date.getMinutes()),
    ss: pad(date.getSeconds()),
    s: String(date.getSeconds()),
    A: hours24 < 12 ? "AM" : "PM",
    a: hours24 < 12 ? "am" : "pm",
  };
  return pattern.replace(/YYYY|YY|MMMM|MMM|MM|M|DD|D|dddd|ddd|HH|H|hh|h|mm|m|ss|s|A|a|\[[^\]]*\]/g, (token) => {
    if (token.startsWith("[")) {
      return token.slice(1, -1);
    }
    return values[token] ?? token;
  });
}
