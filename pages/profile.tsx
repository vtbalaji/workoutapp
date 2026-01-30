"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Input, Select } from "@/components/Input";
import Button from "@/components/Button";
import Toast from "@/components/Toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faSave } from "@fortawesome/free-solid-svg-icons";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

interface UserProfile {
  weight?: number;
  height?: number;
  gender?: "male" | "female";
  displayName?: string;
}

function ProfileContent() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    gender: "male",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [errors, setErrors] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProfile({
            displayName: data.displayName || user.displayName || "",
            weight: data.weight,
            height: data.height,
            gender: data.gender || "male",
          });
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Partial<UserProfile> = {};

    if (profile.weight && (profile.weight < 20 || profile.weight > 500)) {
      newErrors.weight = 20;
    }

    if (profile.height && (profile.height < 50 || profile.height > 300)) {
      newErrors.height = 50;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setToast({ message: "Please fix the errors before saving", type: "error" });
      return;
    }

    setSaving(true);
    try {
      const token = await user?.getIdToken();
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) throw new Error("Failed to save profile");

      setToast({ message: "Profile saved successfully!", type: "success" });
    } catch (error) {
      setToast({ message: "Failed to save profile", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faUser} className="text-3xl" />
            <div>
              <h1 className="text-3xl font-bold">Profile Settings</h1>
              <p className="text-blue-100">Manage your account details</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Account Information */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Account Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
              </div>

              <Input
                label="Display Name"
                placeholder="Your name"
                value={profile.displayName || ""}
                onChange={(e) =>
                  setProfile({ ...profile, displayName: e.target.value })
                }
                helperText="Optional: How you'd like to be called"
              />
            </div>
          </div>

          {/* Personal Details */}
          <div className="mb-8 pt-6 border-t">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Personal Details</h2>
            <p className="text-sm text-gray-600 mb-4">
              This information helps us personalize your workout experience
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Weight"
                type="number"
                placeholder="kg"
                value={profile.weight || ""}
                onChange={(e) =>
                  setProfile({ ...profile, weight: parseFloat(e.target.value) || undefined })
                }
                error={errors.weight ? "Weight must be between 20-500 kg" : undefined}
                helperText="Your current weight in kilograms"
              />

              <Input
                label="Height"
                type="number"
                placeholder="cm"
                value={profile.height || ""}
                onChange={(e) =>
                  setProfile({ ...profile, height: parseFloat(e.target.value) || undefined })
                }
                error={errors.height ? "Height must be between 50-300 cm" : undefined}
                helperText="Your height in centimeters"
              />
            </div>

            <div className="mt-4">
              <Select
                label="Gender"
                value={profile.gender || "male"}
                onChange={(e) =>
                  setProfile({ ...profile, gender: e.target.value as "male" | "female" })
                }
                options={[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                ]}
                helperText="Used to display appropriate exercise images"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              variant="secondary"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              loading={saving}
              icon={faSave}
            >
              Save Changes
            </Button>
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Why we ask for this information</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• <strong>Gender:</strong> Displays exercise images that match your preference</li>
            <li>• <strong>Weight & Height:</strong> Future features will use this for calorie tracking and workout recommendations</li>
            <li>• <strong>Privacy:</strong> Your data is private and only visible to you</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
