"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { login, register } from "@/lib/api";
import { setToken, isLoggedIn } from "@/lib/auth";

export default function AuthPage() {
  const router = useRouter();

  const [mode, setMode] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const data =
        mode === "login"
          ? await login(email, password)
          : await register(email, password);

      setToken(data.access_token);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Background Image with Blur */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/themes/image3.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transform: 'scale(1.1)', // Slightly scale to avoid edges showing through blur
        }}
      />

      {/* Dark Overlay for better contrast */}
      <div className="absolute inset-0 z-0 bg-black/30" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[400px]">
        <div className="mb-10 flex flex-col items-center">

          <img
            src="/Icon_White (1).png"
            alt="Forge Logo"
            className="h-14 w-auto mb-6 drop-shadow-2xl brightness-110"
          />
          <h1 className="text-3xl font-bold text-white tracking-tight text-shadow">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-gray-200/50 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-[#12b8cd] transition-colors placeholder:text-gray-400 bg-white/80 backdrop-blur-sm"
                placeholder="Email address"
              />
            </div>

            <div className="space-y-1">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-gray-200/50 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-[#12b8cd] transition-colors placeholder:text-gray-400 bg-white/80 backdrop-blur-sm"
                placeholder="Password"
              />
            </div>

            {error && (
              <div className="bg-red-50/90 backdrop-blur-sm text-red-600 text-sm px-4 py-3 rounded-lg border border-red-100 italic">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#12b8cd] text-white py-3 rounded-lg text-base font-medium hover:bg-[#0e8c6d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Continue"
                  : "Create account"}
            </button>
          </form>

          <div className="mt-6 text-sm text-center text-gray-600">
            {mode === "login" ? (
              <p>
                Don’t have an account?{" "}
                <button
                  onClick={() => setMode("register")}
                  className="text-[#12b8cd] font-medium hover:underline hover:text-[#0e8c6d] transition-colors"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-[#12b8cd] font-medium hover:underline hover:text-[#0e8c6d] transition-colors"
                >
                  Log in
                </button>
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 flex gap-4 text-xs text-white/70 justify-center">
          <a href="#" className="hover:text-white transition-colors">Terms of use</a>
          <span className="text-white/50">|</span>
          <a href="#" className="hover:text-white transition-colors">Privacy policy</a>
        </div>
      </div>
    </div >
  );
}