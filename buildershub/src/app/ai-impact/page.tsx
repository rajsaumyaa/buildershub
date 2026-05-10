"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Link from "next/link";

const weeklyData = [
  { week: "Week 1", ai_commits: 120, copilot_users: 45 },
  { week: "Week 2", ai_commits: 198, copilot_users: 72 },
  { week: "Week 3", ai_commits: 310, copilot_users: 98 },
  { week: "Week 4", ai_commits: 475, copilot_users: 143 },
];

const stats = [
  { label: "Total AI-Assisted Commits", value: "1,103", icon: "🤖" },
  { label: "GitHub Copilot Users", value: "143", icon: "⚡" },
  { label: "Code Reviews via MentorAgent", value: "89", icon: "📝" },
  { label: "Community AI Score", value: "94/100", icon: "🏅" },
];

export default function AIImpact() {
  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-12">
      <Link href="/" className="text-gray-400 hover:text-white text-sm mb-8 inline-block">← Back</Link>
      <h1 className="text-4xl font-bold mb-2">📊 AI Impact Dashboard</h1>
      <p className="text-gray-400 mb-10">Tracking community-wide AI adoption across Indian builders — powered by Apify + GitHub Copilot</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {stats.map((s, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold text-green-400">{s.value}</div>
            <div className="text-gray-400 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-6">Weekly AI Adoption Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="week" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151" }} />
            <Bar dataKey="ai_commits" fill="#8b5cf6" name="AI Commits" radius={[4, 4, 0, 0]} />
            <Bar dataKey="copilot_users" fill="#10b981" name="Copilot Users" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}