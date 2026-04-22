interface NFLWeekResult {
  week: number;
  day: number;
  year?: number;
}

// NFL seasons config — update each year
const NFL_SEASONS = [
  { year: 2025, start: '2025-09-02T00:00:00-04:00', end: '2026-01-05T00:00:00-05:00' },
];

export function calculateNFLWeekAndDay(currentDate: Date): NFLWeekResult {
  const season = NFL_SEASONS.find((s) => {
    const start = new Date(s.start);
    const end = new Date(s.end);
    return currentDate >= start && currentDate <= end;
  });

  if (!season) {
    return { week: 0, day: 0 };
  }

  const seasonStart = new Date(season.start);
  const diffInDays = Math.floor((currentDate.getTime() - seasonStart.getTime()) / (1000 * 3600 * 24));
  const nflWeek = Math.floor(diffInDays / 7) + 1;
  const nflDay = (diffInDays % 7) + 1;

  return { week: nflWeek, day: nflDay, year: season.year };
}
