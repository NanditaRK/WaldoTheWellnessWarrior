import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";



export async function GET(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  const userId = session.user.id; 

  try {
    
    const calls = await prisma.call.findMany({
      where: {
        userId: userId, 
      },
    });

    return NextResponse.json(calls, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error fetching calls" }, { status: 500 });
  }
}
export async function POST(req: Request) {
  const session = await auth()
  const body = await req.json();
  const { userId, summary } = body;
  console.log(session)

  if(!session || !session.user){
        return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    }
  if (!summary) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const call = await prisma.call.create({
    data: { userId, summary },
  });

  return NextResponse.json(call, { status: 201 });
}
