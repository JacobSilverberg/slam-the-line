export function calculateNFLWeekAndDay(currentDate) {
  // Define the start date of the NFL season (Tuesday, Sep 2nd, 2025) in EST
  const seasonStartDate = new Date('2025-09-02T00:00:00-04:00'); // EST
  const seasonEndDate = new Date('2026-01-05T00:00:00-05:00'); // EST
  const nflYear = 2025;

  // Convert the current date to EST (Eastern Standard Time)
  const estOffset = -5 * 60; // EST is UTC-5
  const estDate = new Date(
    currentDate.getTime() +
      (currentDate.getTimezoneOffset() + estOffset) * 60000
  );

  // Calculate the difference in days between the current date and the season start date
  const diffInDays = Math.floor(
    (estDate.getTime() - seasonStartDate.getTime()) / (1000 * 3600 * 24)
  );

  // If before the season starts or after it ends, return week: 0, day: 0, no nflYear
  if (diffInDays < 0 || estDate > seasonEndDate) {
    return { week: 0, day: 0 };
  }

  // Calculate the NFL week and day
  const nflWeek = Math.floor(diffInDays / 7) + 1;
  const nflDay = (diffInDays % 7) + 1;

  return { week: nflWeek, day: nflDay, year: nflYear };
}

// // Quick tests
// const testDates = [
//     { date: new Date('2025-09-09T00:20:00Z'), expected: { week: 1, day: 7 } },  // Tuesday
//     { date: new Date('2025-09-08T00:20:00Z'), expected: { week: 1, day: 6 } },  // Wednesday
//     { date: new Date('2025-09-12T00:20:00Z'), expected: { week: 2, day: 3 } },  // Monday night (just before midnight EST)
//     { date: new Date('2025-09-14T17:00:00Z'), expected: { week: 2, day: 6 } },  // Tuesday (next week)
//     { date: new Date('2025-09-16T00:15:00Z'), expected: { week: 2, day: 7 } },  // Monday
//   ];

//   testDates.forEach(({ date, expected }) => {
//     const result = calculateNFLWeekAndDay(date);
//     console.log(`Date: ${date.toISOString().split('T')[0]} - Expected: ${JSON.stringify(expected)}, Got: ${JSON.stringify(result)}`);
//   });
