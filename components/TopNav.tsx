"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function TopNav() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navLinks = [
    { href: "/exercises", label: "Exercises" },
    { href: "/yoga", label: "Yoga" },
    { href: "/workouts", label: "My Workouts", protected: true },
    { href: "/templates", label: "Templates", protected: true },
    { href: "/workout-builder", label: "Build Workout", protected: true },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            💪 FitnessPro
          </Link>

          {/* Center Links */}
          <div className="hidden md:flex gap-6 items-center">
            {navLinks.map((link) => {
              // Hide protected links if not authenticated
              if (link.protected && !user) {
                return null;
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Side - User Menu */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors font-medium"
                >
                  <span className="text-lg">👤</span>
                  <span className="hidden sm:inline text-sm">
                    {user.email?.split("@")[0] || "User"}
                  </span>
                  <span className="text-sm">▼</span>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b text-sm text-gray-600">
                      {user.email}
                    </div>
                    <Link
                      href="/workouts"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      My Workouts
                    </Link>
                    <Link
                      href="/templates"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Templates
                    </Link>
                    <Link
                      href="/workout-builder"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Build Workout
                    </Link>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 border-t"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle (for future expansion) */}
        <div className="md:hidden mt-4 flex gap-3 flex-wrap">
          {navLinks.map((link) => {
            if (link.protected && !user) {
              return null;
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-indigo-600 text-sm font-medium"
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Close menu when clicking outside */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  );
}
