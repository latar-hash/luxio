import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  const boards = await prisma.board.findMany({
    include: {
      columns: {
        include: {
          tasks: {
            orderBy: { position: "asc" },
          },
        },
        orderBy: { position: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json({ boards })
}

export async function POST(request: Request) {
  const body = await request.json()

  if (body.type === "board") {
    const board = await prisma.board.create({ data: { name: body.name ?? "New Board" } })
    return NextResponse.json(board)
  }

  if (body.type === "column") {
    const position = await prisma.column.count({ where: { boardId: body.boardId } })
    const column = await prisma.column.create({
      data: {
        name: body.name ?? "New Column",
        boardId: body.boardId,
        position,
      },
    })
    return NextResponse.json(column)
  }

  if (body.type === "task") {
    const position = await prisma.task.count({ where: { columnId: body.columnId } })
    const task = await prisma.task.create({
      data: {
        title: body.title ?? "New Task",
        description: body.description ?? "",
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        dueEnd: body.dueEnd ? new Date(body.dueEnd) : null,
        columnId: body.columnId,
        position,
      },
    })
    return NextResponse.json(task)
  }

  if (body.type === "move") {
    const task = await prisma.task.update({
      where: { id: body.taskId },
      data: {
        columnId: body.toColumnId,
        position: body.position ?? 0,
      },
    })
    return NextResponse.json(task)
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 })
}
