"use client"

import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center p-6">
        <div className="w-full space-y-6 rounded-3xl border border-slate-800 bg-slate-900/90 p-10 shadow-xl shadow-slate-950/20">
          <div>
            <h1 className="text-4xl font-semibold text-white">Luxio Kanban - Login</h1>
            <p className="mt-4 text-slate-400">
              Pilih metode login. Google OAuth sementara dinonaktifkan untuk testing.
            </p>
          </div>

          <button
            onClick={() => router.push("/login-mock")}
            className="w-full rounded-2xl bg-emerald-500 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            Mock Login (Testing)
          </button>

          <div className="rounded-2xl border border-slate-600 bg-slate-900/50 px-6 py-4">
            <p className="text-sm text-slate-400">
              ⭕ <strong>Google OAuth dinonaktifkan sementara.</strong> Gunakan Mock Login di atas.
            </p>
          </div>

          <button
            onClick={() => router.push("/")}
            className="w-full rounded-2xl border border-slate-700 px-6 py-4 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </main>
  )
}
