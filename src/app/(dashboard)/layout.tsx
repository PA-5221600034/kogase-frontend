"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LucideHome,
  LucideList,
  LucideLogOut,
  LucideMenu,
  LucideX,
  LucideChevronRight,
  LucideActivity,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";

import { useAuth, useProjects } from "@/lib/hooks";
import { GetProjectResponse } from "@/lib/dtos";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { me: user, loading: authLoading, logout } = useAuth();
  const { getProjects, loading: projectLoading } = useProjects();

  const [projects, setProjects] = useState<GetProjectResponse[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Use a ref to track initialization to prevent multiple API calls
  const initialized = useRef(false);

  // Function to load projects - extracted to be reusable
  const loadProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data.projects);

      // Get the selected project from localStorage
      const localStorageSelectedProjectId = localStorage.getItem(
        "selected-project-id"
      );

      // Set selected project id based on localStorage or default to 'all'
      if (
        localStorageSelectedProjectId &&
        (localStorageSelectedProjectId === "all" ||
          data.projects.some(
            (p) => p.project_id === localStorageSelectedProjectId
          ))
      ) {
        setSelectedProjectId(localStorageSelectedProjectId);
      } else {
        setSelectedProjectId("all");
        localStorage.setItem("selected-project-id", "all");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      setSelectedProjectId("all");
      localStorage.setItem("selected-project-id", "all");
    }
  };

  // Effect for initial load and auth check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Effect to load projects once when authenticated
  useEffect(() => {
    // Only fetch projects once when user is authenticated
    if (user && !initialized.current) {
      // Set this immediately to prevent re-entry
      initialized.current = true;
      loadProjects();
    }
  }, [user]);

  // Effect to listen for project creation events
  useEffect(() => {
    // Setup event listener for project creation
    const handleProjectCreated = () => {
      // Reload the projects list
      loadProjects();
    };

    // Add event listener
    window.addEventListener(
      "projectCreated",
      handleProjectCreated as EventListener
    );

    // Clean up event listener
    return () => {
      window.removeEventListener(
        "projectCreated",
        handleProjectCreated as EventListener
      );
    };
  }, []);

  const handleProjectChange = (value: string) => {
    // Only proceed if the value has actually changed
    if (value !== selectedProjectId) {
      setSelectedProjectId(value);
      localStorage.setItem("selected-project-id", value);

      // Dispatch a custom event to notify other components
      const event = new CustomEvent("projectChanged", { detail: value });
      window.dispatchEvent(event);

      // Navigation updates
      if (pathname.includes("?")) {
        const baseUrl = pathname.split("?")[0];
        const newPath =
          value === "all" ? baseUrl : `${baseUrl}?projectId=${value}`;
        router.push(newPath);
      } else {
        router.refresh();
      }
    }
  };

  const handleLogout = async () => {
    logout();
    router.push("/login");
  };

  // Show loading UI when auth state is being determined
  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-30 w-full bg-background/95">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </header>
        <div className="container flex flex-1">
          <aside className="hidden md:block w-64 border-r pr-4 pt-8">
            <nav className="flex flex-col gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </nav>
          </aside>
          <main className="flex-1 p-4 md:p-8">
            <Skeleton className="h-8 w-64 mb-6" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </main>
        </div>
      </div>
    );
  }

  // Get the selected project name for the dashboard label
  const selectedProjectName =
    selectedProjectId === "all"
      ? "Dashboard"
      : projects?.find((p) => p.project_id === selectedProjectId)?.name ||
        "Dashboard";

  const navItems = [
    {
      label:
        selectedProjectId === "all" ? "Dashboard" : `${selectedProjectName}`,
      href: "/dashboard",
      icon: LucideHome,
    },
    {
      label: "Events",
      href: "/dashboard/events",
      icon: LucideActivity,
    },
    {
      label: "Sessions",
      href: "/dashboard/sessions",
      icon: LucideList,
    },
  ];

  const getInitials = (name: string | undefined): string => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const MobileNav = () => (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <LucideMenu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
        <div className="border-b border-border/50 px-5 py-4 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-md bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">K</span>
            </div>
            <h2 className="text-lg font-bold">Kogase</h2>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <LucideX className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-65px)]">
          <div className="p-5">
            <div className="mb-5 space-y-1">
              <p className="text-xs text-muted-foreground mb-1.5 font-medium px-2">
                PROJECT
              </p>
              <Select
                value={selectedProjectId || ""}
                onValueChange={(value) => {
                  handleProjectChange(value);
                  setIsMobileMenuOpen(false);
                }}
                disabled={projectLoading}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue
                    placeholder={
                      projectLoading ? "Loading..." : "Select a project"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects?.map((project) => (
                    <SelectItem
                      key={project.project_id}
                      value={project.project_id}
                    >
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 mb-5">
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between rounded-md px-2 py-2 transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </span>
                      {isActive && <LucideChevronRight className="h-4 w-4" />}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="mt-auto pt-4 border-t border-border/50">
              <div className="flex items-center gap-3 mb-3 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getInitials(user?.name || user?.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start"
              >
                <LucideLogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-30 w-full bg-background/95">
        <div className="flex h-16 items-center justify-between px-4 md:px-8 w-full">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <MobileNav />
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-md bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">K</span>
                </div>
                <h1 className="text-xl font-bold hidden sm:block">Kogase</h1>
              </div>
            </div>
            <div className="hidden md:block w-72">
              <Select
                value={selectedProjectId || ""}
                onValueChange={handleProjectChange}
                disabled={projectLoading}
              >
                <SelectTrigger className="h-9 border-dashed">
                  <SelectValue
                    placeholder={
                      projectLoading
                        ? "Loading projects..."
                        : "Select a project"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects?.map((project) => (
                    <SelectItem
                      key={project.project_id}
                      value={project.project_id}
                    >
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3 ml-auto">
            <ThemeToggle />
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getInitials(user?.name || user?.email)}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm mr-1">
                <p className="font-medium leading-none">
                  {user?.name || user?.email}
                </p>
                {user?.name && (
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LucideLogOut className="h-4 w-4" />
              Log out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden md:block w-64 border-r pt-6 min-h-[calc(100vh-4rem)] shrink-0">
          <div className="px-3 pb-2">
            <nav className="flex flex-col gap-1 sticky top-24">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </span>
                    {isActive && <LucideChevronRight className="h-4 w-4" />}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>
        <main className="flex-1 p-4 md:p-8 w-full">{children}</main>
      </div>
    </div>
  );
}
