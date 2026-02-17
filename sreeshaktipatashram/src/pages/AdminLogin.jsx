import { useState } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/auth/firebase";
import { useAuth } from "@/auth/AuthContext";

export default function AdminLogin() {
  const { theme } = useOutletContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      const target = location.state?.from || "/admin/blog";
      navigate(target, { replace: true });
    } catch (err) {
      setError("Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      navigate("/admin/blog", { replace: true });
    }
  }, [isAdmin, navigate]);

  return (
    <section className="min-h-screen px-6 md:px-24 py-16" style={{ backgroundColor: theme.colors.bg.primary }}>
      <div className="max-w-xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-light mb-8" style={{ color: theme.text }}>
          Admin Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm mb-2" style={{ color: theme.textMuted }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-4 rounded-none outline-none"
              style={{
                backgroundColor: theme.colors.bg.card,
                borderColor: theme.border,
                color: theme.text,
              }}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-2" style={{ color: theme.textMuted }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-4 rounded-none outline-none"
              style={{
                backgroundColor: theme.colors.bg.card,
                borderColor: theme.border,
                color: theme.text,
              }}
              required
            />
          </div>

          {error && (
            <div className="text-sm" style={{ color: "#b91c1c" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-none border transition-colors"
            style={{
              backgroundColor: theme.accent,
              borderColor: theme.accent,
              color: "#ffffff",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </section>
  );
}
