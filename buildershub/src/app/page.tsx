import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-5xl font-bold mb-4 text-center">
        🇮🇳 BuildersHub India
      </h1>
      <p className="text-gray-400 text-xl mb-12 text-center max-w-xl">
        The AI-native growth platform for Indian developers. Compete, get mentored, track your AI impact.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <Link href="/leaderboard" className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-blue-500 transition-all text-center">
          <div className="text-4xl mb-3">🏆</div>
          <h2 className="text-xl font-semibold mb-2">Leaderboard</h2>
          <p className="text-gray-400 text-sm">See top Indian builders ranked by real GitHub stats</p>
        </Link>
        <Link href="/mentorship" className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-purple-500 transition-all text-center">
          <div className="text-4xl mb-3">🤖</div>
          <h2 className="text-xl font-semibold mb-2">AI Mentorship</h2>
          <p className="text-gray-400 text-sm">Get instant AI-powered code reviews from MentorAgent</p>
        </Link>
        <Link href="/ai-impact" className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-green-500 transition-all text-center">
          <div className="text-4xl mb-3">📊</div>
          <h2 className="text-xl font-semibold mb-2">AI Impact</h2>
          <p className="text-gray-400 text-sm">Track community-wide AI tool adoption across India</p>
        </Link>
      </div>
    </main>
  );
}