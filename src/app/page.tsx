"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";

export default function Home() {
  const router = useRouter();
  const { me, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (me) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [me, loading, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Kogase</h1>
        <p className="mt-2">Komu&apos;s Game Service</p>
        <div className="mt-4 animate-pulse">Redirecting...</div>
      </div>
    </div>
  );
}
