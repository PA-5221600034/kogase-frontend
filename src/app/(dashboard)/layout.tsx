"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LucideHome, LucideList, LucideLogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  // Use a ref to track initialization to prevent multiple API calls
  const initialized = useRef(false);

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
      
      // Load projects
      async function loadProjects() {
        try {
          const data = await getProjects();
          setProjects(data.projects);
          
          // Get the selected project from localStorage
          const localStorageSelectedProjectId = localStorage.getItem('selected-project-id');
          
          // Set selected project id based on localStorage or default to 'all'
          if (localStorageSelectedProjectId && 
              (localStorageSelectedProjectId === 'all' || 
               data.projects.some(p => p.project_id === localStorageSelectedProjectId))) {
            setSelectedProjectId(localStorageSelectedProjectId);
          } else {
            setSelectedProjectId('all');
            localStorage.setItem('selected-project-id', 'all');
          }
        } catch (error) {
          console.error('Error fetching projects:', error);
          setSelectedProjectId('all');
          localStorage.setItem('selected-project-id', 'all');
        }
      }
      
      loadProjects();
    }
  }, [user, getProjects]);

  const handleProjectChange = (value: string) => {
    // Only proceed if the value has actually changed
    if (value !== selectedProjectId) {
      setSelectedProjectId(value);
      localStorage.setItem('selected-project-id', value);
      
      // Dispatch a custom event to notify other components
      const event = new CustomEvent('projectChanged', { detail: value });
      window.dispatchEvent(event);
      
      // Navigation updates
      if (pathname.includes('?')) {
        const baseUrl = pathname.split('?')[0];
        const newPath = value === 'all' 
          ? baseUrl
          : `${baseUrl}?projectId=${value}`;
        router.push(newPath);
      } else {
        router.refresh();
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Show loading UI when auth state is being determined
  if (authLoading) {
    return (
      <div className="flex h-screen flex-col">
        <header className="border-b">
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
          <aside className="w-64 border-r pr-4 pt-8">
            <nav className="flex flex-col gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </nav>
          </aside>
          <main className="flex-1 p-8">
            <Skeleton className="h-8 w-64 mb-6" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </main>
        </div>
      </div>
    );
  }

  // Get the selected project name for the dashboard label
  const selectedProjectName = selectedProjectId === 'all' 
    ? "Dashboard" 
    : projects?.find(p => p.project_id === selectedProjectId)?.name || "Dashboard";

  const navItems = [
    {
      label: selectedProjectId === 'all' ? "Dashboard" : `${selectedProjectName}`,
      href: "/dashboard",
      icon: LucideHome,
    },
    {
      label: "Sessions",
      href: "/dashboard/sessions",
      icon: LucideList,
    },
  ];

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Kogase</h1>
            <div className="w-64">
              <Select 
                value={selectedProjectId || ""} 
                onValueChange={handleProjectChange} 
                disabled={projectLoading}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={projectLoading ? "Loading projects..." : "Select a project"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects?.map((project) => (
                    <SelectItem key={project.project_id} value={project.project_id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.name || user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LucideLogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </div>
      </header>
      <div className="container flex flex-1">
        <aside className="w-64 border-r pr-4 pt-8">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}