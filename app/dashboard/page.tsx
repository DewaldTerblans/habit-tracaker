import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { createHabit, deleteHabit, checkInHabit } from "@/lib/actions";
import { calculateStreaks } from "@/lib/streaks";
import HabitHeatmap from "@/components/HabitHeatmap";
import WeeklyChart from "@/components/WeeklyChart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default async function DashboardPage() {
  const user = await currentUser();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const habits = await prisma.habit.findMany({
    where: { userId: user?.id },
    orderBy: { createdAt: "desc" },
    include: { checkIns: true },
  });

  const last7Days: { day: string; count: number }[] = [];
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);

    const nextDay = new Date(d);
    nextDay.setDate(nextDay.getDate() + 1);

    let count = 0;
    habits.forEach((habit) => {
      habit.checkIns.forEach((c) => {
        const checkInDate = new Date(c.date);
        if (checkInDate >= d && checkInDate < nextDay) {
          count++;
        }
      });
    });

    last7Days.push({ day: dayLabels[d.getDay()], count });
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">
        Welcome, {user?.firstName || "there"}!
      </h1>

      <WeeklyChart data={last7Days} />

      <form action={createHabit} className="flex gap-2 my-8">
        <Input
          type="text"
          name="name"
          placeholder="e.g. Exercise, Read, Meditate"
          required
        />
        <Button type="submit">Add Habit</Button>
      </form>

      <div className="space-y-3">
        {habits.length === 0 && (
          <p className="text-gray-500">
            No habits yet — add your first one above.
          </p>
        )}

        {habits.map((habit) => {
          const doneToday = habit.checkIns.some((c) => {
            const d = new Date(c.date);
            return d >= today && d < tomorrow;
          });

          const { currentStreak, longestStreak } = calculateStreaks(
            habit.checkIns.map((c) => c.date)
          );

          return (
            <Card key={habit.id} className="flex items-center justify-between p-4">
              <div>
                <span className={doneToday ? "line-through text-gray-400" : ""}>
                  {habit.name}
                </span>
                <div className="text-xs text-gray-500 mt-1">
                  🔥 {currentStreak} day streak · Best: {longestStreak}
                </div>
                <HabitHeatmap checkInDates={habit.checkIns.map((c) => c.date)} />
              </div>

              <div className="flex items-center gap-3">
                <form action={checkInHabit.bind(null, habit.id)}>
                  <Button
                    type="submit"
                    disabled={doneToday}
                    variant={doneToday ? "ghost" : "default"}
                    size="sm"
                  >
                    {doneToday ? "✓ Done today" : "Mark done"}
                  </Button>
                </form>

                <form action={deleteHabit.bind(null, habit.id)}>
                  <Button type="submit" variant="destructive" size="sm">
                    Delete
                  </Button>
                </form>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}