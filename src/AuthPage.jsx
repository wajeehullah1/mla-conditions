import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import posthog from "posthog-js";
import AuthModal, { subscribeToMailingList } from "./AuthModal";
export { subscribeToMailingList };

function EmailCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null); // "success" | "error" | null
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from("mailing_list")
      .insert({ email: email.trim(), subscribed: true, source: "landing_capture" });
    if (error && error.code !== "23505") {
      setStatus("error");
    } else {
      posthog.capture("email_captured", { source: "landing" });
      setStatus("success");
      setEmail("");
    }
    setLoading(false);
  }

  return (
    <section className="py-14 px-6 bg-indigo-600">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="text-2xl font-extrabold text-white mb-2">Stay in the loop</h2>
        <p className="text-indigo-200 text-sm mb-6">
          Get notified when new features drop. No spam, unsubscribe any time.
        </p>
        {status === "success" ? (
          <p className="text-white font-semibold">You're on the list. We'll be in touch.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white bg-white"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-white hover:bg-gray-50 disabled:opacity-60 text-indigo-700 font-bold px-6 py-3 rounded-lg text-sm transition-colors whitespace-nowrap"
            >
              {loading ? "..." : "Notify me"}
            </button>
          </form>
        )}
        {status === "error" && (
          <p className="text-indigo-200 text-xs mt-3">Something went wrong. Try again.</p>
        )}
      </div>
    </section>
  );
}


const FEATURES = [
  {
    icon: "🎡",
    title: "Spin the Wheel",
    desc: "Randomly land on any of 300+ UKMLA conditions or 150+ clinical presentations. No more agonising over what to revise next.",
  },
  {
    icon: "🤖",
    title: "AI Ward-Round Tutor",
    desc: "Your own consultant who never gets tired. Get grilled on presentation, investigations, management, and SBA questions in UK clinical style.",
  },
  {
    icon: "🎯",
    title: "Specialty Filtering",
    desc: "On a cardiology placement? Filter to cardiovascular and go deep. 20+ specialties covering the full GMC MLA Content Map.",
  },
  {
    icon: "🧠",
    title: "Differential Diagnosis Quiz",
    desc: "Given a presentation, can you name every differential? Race against yourself to recall all conditions before revealing the answers.",
  },
];

const STEPS = [
  { num: "1", title: "Spin", desc: "Hit the button. The wheel picks your condition at random, or filter to your current placement specialty." },
  { num: "2", title: "Get Tested", desc: "Your AI consultant asks one focused clinical question. Answer like you're on the ward." },
  { num: "3", title: "Pass", desc: "Get instant feedback, a teaching point, then the next question. No waffle. Just clinical learning." },
];

const STATS = [
  { value: "300+", label: "MLA Conditions" },
  { value: "150+", label: "Clinical Presentations" },
  { value: "20+", label: "Specialties" },
  { value: "6", label: "Question Types" },
];

export default function AuthPage({ pendingChallenge }) {
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    posthog.capture("landing_page_viewed");
  }, []);

  function openAuth(source) {
    posthog.capture("cta_clicked", { source });
    setShowAuth(true);
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Challenge banner */}
      {pendingChallenge && (
        <div className="fixed top-0 left-0 right-0 z-50 h-11 bg-gradient-to-r from-purple-600 to-indigo-600 px-4 flex items-center justify-center">
          <p className="text-white text-sm font-semibold text-center">
            You've been challenged on <span className="underline underline-offset-2">{pendingChallenge.condition}</span>. Sign up for free to accept.
          </p>
        </div>
      )}

      {/* Nav */}
      <nav className={`fixed left-0 right-0 z-40 bg-indigo-950/90 backdrop-blur-md ${pendingChallenge ? 'top-11' : 'top-0'}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-extrabold text-white tracking-tight">
            MLA<span className="text-purple-400">Conditions</span>
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => openAuth("nav")}
              className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all"
            >
              Sign in
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className={`relative pb-24 px-6 bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 overflow-hidden ${pendingChallenge ? 'pt-40' : 'pt-32'}`}>
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-block bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide uppercase">
            Free for all users
          </span>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white leading-tight mb-6">
            Medicine,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
              Gamified.
            </span>
          </h1>

          <p className="text-xl text-indigo-200 max-w-2xl mx-auto leading-relaxed mb-4">
            Spin the wheel. Get grilled by your AI consultant. Pass UKMLA finals.
          </p>
          <p className="text-base text-indigo-300/70 max-w-xl mx-auto mb-10">
            The only revision tool that combines a randomised wheel with a live AI ward-round tutor covering every condition in the GMC MLA Content Map.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => openAuth("hero")}
              className="bg-white hover:bg-gray-50 text-indigo-700 font-bold px-8 py-4 rounded-xl text-base transition-colors shadow-lg"
            >
              Start revising free →
            </button>
            <a
              href="#how-it-works"
              className="border border-white/20 hover:border-white/40 text-white font-semibold px-8 py-4 rounded-xl text-base transition-colors"
            >
              See how it works
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16 max-w-2xl mx-auto">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-extrabold text-white">{s.value}</p>
                <p className="text-indigo-300 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
              Everything you need to pass finals
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Built around the GMC MLA Content Map. No deck creation, no setup. Just open and revise.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-gray-900 font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Email capture */}
      <EmailCapture />

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
              Spin. Learn. Pass.
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Three steps between you and a better finals score.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s) => (
              <div key={s.num} className="text-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-extrabold mx-auto mb-4 shadow-lg">
                  {s.num}
                </div>
                <h3 className="text-gray-900 font-bold text-xl mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-20 px-6 bg-gradient-to-br from-indigo-600 to-purple-700">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Your AI consultant is waiting.
          </h2>
          <p className="text-indigo-200 mb-8 text-lg">
            Free to use. No credit card. Just sign up and start spinning.
          </p>
          <button
            onClick={() => openAuth("cta_banner")}
            className="bg-white hover:bg-gray-50 text-indigo-700 font-bold px-10 py-4 rounded-xl text-base transition-colors shadow-lg"
          >
            Create free account →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-900">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-gray-400 font-bold">
            MLA<span className="text-purple-400">Conditions</span>
          </span>
          <p className="text-gray-600 text-xs text-center">
            UKMLA revision tool · Not affiliated with the GMC or any medical school
          </p>
          <button
            onClick={() => openAuth("footer")}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Sign in →
          </button>
        </div>
      </footer>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
