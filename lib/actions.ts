"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";

export async function createHabit(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const name = formData.get("name") as string;
  if (!name || name.trim() === "") return;

  await prisma.habit.create({
    data: {
      userId,
      name: name.trim(),
    },
  });

  revalidatePath("/dashboard");
}

export async function deleteHabit(habitId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  await prisma.habit.deleteMany({
    where: { id: habitId, userId },
  });

  revalidatePath("/dashboard");
}

export async function checkInHabit(habitId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");


  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existing = await prisma.checkIn.findFirst({
    where: {
      habitId,
      date: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  if (existing) return;

  await prisma.checkIn.create({
    data: {
      habitId,
      date: today,
    },
  });

  revalidatePath("/dashboard");
}