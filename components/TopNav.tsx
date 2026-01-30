"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function TopNav() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
            className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
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
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Side - Hamburger Menu Only */}
          <div className="flex items-center gap-4">
            {/* Hamburger Menu */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {showMobileMenu ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

      </div>

      {/* Mobile Slide-out Menu */}
      {showMobileMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-fadeIn"
            onClick={() => setShowMobileMenu(false)}
          />

          {/* Menu Panel */}
          <div className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-xl z-50 animate-slideInLeft">
            <div className="p-4">
              {/* Close button */}
              <button
                onClick={() => setShowMobileMenu(false)}
                className="mb-6 p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Logo */}
              <Link
                href="/"
                className="block text-xl font-bold text-blue-600 mb-6"
                onClick={() => setShowMobileMenu(false)}
              >
                💪 FitnessPro
              </Link>

              {/* Navigation Links */}
              <div className="space-y-2">
                {navLinks.map((link) => {
                  if (link.protected && !user) {
                    return null;
                  }
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      {link.label}
                    </Link>
                  );
                })}

                {/* Profile and Logout for logged in users */}
                {user && (
                  <>
                    <Link
                      href="/profile"
                      className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        setShowMobileMenu(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium"
                    >
                      Logout
                    </button>
                  </>
                )}

                {/* Auth Buttons for non-logged in users */}
                {!user && (
                  <>
                    <Link
                      href="/login"
                      className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="block px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Close user menu when clicking outside */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  );
}
