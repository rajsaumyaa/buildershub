"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface LeaderboardEntry {
  name: string;
  github_handle: string;
  total_points: number;
}

export default function Leaderboard() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", github_handle: "" });
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState("");

  const fetchLeaderboard = async () => {
    const res = await fetch("http://localhost:8000/leaderboard");
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  useEffect(() => { fetchLeaderboard(); }, []);

  const handleRegister = async () => {
    setRegistering(true);
    setMessage("");
    const res = await fetch("http://localhost:8000/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (json.error) {
      setMessage(json.error);
    } else {
      setMessage(`Welcome! Your initial score is ${json.initial_score} points 🎉`);
      fetchLeaderboard();
    }
    setRegistering(false);
  };

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-12">
      <Link href="/" className="text-gray-400 hover:text-white text-sm mb-8 inline-block">← Back</Link>
      <h1 className="text-4xl font-bold mb-2">🏆 Leaderboard</h1>
      <p className="text-gray-400 mb-10">Powered by Apify — real GitHub stats, updated on registration</p>

      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="text-xl font-semibold mb-4">Top Builders</h2>
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : (
            <div className="space-y-3">
              {data.map((entry, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{medals[i] || `#${i + 1}`}</span>
                    <div>
                      <p className="font-semibold">{entry.name}</p>
                      <a href={`https://github.com/${entry.github_handle}`} target="_blank" className="text-blue-400 text-sm">@{entry.github_handle}</a>
                    </div>
                  </div>
                  <span className="text-yellow-400 font-bold text-lg">{entry.total_points} pts</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Join the Leaderboard</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <input
              className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none"
              placeholder="Your name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none"
              placeholder="Email address"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
            <input
              className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none"
              placeholder="GitHub username"
              value={form.github_handle}
              onChange={e => setForm({ ...form, github_handle: e.target.value })}
            />
            <button
              onClick={handleRegister}
              disabled={registering}
              className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg py-3 font-semibold transition-all disabled:opacity-50"
            >
              {registering ? "Fetching your GitHub stats via Apify..." : "Register & Get Scored"}
            </button>
            {message && <p className="text-green-400 text-sm">{message}</p>}
          </div>
        </div>
      </div>
    </main>
  );
}