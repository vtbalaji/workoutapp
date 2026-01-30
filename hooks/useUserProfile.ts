import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface UserProfile {
  displayName?: string;
  weight?: number;
  height?: number;
  gender: "male" | "female";
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({ gender: "male" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        // No user logged in, use default profile
        setProfile({ gender: "male" });
        setLoading(false);
        return;
      }

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
            displayName: data.displayName,
            weight: data.weight,
            height: data.height,
            gender: data.gender || "male",
          });
        } else {
          // API error, use default
          setProfile({ gender: "male" });
        }
      } catch (error) {
        // Network error or other issue, use default silently
        setProfile({ gender: "male" });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  return { profile, loading };
}
