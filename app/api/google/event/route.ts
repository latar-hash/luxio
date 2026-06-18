import { NextResponse } from "next/server"
import { createCalendarEventForTask } from "@/lib/google"

export async function POST(request: Request) {
  const body = await request.json()

  if (!body.title || !body.dueDate) {
    return NextResponse.json({ error: "Task harus punya judul dan tanggal/jam." }, { status: 400 })
  }

  try {
    const event = await createCalendarEventForTask({
      title: body.title,
      description: body.description,
      dueDate: body.dueDate,
      dueEnd: body.dueEnd,
    })

    return NextResponse.json(event)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
