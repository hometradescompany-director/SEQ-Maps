function parseIsoTimestamp(value) {
  if (typeof value !== "string") return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match) return null;

  const [, year, month, day, hour, minute, second, , zone] = match;
  const numericYear = Number(year);
  const numericMonth = Number(month);
  const numericDay = Number(day);
  if (numericMonth < 1 || numericMonth > 12) return null;
  const leapYear = numericYear % 4 === 0 && (numericYear % 100 !== 0 || numericYear % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][numericMonth - 1];
  if (numericDay < 1 || numericDay > daysInMonth) {
    return null;
  }
  if (Number(hour) > 23 || Number(minute) > 59 || Number(second) > 59) return null;
  if (zone !== "Z") {
    const [zoneHour, zoneMinute] = zone.slice(1).split(":").map(Number);
    if (zoneHour > 23 || zoneMinute > 59) return null;
  }

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function assessObservationFreshness(observation, nowMs, maxAgeMs) {
  if (!Number.isFinite(nowMs) || !Number.isFinite(maxAgeMs) || maxAgeMs < 0) return {usable:false,reason:"invalid_policy"};
  if (!observation || typeof observation !== "object") return {usable:false,reason:"missing_observation"};
  if (typeof observation.source !== "string" || !observation.source.trim()) return {usable:false,reason:"missing_source"};
  if (typeof observation.licence !== "string" || !observation.licence.trim()) return {usable:false,reason:"missing_licence"};
  const time = parseIsoTimestamp(observation.observedAt);
  if (time === null) return {usable:false,reason:"invalid_time"};
  if (time > nowMs) return {usable:false,reason:"future_observation"};
  if (nowMs - time > maxAgeMs) return {usable:false,reason:"stale_observation"};
  return {usable:true,reason:"fresh"};
}
