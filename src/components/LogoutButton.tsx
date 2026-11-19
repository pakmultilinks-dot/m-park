"use client";

export default function LogoutButton() {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }
  return (
    <button onClick={logout} className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800">
      Logout
    </button>
  );
}
