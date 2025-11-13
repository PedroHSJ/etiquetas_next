"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Error retrieving session:", sessionError);
          setError("Authentication failed");
          router.push("/login");
          return;
        }

        if (data?.session?.user) {
          // Check if user already has an organization via user_organizations
          const { data: userOrgs, error: orgError } = await supabase
            .from("user_organizations")
            .select("id")
            .eq("user_id", data.session.user.id)
            .eq("active", true)
            .limit(1);

          if (orgError) {
            console.error("Error checking user organization:", orgError);
            // If there's an error checking, redirect to onboarding to be safe
            router.push("/onboarding");
            return;
          }

          // If no organization, it's first login - redirect to onboarding
          if (!userOrgs || userOrgs.length === 0) {
            router.push("/onboarding");
          } else {
            // User already has organization - redirect to dashboard
            router.push("/dashboard");
          }
        } else {
          setError("No authenticated user");
          router.push("/login");
        }
      } catch (err) {
        console.error("Unexpected error during auth callback:", err);
        setError("An unexpected error occurred");
        router.push("/login");
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        {error ? (
          <div>
            <p className="text-red-600 mb-2">{error}</p>
            <p className="text-sm text-gray-600">Redirecting to login...</p>
          </div>
        ) : (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2">Loading...</p>
          </>
        )}
      </div>
    </div>
  );
}
