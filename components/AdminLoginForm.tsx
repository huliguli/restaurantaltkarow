"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Anmeldung fehlgeschlagen.");
        setPending(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Verbindungsfehler. Bitte erneut versuchen.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <label className="block">
        <span className="block text-sm text-ink-strong mb-1.5">Benutzername</span>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
          className="w-full px-4 py-2.5 bg-paper border border-ink/20 rounded-sm focus:border-burgundy focus:outline-none text-ink"
        />
      </label>
      <label className="block">
        <span className="block text-sm text-ink-strong mb-1.5">Passwort</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          className="w-full px-4 py-2.5 bg-paper border border-ink/20 rounded-sm focus:border-burgundy focus:outline-none text-ink"
        />
      </label>

      {error ? (
        <p
          className="p-3 border-l-4 border-burgundy bg-burgundy/5 text-burgundy text-sm"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? "Wird angemeldet…" : "Anmelden"}
      </button>
    </form>
  );
}
