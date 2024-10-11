// Import NextResponse for handling the response
import { login } from "@/actions/login";
import bcrypt from "bcryptjs";
import { getUserByPhonenumber } from "@/data/user";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Define an asynchronous POST handler
export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const { userPhoneNumber, messageBody } = await request.json();
    const user = await getUserByPhonenumber(userPhoneNumber);
    if (!user || user.isWhatsappVerified) {
      return NextResponse.json({ message: "User not found!" }, { status: 404 });
    }
    const updatedUser = await db.user.update({
      where: {
        whatsappNumber: userPhoneNumber,
      },
      data: {
        isWhatsappVerified: messageBody === "Yess",
      },
    });

    const origianlPassword = await bcrypt.decodeBase64(
      updatedUser.password,
      updatedUser.password.length
    );

    console.log("original password", origianlPassword);

    console.log("sign done befor login`");
    await login({
      email: updatedUser.email,
      password: updatedUser.password,
    });

    console.log("sign done after login");
    return NextResponse.json({ data: "Signin done successfully" });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ data: "Failed to process request" });
  }
}
