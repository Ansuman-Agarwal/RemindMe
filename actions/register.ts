"use server";

import type * as z from "zod";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { RegisterSchema } from "@/schemas";
import { getUserByPhonenumber } from "@/data/user";
import axios from "axios";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, name, whatsappNumber } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await getUserByPhonenumber(whatsappNumber)

    if(existingUser?.isWhatsappVerified){
      return { error: "Phone already in use!" };
    }

    await db.user.upsert({
      where: {
        whatsappNumber : whatsappNumber.replace('+', '')
      },
      update: {
        name,
        email,
        password: hashedPassword,
        whatsappNumber: whatsappNumber.replace('+', '')
      },
      create: {
        name,
        email,
        password: hashedPassword,
        whatsappNumber: whatsappNumber.replace('+', '')
      }
    })
    const poll = await axios.post("http://localhost:8080/send-login-poll", {whatsappNumber : whatsappNumber.replace('+', '')})
    console.log(poll.data)

  return { success: "Confirmation poll sent!" };
};
