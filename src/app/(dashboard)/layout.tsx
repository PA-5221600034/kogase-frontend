"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LucideHome, LucideList, LucideLogOut } from "lucide-react";

import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { projectsApi } from "@/lib/api/projects";
import { GetProjectResponse } from "@/lib/dtos/project_dto";

interface Project {
  id: string;
  name: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function loadProjects() {
      setProjectsLoading(true);
      try {
        const data = await projectsApi.getProjects();
        // Map API response to our Project interface
        const formattedProjects = data.projects.map((project: GetProjectResponse) => ({
          id: project.project_id,
          name: project.name
        }));
        setProjects(formattedProjects);
        
        // Try to get the selected project from localStorage
        const savedProject = localStorage.getItem('selectedProject');
        if (savedProject && (savedProject === 'all' || data.projects.some(p => p.project_id === savedProject))) {
          setSelectedProject(savedProject);
        } else if (data.projects.length > 0) {
          // Default to the first project if nothing is saved or saved project doesn't exist
          setSelectedProject(data.projects[0].project_id);
          localStorage.setItem('selectedProject', data.projects[0].project_id);
        } else {
          // Default to 'all' if no projects exist
          setSelectedProject('all');
          localStorage.setItem('selectedProject', 'all');
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjects([]);
        setSelectedProject('all');
        localStorage.setItem('selectedProject', 'all');
      } finally {
        setProjectsLoading(false);
      }
    }

    if (user) {
      loadProjects();
    }
  }, [user]);

  const handleProjectChange = (value: string) => {
    setSelectedProject(value);
    localStorage.setItem('selectedProject', value);
    
    // Dispatch a custom event to notify other components
    const event = new CustomEvent('projectChanged', { detail: value });
    window.dispatchEvent(event);
    
    // Refresh the current path
    if (pathname.includes('?')) {
      // If there are query parameters, update them
      const baseUrl = pathname.split('?')[0];
      const newPath = value === 'all' 
        ? baseUrl
        : `${baseUrl}?projectId=${value}`;
      router.push(newPath);
    } else {
      // If there are no query parameters, just refresh the current page
      router.refresh();
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (loading) {
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
  const selectedProjectName = selectedProject === 'all' 
    ? "Dashboard" 
    : projects.find(p => p.id === selectedProject)?.name || "Dashboard";

  const navItems = [
    {
      label: selectedProject === 'all' ? "Dashboard" : `${selectedProjectName}`,
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
            {!projectsLoading && (
              <div className="w-64">
                <Select value={selectedProject || ""} onValueChange={handleProjectChange}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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