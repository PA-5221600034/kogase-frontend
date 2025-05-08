"use client";

import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/50">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="flex flex-1 items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center space-y-2">
            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <h1 className="text-2xl font-bold text-primary">K</h1>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Kogase</h1>
            <p className="text-sm text-muted-foreground max-w-xs">
              Komu{"'"}s Game Service
            </p>
          </div>

          <div className="backdrop-blur-sm bg-card/90 rounded-xl border shadow-sm overflow-hidden">
            {children}
          </div>

          <div className="mt-8 text-center text-xs text-muted-foreground">
            <p>© 2025 Kogase. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
