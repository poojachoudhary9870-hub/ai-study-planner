import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import { doc, setDoc } from "firebase/firestore";

import { auth, db } from "../firebase";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setError("");

    // -------------------------
    // VALIDATION
    // -------------------------

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setError("Please enter your name.");
      return;
    }

    if (cleanName.length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }

    if (!cleanEmail) {
      setError("Please enter your email.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // -------------------------
      // CREATE FIREBASE ACCOUNT
      // -------------------------

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      const user = userCredential.user;

      console.log("Firebase account created:", user.uid);

      // -------------------------
      // SAVE NAME IN FIREBASE AUTH
      // -------------------------

      await updateProfile(user, {
        displayName: cleanName,
      });

      // -------------------------
      // SAVE USER IN FIRESTORE
      // -------------------------

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: cleanName,
        email: cleanEmail,
        createdAt: new Date().toISOString(),
      });

      console.log("User saved to Firestore");

      // -------------------------
      // SUCCESS
      // -------------------------

      alert("Account created successfully!");

      // Clear form
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // Go to dashboard
      navigate("/");

    } catch (error: any) {
      console.error("SIGNUP ERROR:", error);

      switch (error.code) {
        case "auth/email-already-in-use":
          setError("An account with this email already exists.");
          break;

        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;

        case "auth/weak-password":
          setError("Password must be at least 6 characters.");
          break;

        case "auth/network-request-failed":
          setError(
            "Network error. Please check your internet connection."
          );
          break;

        case "permission-denied":
          setError(
            "Firestore permission denied. Please check Firestore rules."
          );
          break;

        default:
          setError(
            error.message || "Signup failed. Please try again."
          );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">

        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-800">
          Create Account 🚀
        </h1>

        <p className="mt-2 text-gray-500">
          Start planning your studies with AI.
        </p>

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">

          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              disabled={loading}
              className="mt-2 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
              className="mt-2 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              disabled={loading}
              className="mt-2 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Re-enter your password"
              disabled={loading}
              className="mt-2 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* Signup Button */}
          <button
            type="button"
            onClick={handleSignup}
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </div>

        {/* Login */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}

          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Login
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Signup;