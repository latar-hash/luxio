"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function MockLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("test@example.com")
  const [name, setName] = useState("Test User")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleMockLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Login gagal.")
      }

      router.push("/")
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center p-6">
        <div className="w-full rounded-3xl border border-slate-800 bg-slate-900/90 p-10 shadow-xl shadow-slate-950/20">
          <h1 className="text-4xl font-semibold text-white">Mock Login - Testing</h1>
          <p className="mt-4 text-slate-400">
            Gunakan form ini untuk testing Kanban board tanpa Google OAuth.
          </p>

          <form onSubmit={handleMockLogin} className="mt-8 space-y-4 rounded-2xl border border-slate-700 bg-slate-950 p-6">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            />
            <input
              type="text"
              placeholder="Nama"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
            >
              {loading ? "Masuk..." : "Masuk"}
            </button>
            {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          </form>

          <Link
            href="/login"
            className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-slate-700 px-6 py-4 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            Kembali ke Login
          </Link>
        </div>
      </div>
    </main>
  )
}
