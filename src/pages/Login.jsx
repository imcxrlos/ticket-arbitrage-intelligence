import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("login"); // login | register | otp | forgot
  const [otpCode, setOtpCode] = useState("");
  const [registered, setRegistered] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = "/scanner";
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setMode("otp");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtp = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await base44.auth.verifyOtp({ email, otpCode });
      base44.auth.setToken(res.access_token);
      window.location.href = "/scanner";
    } catch (err) {
      setError(err.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    await base44.auth.resetPasswordRequest(email).catch(() => {});
    setError("");
    setLoading(false);
    setRegistered(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-2 h-2 rounded-full bg-white pulse-dot" />
          <span className="font-display font-semibold text-white">Ghost</span>
        </div>

        {mode === "login" && (
          <>
            <h1 className="font-display text-2xl font-bold text-white mb-1">Welcome back</h1>
            <p className="text-sm text-white/30 mb-8">Sign in to access your scanner & watchlist</p>
            <form onSubmit={handleLogin} className="space-y-3">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" required
                className="w-full h-11 px-4 bg-white/4 border border-white/8 rounded text-sm text-white placeholder:text-white/25 font-mono outline-none focus:border-white/20 transition-colors" />
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required
                  className="w-full h-11 px-4 pr-10 bg-white/4 border border-white/8 rounded text-sm text-white placeholder:text-white/25 font-mono outline-none focus:border-white/20 transition-colors" />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full h-11 bg-white text-black font-semibold rounded hover:bg-white/90 transition-all disabled:opacity-50 text-sm">
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
            <div className="mt-4 flex items-center justify-between text-xs font-mono">
              <button onClick={() => setMode("forgot")} className="text-white/30 hover:text-white transition-colors">Forgot password?</button>
              <button onClick={() => setMode("register")} className="text-white/30 hover:text-white transition-colors">Create account</button>
            </div>
          </>
        )}

        {mode === "register" && (
          <>
            <h1 className="font-display text-2xl font-bold text-white mb-1">Create account</h1>
            <p className="text-sm text-white/30 mb-8">Save opportunities and set alerts</p>
            <form onSubmit={handleRegister} className="space-y-3">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" required
                className="w-full h-11 px-4 bg-white/4 border border-white/8 rounded text-sm text-white placeholder:text-white/25 font-mono outline-none focus:border-white/20 transition-colors" />
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required
                  className="w-full h-11 px-4 pr-10 bg-white/4 border border-white/8 rounded text-sm text-white placeholder:text-white/25 font-mono outline-none focus:border-white/20 transition-colors" />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full h-11 bg-white text-black font-semibold rounded hover:bg-white/90 transition-all disabled:opacity-50 text-sm">
                {loading ? "Creating..." : "Create account"}
              </button>
            </form>
            <button onClick={() => setMode("login")} className="mt-4 text-xs text-white/30 hover:text-white transition-colors font-mono flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Back to sign in
            </button>
          </>
        )}

        {mode === "otp" && (
          <>
            <h1 className="font-display text-2xl font-bold text-white mb-1">Verify email</h1>
            <p className="text-sm text-white/30 mb-8">Enter the code sent to {email}</p>
            <form onSubmit={handleOtp} className="space-y-3">
              <input value={otpCode} onChange={e => setOtpCode(e.target.value)} placeholder="6-digit code" required maxLength={6}
                className="w-full h-11 px-4 bg-white/4 border border-white/8 rounded text-sm text-white placeholder:text-white/25 font-mono tracking-widest text-center outline-none focus:border-white/20 transition-colors" />
              {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full h-11 bg-white text-black font-semibold rounded hover:bg-white/90 transition-all disabled:opacity-50 text-sm">
                {loading ? "Verifying..." : "Verify"}
              </button>
            </form>
            <button onClick={() => base44.auth.resendOtp(email)} className="mt-4 text-xs text-white/30 hover:text-white transition-colors font-mono">
              Resend code
            </button>
          </>
        )}

        {mode === "forgot" && (
          <>
            <h1 className="font-display text-2xl font-bold text-white mb-1">Reset password</h1>
            <p className="text-sm text-white/30 mb-8">Enter your email to receive a reset link</p>
            {registered ? (
              <p className="text-sm text-ghost-green font-mono">If that email is registered, you'll receive a reset link shortly.</p>
            ) : (
              <form onSubmit={handleForgot} className="space-y-3">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" required
                  className="w-full h-11 px-4 bg-white/4 border border-white/8 rounded text-sm text-white placeholder:text-white/25 font-mono outline-none focus:border-white/20 transition-colors" />
                <button type="submit" disabled={loading}
                  className="w-full h-11 bg-white text-black font-semibold rounded hover:bg-white/90 transition-all disabled:opacity-50 text-sm">
                  {loading ? "Sending..." : "Send reset link"}
                </button>
              </form>
            )}
            <button onClick={() => setMode("login")} className="mt-4 text-xs text-white/30 hover:text-white transition-colors font-mono flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Back to sign in
            </button>
          </>
        )}

        <div className="mt-12 pt-6 border-t border-white/5">
          <Link to="/scanner" className="text-xs text-white/20 hover:text-white/40 font-mono transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Continue without account
          </Link>
        </div>
      </div>
    </div>
  );
}