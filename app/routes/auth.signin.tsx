import React, { type ChangeEvent } from "react";
import { FiLock, FiMail, FiAlertTriangle } from "react-icons/fi";
import { Link, useNavigate } from "react-router";

import Button from "~/components/Button";
import FormField from "~/components/FormField";

import { signIn } from "~/services/api";

export default function SingIn() {
  const [form, setForm] = React.useState({
    email: "",
    password: "",
  });
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const navigate = useNavigate();


  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const result = await signIn(form.email, form.password);
      console.log("user", result); // 

      // direction to dashboard or home page after successful sign in
      if (result.user.role === "admin") {
        navigate("/dashboard/admin");
      } else {
        navigate("/dashboard/agent");
      }

    } catch (error: any) {
      setError(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-form-card">
        <div className="auth-form-header">
          <h1 className="auth-form-title">Sign In</h1>
          <p className="auth-form-text">
            Enter your email and password to continue.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">
            <FiAlertTriangle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <FormField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            icon={FiMail}
            required
          />
          <FormField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            icon={FiLock}
            required
          />

          <div className="auth-form-row">
            <label className="auth-checkbox">
              <input type="checkbox" name="remember" className="auth-checkbox-input" />
              <span>Remember me</span>
            </label>

            <Link to="/" className="auth-link">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            label={loading ? "Signing in..." : "Sign In"}
            loading={loading}
            fullWidth
          />
        </form>

        <div className="border-t border-slate-200 pt-6">
          <p className="text-center text-sm text-slate-600">
            Don't have an account?{" "}
            <Link to="/auth/signup" className="auth-link font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
