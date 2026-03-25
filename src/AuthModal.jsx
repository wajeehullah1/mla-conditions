import { useState } from "react";
import { supabase } from "./supabase";
import posthog from "posthog-js";

export async function subscribeToMailingList(email, userId = null, source = "signup") {
  await supabase.from("mailing_list").upsert(
    { email, user_id: userId, subscribed: true, source },
    { onConflict: "email" }
  );
}

export default function AuthModal({ onClose, initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        posthog.capture("user_signed_in");
      }
    } else if (mode === "signup") {
      const { data: signUpData, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        posthog.capture("user_signed_up");
        await subscribeToMailingList(email, signUpData?.user?.id, "signup");
        setMessage({ type: "success", text: "Check your email to confirm your account." });
      }
    } else if (mode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({ type: "success", text: "Password reset email sent. Check your inbox." });
      }
    }

    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-lg">
              MLA<span className="text-purple-200">Conditions</span>
            </p>
            <p className="text-indigo-200 text-xs mt-0.5">UKMLA revision</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-xl leading-none">✕</button>
        </div>

        <div className="p-6">
          {mode !== "reset" && (
            <div className="flex rounded-lg bg-gray-100 p-1 mb-5">
              {["login", "signup"].map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setMessage(null); }}
                  className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
                    mode === m ? "bg-white text-indigo-700 shadow" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {m === "login" ? "Log in" : "Sign up"}
                </button>
              ))}
            </div>
          )}

          {mode === "reset" && (
            <h2 className="text-gray-800 font-bold text-base mb-5">Reset your password</h2>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white"
              />
            </div>

            {mode !== "reset" && (
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white"
                />
              </div>
            )}

            {message && (
              <p className={`text-xs rounded-lg px-3 py-2 ${
                message.type === "error"
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : "bg-green-50 text-green-600 border border-green-200"
              }`}>
                {message.text}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-bold py-2.5 rounded-lg transition-colors text-sm"
            >
              {loading ? "…" : mode === "login" ? "Log in" : mode === "signup" ? "Create free account" : "Send reset email"}
            </button>
          </form>

          <div className="mt-4 text-center">
            {mode === "reset" ? (
              <button onClick={() => { setMode("login"); setMessage(null); }} className="text-indigo-500 hover:text-indigo-700 text-sm">
                Back to log in
              </button>
            ) : (
              <button onClick={() => { setMode("reset"); setMessage(null); }} className="text-gray-400 hover:text-gray-600 text-xs">
                Forgot password?
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
