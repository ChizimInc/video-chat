import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { chatId } = await req.json();

    if (!chatId) {
      return NextResponse.json({ error: "Missing chatId" }, { status: 400 });
    }

    // Simulăm salvarea în baza de date (în viitor vei conecta cu PostgreSQL + Prisma)
    console.log("Chat created with ID:", chatId);

    return NextResponse.json({ success: true, chatId }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
