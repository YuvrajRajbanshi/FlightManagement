"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/store/useUserStore";

const publicRoutes = ["/auth/login", "/auth/register"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const { setSession } = useUserStore();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        setSession({
          accessToken: data.session.access_token,
          user: {
            id: data.session.user.id,
            email: data.session.user.email || "",
          },
        });
      } else if (!publicRoutes.includes(pathname)) {
        router.push("/auth/login");
      }

      setIsLoading(false);
    };

    checkSession();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setSession({
            accessToken: session.access_token,
            user: {
              id: session.user.id,
              email: session.user.email || "",
            },
          });
        } else {
          setSession({
            accessToken: null,
            user: null,
          });
          if (!publicRoutes.includes(pathname)) {
            router.push("/auth/login");
          }
        }
      },
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase, setSession, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return children;
}
