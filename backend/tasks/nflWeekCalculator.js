export function calculateNFLWeekAndDay(currentDate) {
  const nflYear = parseInt(process.env.VITE_NFL_YEAR) || 2025;
  const seasonStartStr = process.env.VITE_NFL_SEASON_START || `${nflYear}-09-04`;

  // If only a date string is provided (no time), treat it as midnight Eastern time.
  // Season always opens in EDT (UTC-4), so midnight ET = 04:00 UTC.
  const hasTime = seasonStartStr.includes('T');
  const seasonStartDate = hasTime
    ? new Date(seasonStartStr)
    : new Date(`${seasonStartStr.slice(0, 10)}T04:00:00Z`);

  // 18 regular season weeks + a few days buffer for scheduling variance
  const seasonEndDate = new Date(seasonStartDate.getTime() + 130 * 24 * 60 * 60 * 1000);

  // Convert a Date to its Eastern calendar date string "YYYY-MM-DD".
  // Intl.DateTimeFormat with America/New_York handles EDT/EST transitions automatically,
  // eliminating the need for a hardcoded UTC offset.
  const toEasternDay = (date) =>
    date.toLocaleDateString('en-CA', { timeZone: 'America/New_York' });

  const currentEtDay = toEasternDay(currentDate);
  const startEtDay = toEasternDay(seasonStartDate);
  const endEtDay = toEasternDay(seasonEndDate);

  if (currentEtDay < startEtDay || currentEtDay > endEtDay) {
    return { week: 0, day: 0 };
  }

  // Arithmetic on UTC-midnight representations of Eastern calendar days avoids
  // any remaining DST complication in the subtraction.
  const currentEtMs = new Date(currentEtDay + 'T00:00:00Z').getTime();
  const startEtMs = new Date(startEtDay + 'T00:00:00Z').getTime();

  const diffInDays = Math.floor((currentEtMs - startEtMs) / (1000 * 3600 * 24));
  const nflWeek = Math.floor(diffInDays / 7) + 1;
  const nflDay = (diffInDays % 7) + 1;

  return { week: nflWeek, day: nflDay, year: nflYear };
}

// Quick tests (uncomment to verify)
// const seasonStart = new Date('2025-09-02T04:00:00Z'); // Midnight ET opening Tuesday
// const tests = [
//   { date: new Date('2025-09-09T00:20:00Z'), expected: { week: 1, day: 7 } }, // Mon MNF 8:20pm ET
//   { date: new Date('2025-09-08T00:20:00Z'), expected: { week: 1, day: 6 } }, // Sun SNF 8:20pm ET
//   { date: new Date('2025-09-12T00:15:00Z'), expected: { week: 2, day: 3 } }, // Thu TNF 8:15pm ET
//   { date: new Date('2025-09-14T17:00:00Z'), expected: { week: 2, day: 6 } }, // Sun 1pm ET
//   { date: new Date('2025-09-16T00:15:00Z'), expected: { week: 2, day: 7 } }, // Mon MNF 8:15pm ET
//   // DST ends Nov 2 2025 — these should still land in the correct week
//   { date: new Date('2025-11-03T03:59:00Z'), expected: { week: 10, day: 1 } }, // Mon 11:59pm EDT (week 9 last moment)
//   { date: new Date('2025-11-04T05:00:00Z'), expected: { week: 10, day: 2 } }, // Tue midnight EST (week 10 begins)
// ];
// tests.forEach(({ date, expected }) => {
//   const result = calculateNFLWeekAndDay(date);
//   const pass = result.week === expected.week && result.day === expected.day;
//   console.log(`${pass ? '✓' : '✗'} ${date.toISOString()} → week ${result.week} day ${result.day} (expected week ${expected.week} day ${expected.day})`);
// });
