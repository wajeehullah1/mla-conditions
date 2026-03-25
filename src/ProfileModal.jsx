import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const TABS = ["Profile", "History", "Account"];

export default function ProfileModal({ user, onClose, onSignOut }) {
  const [tab, setTab] = useState("Profile");

  // Profile tab state
  const [username, setUsername] = useState("");
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameMsg, setUsernameMsg] = useState(null);

  // Password tab state
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null);

  // History tab state
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Delete account state
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState(null);

  // Mailing list state
  const [subscribed, setSubscribed] = useState(null); // null = loading
  const [subLoading, setSubLoading] = useState(false);

  // Load username on mount
  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();
      if (data?.username) setUsername(data.username);
    }
    loadProfile();
  }, [user.id]);

  // Load subscription status when Account tab opens
  useEffect(() => {
    if (tab !== "Account") return;
    supabase
      .from("mailing_list")
      .select("subscribed")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => setSubscribed(data ? data.subscribed : false));
  }, [tab, user.id]);

  // Load history when tab switches to History
  useEffect(() => {
    if (tab !== "History") return;
    setHistoryLoading(true);
    supabase
      .from("question_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setHistory(data || []);
        setHistoryLoading(false);
      });
  }, [tab, user.id]);

  async function saveUsername(e) {
    e.preventDefault();
    setUsernameLoading(true);
    setUsernameMsg(null);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, username: username.trim() });
    setUsernameMsg(
      error
        ? { type: "error", text: error.message }
        : { type: "success", text: "Username saved." }
    );
    setUsernameLoading(false);
  }

  async function changePassword(e) {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMsg(null);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordMsg(
      error
        ? { type: "error", text: error.message }
        : { type: "success", text: "Password updated." }
    );
    if (!error) setNewPassword("");
    setPasswordLoading(false);
  }

  async function deleteAccount() {
    setDeleteLoading(true);
    setDeleteMsg(null);
    // Call a Supabase edge function or RPC — for now sign out and show instruction
    // Full deletion requires a server-side call; we'll handle with RPC
    const { error } = await supabase.rpc("delete_user");
    if (error) {
      setDeleteMsg({ type: "error", text: error.message });
      setDeleteLoading(false);
    } else {
      await supabase.auth.signOut();
      onSignOut();
    }
  }

  async function toggleSubscription() {
    setSubLoading(true);
    const next = !subscribed;
    await supabase
      .from("mailing_list")
      .upsert(
        { email: user.email, user_id: user.id, subscribed: next, source: "signup" },
        { onConflict: "email" }
      );
    setSubscribed(next);
    setSubLoading(false);
  }

  async function clearHistory() {
    await supabase
      .from("question_history")
      .delete()
      .eq("user_id", user.id);
    setHistory([]);
  }

  const displayName = username || user.email?.split("@")[0] || "?";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold truncate">{displayName}</p>
            <p className="text-indigo-200 text-xs truncate">{user.email}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                tab === t
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">

          {/* ── Profile ── */}
          {tab === "Profile" && (
            <div className="space-y-6">
              <form onSubmit={saveUsername} className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  maxLength={30}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                {usernameMsg && (
                  <p className={`text-xs rounded-lg px-3 py-2 ${
                    usernameMsg.type === "error"
                      ? "bg-red-50 text-red-600 border border-red-200"
                      : "bg-green-50 text-green-600 border border-green-200"
                  }`}>
                    {usernameMsg.text}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={usernameLoading || !username.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
                >
                  {usernameLoading ? "Saving…" : "Save username"}
                </button>
              </form>

              <hr className="border-gray-100" />

              <form onSubmit={changePassword} className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Change password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password (min 6 characters)"
                  minLength={6}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                {passwordMsg && (
                  <p className={`text-xs rounded-lg px-3 py-2 ${
                    passwordMsg.type === "error"
                      ? "bg-red-50 text-red-600 border border-red-200"
                      : "bg-green-50 text-green-600 border border-green-200"
                  }`}>
                    {passwordMsg.text}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={passwordLoading || newPassword.length < 6}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
                >
                  {passwordLoading ? "Updating…" : "Update password"}
                </button>
              </form>
            </div>
          )}

          {/* ── History ── */}
          {tab === "History" && (
            <div>
              {historyLoading && (
                <p className="text-center text-gray-400 text-sm py-8">Loading…</p>
              )}
              {!historyLoading && history.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-8">
                  No questions yet. Spin the wheel and start studying!
                </p>
              )}
              {!historyLoading && history.length > 0 && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-xs text-gray-400">{history.length} question{history.length !== 1 ? "s" : ""} logged</p>
                    <button
                      onClick={clearHistory}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="space-y-2">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="bg-gray-50 rounded-xl p-3 border border-gray-100"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                            {item.condition}
                          </span>
                          <span className="text-xs text-gray-400 capitalize">
                            {item.question_type}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                          {item.question}
                        </p>
                        <p className="text-xs text-gray-300 mt-1.5">
                          {new Date(item.created_at).toLocaleDateString("en-GB", {
                            day: "numeric", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit"
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Account ── */}
          {tab === "Account" && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-1">
                <p><span className="font-semibold text-gray-700">Email:</span> {user.email}</p>
                <p><span className="font-semibold text-gray-700">Member since:</span> {new Date(user.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>

              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Email updates</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {subscribed === null ? "Loading..." : subscribed ? "You are subscribed" : "You are unsubscribed"}
                  </p>
                </div>
                <button
                  onClick={toggleSubscription}
                  disabled={subLoading || subscribed === null}
                  className={`relative w-11 h-6 rounded-full transition-colors disabled:opacity-50 ${subscribed ? "bg-indigo-600" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${subscribed ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>

              <button
                onClick={onSignOut}
                className="w-full border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800 font-semibold py-2.5 rounded-lg text-sm transition-colors"
              >
                Sign out
              </button>

              <hr className="border-gray-100" />

              <div className="bg-red-50 border border-red-100 rounded-xl p-4 space-y-3">
                <p className="text-sm font-semibold text-red-700">Delete account</p>
                <p className="text-xs text-red-600">
                  This permanently deletes your account and all your data. Type <strong>DELETE</strong> to confirm.
                </p>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white"
                />
                {deleteMsg && (
                  <p className="text-xs text-red-600">{deleteMsg.text}</p>
                )}
                <button
                  onClick={deleteAccount}
                  disabled={deleteConfirm !== "DELETE" || deleteLoading}
                  className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
                >
                  {deleteLoading ? "Deleting…" : "Delete my account"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
