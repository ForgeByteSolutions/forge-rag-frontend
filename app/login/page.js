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
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="mb-10 flex flex-col items-center">
        <div className="h-10 w-10 bg-black rounded-full flex items-center justify-center text-white mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5153-4.9108 6.0462 6.0462 0 0 0-4.7443-3.2243 6.072 6.072 0 0 0-5.2922 1.4286 6.0586 6.0586 0 0 0-5.6074 1.7014 6.0456 6.0456 0 0 0-2.0358 4.8895 6.0437 6.0437 0 0 0 2.1285 5.4671 5.981 5.981 0 0 0 .515 4.9103 6.0462 6.0462 0 0 0 4.743 3.2243 6.072 6.072 0 0 0 5.2925-1.4289 6.0581 6.0581 0 0 0 5.6071-1.7014 6.0456 6.0456 0 0 0 2.0358-4.8892 6.0423 6.0423 0 0 0-2.127-5.4668ZM18.3307 15.5561a1.2149 1.2149 0 0 1-1.807 1.2827 4.8569 4.8569 0 0 0-2.6846-.794 4.8465 4.8465 0 0 0-4.8447 4.8469c0 1.5639.76 3.0127 2.0496 3.9014a1.2152 1.2152 0 0 1-.678 2.2244 1.2154 1.2154 0 0 1-1.2154-1.2154c0-2.4855-2.0145-4.5-4.5-4.5a1.2152 1.2152 0 1 1 0-2.4304c1.5364 0 2.9608-.7712 3.826-2.0645a1.2151 1.2151 0 0 1 2.0464 1.3407 4.8569 4.8569 0 0 0 .7942 2.6843 4.8465 4.8465 0 0 0 4.8446-4.8469c0-1.5639-.76-3.0127-2.0496-3.9014a1.2152 1.2152 0 1 1 1.3561-2.009 6.07 6.07 0 0 0 1.6214 2.8943Z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
      </div>

      <div className="w-full max-w-[400px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-[#12b8cd] transition-colors placeholder:text-gray-400"
              placeholder="Email address"
            />
          </div>

          <div className="space-y-1">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-[#12b8cd] transition-colors placeholder:text-gray-400"
              placeholder="Password"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-100 italic">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#12b8cd] text-white py-3 rounded-lg text-base font-medium hover:bg-[#0e8c6d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-sm"
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
                className="text-[#12b8cd] font-medium hover:underline"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-[#12b8cd] font-medium hover:underline"
              >
                Log in
              </button>
            </p>
          )}
        </div>
      </div>

      <div className="mt-20 flex gap-4 text-xs text-gray-400">
        <a href="#" className="hover:text-gray-600">Terms of use</a>
        <span>|</span>
        <a href="#" className="hover:text-gray-600">Privacy policy</a>
      </div>
    </div>
  );
}

