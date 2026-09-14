export function calculateStreaks(checkInDates: Date[]) {
  if (checkInDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const sortedDates = checkInDates
    .map((d) => {
      const date = new Date(d);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    })
    .sort((a, b) => a - b);

  const uniqueDates = Array.from(new Set(sortedDates));

  let longestStreak = 1;
  let currentRun = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const oneDayMs = 24 * 60 * 60 * 1000;
    const diff = uniqueDates[i] - uniqueDates[i - 1];

    if (diff === oneDayMs) {
      currentRun++;
    } else {
      currentRun = 1;
    }

    if (currentRun > longestStreak) {
      longestStreak = currentRun;
    }
  }


  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

  const mostRecent = uniqueDates[uniqueDates.length - 1];

  let currentStreak = 0;

  if (mostRecent === todayMs || mostRecent === todayMs - oneDayMs) {

    currentStreak = 1;
    for (let i = uniqueDates.length - 1; i > 0; i--) {
      const diff = uniqueDates[i] - uniqueDates[i - 1];
      if (diff === oneDayMs) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return { currentStreak, longestStreak };
}