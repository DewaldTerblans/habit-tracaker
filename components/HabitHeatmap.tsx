type Props = {
  checkInDates: Date[];
};

export default function HabitHeatmap({ checkInDates }: Props) {
  const checkedDays = new Set(
    checkInDates.map((d) => {
      const date = new Date(d);
      date.setHours(0, 0, 0, 0);
      return date.toDateString();
    })
  );

  const days: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d);
  }

  return (
    <div className="flex gap-1 mt-2">
      {days.map((day) => {
        const wasCheckedIn = checkedDays.has(day.toDateString());

        return (
          <div
            key={day.toDateString()}
            title={day.toDateString()}
            className={`w-3 h-3 rounded-sm ${
              wasCheckedIn ? "bg-green-500" : "bg-gray-200"
            }`}
          />
        );
      })}
    </div>
  );
}