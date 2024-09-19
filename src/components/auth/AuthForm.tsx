import { useEnv } from "@/providers/EnvProvider";
import { SupabaseClient } from "@/utils/supabase/server";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useState, ChangeEvent, FormEvent } from "react";

type AuthView = "sign_in" | "sign_up" | "forgotten_password";

const AuthForm: React.FC = () => {
  const supabaseClient = SupabaseClient.getClient();
  const [view, setView] = useState<AuthView>("sign_in");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>(""); // Success state
  const env = useEnv();

  const router = useRouter();
  const locale = useLocale();

  const resetForm = (): void => {
    setEmail("");
    setPassword("");
  };

  const handleSignIn = async (): Promise<void> => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSuccessMessage("Sign in successful! Redirecting...");
      resetForm();
      router.refresh();
    }
    setLoading(false);
  };

  const handleSignUp = async (): Promise<void> => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const emailDomain = email.split('@')[1];

    if (env.ALLOWED_DOMAINS != "" && !env.ALLOWED_DOMAINS.includes(emailDomain)) {
      return router.replace(`/${locale}/waitlist?email=${encodeURIComponent(email)}`);
    }

    const { error } = await supabaseClient.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSuccessMessage("Registration successful! Please check your email.");
      resetForm();
    }

    setLoading(false);
  };

  const handlePasswordReset = async (): Promise<void> => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email);

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSuccessMessage("Password reset link sent to your email.");
      resetForm();
    }

    setLoading(false);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (view === "sign_in") {
      handleSignIn();
    } else if (view === "sign_up") {
      handleSignUp();
    } else {
      handlePasswordReset();
    }
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: ChangeEvent<HTMLInputElement>): void => {
      setter(e.target.value);
    };

  return (
    <div>
      <div className="w-full max-w-md bg-white rounded-lg p-4">
        <h3 className="text-3xl font-bold text-center">
          {view === "sign_in"
            ? "Sign in"
            : view === "sign_up"
              ? "Register"
              : "Reset Password"}
        </h3>

        <div className="text-sm text-gray-600 mb-6 text-center">
          {view === "sign_in"
            ? "Welcome back. Please enter your details"
            : view === "sign_up"
              ? "Please enter your details to register."
              : "Forgot your password? Please enter your email."}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">
              Your (university) email address
            </label>
            <input
              type="email"
              value={email}
              onChange={handleInputChange(setEmail)}
              placeholder="student@university.edu.se"
              required
              className="w-full h-12 border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {view !== "forgotten_password" && (
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={handleInputChange(setPassword)}
                required
                className="w-full h-12 border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          )}

          {errorMessage && (
            <p className="text-red-500 text-sm text-center">{errorMessage}</p>
          )}

          {successMessage && (
            <p className="text-green-500 text-sm text-center">{successMessage}</p>
          )}

          <button
            type="submit"
            className={`w-full h-12 rounded-md text-white font-semibold ${loading ? 'bg-gray-500' : 'bg-indigo-600 hover:bg-indigo-700'} transition`}
            disabled={loading}
          >
            {loading
              ? "Loading..."
              : view === "sign_in"
                ? "Sign In"
                : view === "sign_up"
                  ? "Sign Up"
                  : "Reset Password"}
          </button>
        </form>

        <div className="flex flex-col items-center mt-6">
          <button
            className={`text-sm ${view === "forgotten_password" ? "hidden" : "text-gray-700 hover:text-gray-900"}`}
            onClick={() => setView(view === "sign_in" ? "sign_up" : "sign_in")}
          >
            {view === "sign_in"
              ? "Don't have an account? Register"
              : "Already have an account? Log in"}
          </button>

          <button
            className={`text-sm mt-2 ${view === "sign_up" ? "hidden" : "text-gray-700 hover:text-gray-900"}`}
            onClick={() => setView(view === "forgotten_password" ? "sign_in" : "forgotten_password")}
          >
            {view === "forgotten_password"
              ? "Back to login"
              : "Forgot your password?"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
