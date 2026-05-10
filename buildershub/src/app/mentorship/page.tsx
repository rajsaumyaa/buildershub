"use client";
import { useState } from "react";
import Link from "next/link";

export default function Mentorship() {
  const [menteeId, setMenteeId] = useState("1");
  const [problem, setProblem] = useState("");
  const [code, setCode] = useState("");
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setReview("");
    const res = await fetch("https://buildershub-api.onrender.com/agents/mentor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mentee_id: parseInt(menteeId),
        problem_description: problem,
        code_snippet: code,
      }),
    });
    const json = await res.json();
    setReview(json.review);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-12">
      <Link href="/" className="text-gray-400 hover:text-white text-sm mb-8 inline-block">← Back</Link>
      <h1 className="text-4xl font-bold mb-2">🤖 AI Mentorship</h1>
      <p className="text-gray-400 mb-10">Powered by Zynd MentorAgent + LLaMA 3.3 70B via Groq</p>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-4">
          <input
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none"
            placeholder="Your user ID (e.g. 1)"
            value={menteeId}
            onChange={e => setMenteeId(e.target.value)}
          />
          <input
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none"
            placeholder="What problem were you solving?"
            value={problem}
            onChange={e => setProblem(e.target.value)}
          />
          <textarea
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none h-48 font-mono text-sm"
            placeholder="Paste your code here..."
            value={code}
            onChange={e => setCode(e.target.value)}
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 rounded-lg py-3 font-semibold transition-all disabled:opacity-50"
          >
            {loading ? "MentorAgent is reviewing your code..." : "Get AI Code Review"}
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Review Output</h2>
          {loading && (
            <div className="text-purple-400 animate-pulse">Zynd MentorAgent is analyzing your code via LLaMA 3.3 70B...</div>
          )}
          {review ? (
            <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">{review}</pre>
          ) : (
            !loading && <p className="text-gray-500">Your code review will appear here...</p>
          )}
        </div>
      </div>
    </main>
  );
}