"use client"

import { useEffect, useMemo, useState } from "react"

type Task = {
  id: string
  title: string
  description?: string
  dueDate?: string
  dueEnd?: string
  columnId: string
}

type Column = {
  id: string
  name: string
  boardId: string
  position: number
  tasks: Task[]
}

type Board = {
  id: string
  name: string
  columns: Column[]
}

type User = {
  name: string
  email: string
  picture?: string
}

type KanbanAppProps = {
  user?: User
}

export default function KanbanApp({ user }: KanbanAppProps) {
  const [boards, setBoards] = useState<Board[]>([])
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [newTask, setNewTask] = useState({ title: "", description: "", dueDate: "", dueTime: "", columnId: "" })
  const [syncMessage, setSyncMessage] = useState<string | null>(null)

  const activeBoard = useMemo(() => {
    return boards.find((board) => board.id === selectedBoardId) ?? boards[0] ?? null
  }, [boards, selectedBoardId])

  useEffect(() => {
    refreshData()
  }, [])

  async function refreshData() {
    setLoading(true)
    const response = await fetch("/api/tasks")
    const data = await response.json()
    setBoards(data.boards ?? [])
    setSelectedBoardId((current) => current || data.boards?.[0]?.id || null)
    setLoading(false)
  }

  async function createBoard() {
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "board", name: "New Board" }),
    })
    refreshData()
  }

  async function addColumn() {
    if (!activeBoard) return
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "column", boardId: activeBoard.id, name: "New Column" }),
    })
    refreshData()
  }

  async function createTask() {
    if (!newTask.title || !activeBoard || !newTask.columnId) {
      return
    }

    const dueDateIso = newTask.dueDate ? new Date(`${newTask.dueDate}T${newTask.dueTime || "12:00"}:00`).toISOString() : null

    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "task",
        columnId: newTask.columnId,
        title: newTask.title,
        description: newTask.description,
        dueDate: dueDateIso,
        dueEnd: dueDateIso,
      }),
    })

    setNewTask({ title: "", description: "", dueDate: "", dueTime: "", columnId: newTask.columnId })
    refreshData()
  }

  async function moveTask(taskId: string, targetColumnId: string) {
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "move", taskId, toColumnId: targetColumnId, position: 0 }),
    })
    refreshData()
  }

  async function syncToCalendar(task: Task) {
    if (!task.dueDate) {
      setSyncMessage("Task harus punya tanggal & jam dulu sebelum sinkron ke Calendar.")
      return
    }

    try {
      const response = await fetch("/api/google/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          dueEnd: task.dueEnd || task.dueDate,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Gagal sinkron ke Google Calendar")
      }

      setSyncMessage("Task berhasil disinkronkan ke Google Calendar.")
    } catch (error) {
      setSyncMessage(`Sinkron gagal: ${(error as Error).message}`)
    }
  }

  function openGoogleAuth() {
    window.open("/api/google/auth", "_blank", "width=600,height=700")
  }

  const columnOptions = activeBoard?.columns.map((column) => (
    <option value={column.id} key={column.id}>
      {column.name}
    </option>
  ))

  return (
    <div className="space-y-6">
      {user ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.16em] text-slate-500">Signed in as</p>
              <p className="mt-2 text-lg font-semibold text-white">{user.name}</p>
              <p className="text-sm text-slate-400">{user.email}</p>
            </div>
            <div className="flex items-center gap-3">
              {user.picture ? (
                <img src={user.picture} alt={user.name} className="h-12 w-12 rounded-full object-cover" />
              ) : null}
              <a
                href="/api/logout"
                className="rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-rose-400"
              >
                Logout
              </a>
            </div>
          </div>
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
          <div className="flex flex-wrap items-center gap-3">
            <select
              className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
              value={selectedBoardId ?? ""}
              onChange={(event) => setSelectedBoardId(event.target.value)}
            >
              {boards.map((board) => (
                <option key={board.id} value={board.id}>
                  {board.name}
                </option>
              ))}
            </select>
            <button className="rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400" onClick={createBoard}>
              Tambah Board
            </button>
            <button className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400" onClick={addColumn}>
              Tambah Kolom
            </button>
            <button className="rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-400" onClick={openGoogleAuth}>
              Hubungkan Google Calendar
            </button>
          </div>
          <p className="mt-4 text-sm text-slate-400">Buka jendela Google OAuth dan login. Setelah tersambung, refresh halaman untuk mulai sinkron.</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
          <h2 className="text-lg font-semibold text-white">Tambah Task Cepat</h2>
          <div className="mt-4 space-y-3">
            <input
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
              placeholder="Judul task"
              value={newTask.title}
              onChange={(event) => setNewTask({ ...newTask, title: event.target.value })}
            />
            <textarea
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
              placeholder="Deskripsi"
              rows={3}
              value={newTask.description}
              onChange={(event) => setNewTask({ ...newTask, description: event.target.value })}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="date"
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
                value={newTask.dueDate}
                onChange={(event) => setNewTask({ ...newTask, dueDate: event.target.value })}
              />
              <input
                type="time"
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
                value={newTask.dueTime}
                onChange={(event) => setNewTask({ ...newTask, dueTime: event.target.value })}
              />
            </div>
            <select
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
              value={newTask.columnId}
              onChange={(event) => setNewTask({ ...newTask, columnId: event.target.value })}
            >
              <option value="">Pilih kolom</option>
              {columnOptions}
            </select>
            <button
              className="w-full rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
              onClick={createTask}
            >
              Buat Task
            </button>
            {syncMessage ? <p className="text-sm text-rose-300">{syncMessage}</p> : null}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-10 text-center text-slate-400">Memuat board...</div>
        ) : activeBoard ? (
          <div className="grid gap-4 xl:grid-cols-3">
            {activeBoard.columns.map((column) => (
              <section key={column.id} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/20">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">{column.name}</h3>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                    {column.tasks.length}
                  </span>
                </div>
                <div className="space-y-4">
                  {column.tasks.map((task) => (
                    <article key={task.id} className="rounded-3xl border border-slate-800 bg-slate-950 p-4 text-slate-200 shadow-lg shadow-slate-950/20">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-base font-semibold">{task.title}</h4>
                          <p className="mt-2 text-sm text-slate-400">{task.description || "Tidak ada deskripsi"}</p>
                        </div>
                      </div>
                      {task.dueDate ? (
                        <div className="rounded-2xl bg-slate-900 px-3 py-2 text-sm text-slate-300">
                          <strong>Due:</strong> {new Date(task.dueDate).toLocaleString()}
                        </div>
                      ) : null}
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          className="rounded-2xl bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
                          onClick={() => syncToCalendar(task)}
                        >
                          Sinkron Calendar
                        </button>
                        {activeBoard.columns.map((target) =>
                          target.id !== column.id ? (
                            <button
                              key={target.id}
                              className="rounded-2xl bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
                              onClick={() => moveTask(task.id, target.id)}
                            >
                              Move → {target.name}
                            </button>
                          ) : null,
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-10 text-center text-slate-400">Buat board dan kolom dulu untuk mulai.</div>
        )}
      </div>
    </div>
  )
}
