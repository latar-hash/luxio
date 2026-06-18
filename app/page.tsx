import Link from "next/link"
import KanbanApp from "@/components/KanbanApp"
import { getCurrentUser } from "@/lib/auth"

export default async function Home() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center p-6">
          <div className="w-full rounded-3xl border border-slate-800 bg-slate-900/90 p-10 shadow-xl shadow-slate-950/20">
            <h1 className="text-4xl font-semibold text-white">Selamat datang di Luxio</h1>
            <p className="mt-4 text-slate-400">
              Masuk dengan akun Google untuk sign up secara lokal dan mulai menggunakan board Kanban.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <a
                href="/api/google/auth"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-500 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
              >
                Sign in dengan Google
              </a>
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-700 px-6 py-4 text-sm text-slate-300 transition hover:bg-slate-800"
              >
                Halaman Login
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl shadow-slate-950/20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-white">Luxio Kanban</h1>
              <p className="mt-3 max-w-2xl text-slate-300">
                A Trello-style board with board/column/task support, due date & time, and Google Calendar sync.
              </p>
            </div>
            <div className="rounded-3xl bg-slate-950/90 px-5 py-4 text-slate-300 shadow-inner shadow-slate-950/20">
              <p className="text-sm uppercase tracking-[0.15em] text-slate-500">Signed in as</p>
              <p className="mt-1 text-lg font-semibold text-white">{user.name}</p>
              <p className="text-sm text-slate-400">{user.email}</p>
            </div>
          </div>
        </div>
        <KanbanApp user={{ name: user.name, email: user.email, picture: user.picture ?? undefined }} />
      </div>
    </main>
  )
}
