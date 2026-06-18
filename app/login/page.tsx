import Link from "next/link"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center p-6">
        <div className="w-full rounded-3xl border border-slate-800 bg-slate-900/90 p-10 shadow-xl shadow-slate-950/20">
          <h1 className="text-4xl font-semibold text-white">Masuk dengan Google</h1>
          <p className="mt-4 text-slate-400">
            Gunakan akun Google untuk sign up secara lokal dan mulai pakai aplikasi Kanban.
          </p>
          <div className="mt-8 space-y-4">
            <a
              href="/api/google/auth"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-500 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
            >
              Sign in dengan Google
            </a>
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-700 px-6 py-4 text-sm text-slate-300 transition hover:bg-slate-800"
            >
              Kembali ke beranda
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
