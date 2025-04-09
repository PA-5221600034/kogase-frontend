"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LucideUsers,
  LucideActivity,
  LucidePlusCircle,
  LucideClock,
  LucideDownload
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createProjectSchema, type CreateProjectFormData } from "@/lib/validators/projects";
import { Skeleton } from "@/components/ui/skeleton";
import { projectsApi } from "@/lib/api/projects";
import { analyticsApi } from "@/lib/api/analytics";
import { GetProjectResponse } from "@/lib/dtos/project_dto";
import { GetAnalyticsResponse } from "@/lib/dtos/analytics_dto";

export default function Dashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const [projects, setProjects] = useState<GetProjectResponse[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<GetAnalyticsResponse | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  async function fetchProjects() {
    setProjectsLoading(true);
    try {
      const response = await projectsApi.getProjects();
      setProjects(response.projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
      setProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  }

  async function fetchAnalytics(projectId: string | null) {
    try {
      if (!projectId || projectId === 'all') {
        const data = await analyticsApi.getAnalytics();
        return data;
      } else {
        const data = await analyticsApi.getAnalytics({
          project_id: projectId,
        });
        return data;
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  async function createProject(data: { name: string; description: string }) {
    try {
      const response = await projectsApi.createProject({
        name: data.name
      });
      
      await fetchProjects();
      return response;
    } catch (error) {
      console.error('Error creating project:', error);
      throw new Error('Failed to create project');
    }
  }

  useEffect(() => {
    fetchProjects();
    
    // Read selected project from localStorage (set by layout)
    const savedProject = localStorage.getItem('selectedProject');
    if (savedProject) {
      setSelectedProject(savedProject);
    }

    // Add event listener for project change events
    const handleProjectChange = (e: CustomEvent<string>) => {
      setSelectedProject(e.detail);
    };

    // Listen for project change events
    window.addEventListener('projectChanged', handleProjectChange as EventListener);

    return () => {
      window.removeEventListener('projectChanged', handleProjectChange as EventListener);
    };
  }, []);

  // Re-fetch data when the pathname or query parameters change
  useEffect(() => {
    // Read selected project from localStorage as it might have been updated by layout
    const savedProject = localStorage.getItem('selectedProject');
    if (savedProject && savedProject !== selectedProject) {
      setSelectedProject(savedProject);
    }
  }, [pathname, selectedProject]);

  useEffect(() => {
    async function loadAnalytics() {
      if (selectedProject) {
        setStatsLoading(true);
        try {
          const stats = await fetchAnalytics(selectedProject);
          setAnalyticsData(stats);
        } catch (error) {
          console.error("Failed to load analytics:", error);
          setAnalyticsData({
            dau: 0,
            mau: 0,
            total_duration: 0,
            total_installs: 0,
          });
        } finally {
          setStatsLoading(false);
        }
      }
    }

    loadAnalytics();
  }, [selectedProject]);

  const onSubmit = async (data: CreateProjectFormData) => {
    try {
      const newProject = await createProject({
        name: data.name,
        description: data.description || ""
      });
      toast.success("Project created successfully!");
      setSelectedProject(newProject.project_id);
      localStorage.setItem('selectedProject', newProject.project_id);
      setOpenDialog(false);
      form.reset();
    } catch (error) {
      console.error("Failed to create project:", error);
      toast.error("Failed to create project. Please try again.");
    }
  };

  const goToEvents = () => {
    if (selectedProject && selectedProject !== 'all') {
      router.push(`/dashboard/events?projectId=${selectedProject}`);
    } else {
      router.push(`/dashboard/events`);
    }
  };

  const formatDuration = (ns: number): string => {
    const totalSeconds = Math.floor(ns / 1_000_000_000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
  
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const currentProject = selectedProject && selectedProject !== 'all' 
    ? projects.find(p => p.project_id === selectedProject) 
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          {selectedProject === 'all' ? 'Dashboard' : currentProject?.name || 'Dashboard'}
        </h1>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <LucidePlusCircle className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new project</DialogTitle>
              <DialogDescription>
                Create a new project to start tracking events for your game.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Game" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="A description of your game" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Creating..." : "Create Project"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {projectsLoading ? (
        <Skeleton className="h-10 w-full max-w-xs" />
      ) : projects.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <h2 className="text-lg font-semibold">No projects found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Get started by creating your first project.
          </p>
          <Button className="mt-4" onClick={() => setOpenDialog(true)}>
            <LucidePlusCircle className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </div>
      ) : null}

      {selectedProject && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
                <LucideUsers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{analyticsData?.dau || 0}</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Active Users</CardTitle>
                <LucideUsers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{analyticsData?.mau || 0}</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Session Duration</CardTitle>
                <LucideClock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{formatDuration(analyticsData?.total_duration || 0)}</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Installs</CardTitle>
                <LucideDownload className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{analyticsData?.total_installs || 0}</div>
                )}
              </CardContent>
            </Card>
          </div>

          {currentProject && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                  <CardDescription>
                    Information about your selected project
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="font-medium">Name:</span> {currentProject.name}
                  </div>
                  <div>
                    <span className="font-medium">Created By:</span> {currentProject.owner_id}
                  </div>
                  <div className="pt-2">
                    <span className="font-medium block mb-1">API Key:</span>
                    <code className="block rounded bg-muted p-2 text-sm">
                      {currentProject.api_key}
                    </code>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-5">
                  <Button variant="outline" onClick={goToEvents}>
                    <LucideActivity className="mr-2 h-4 w-4" />
                    Explore Events
                  </Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Tips</CardTitle>
                  <CardDescription>
                    Getting started with Kogase
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-muted p-4">
                    <h3 className="font-semibold">1. Integrate the SDK</h3>
                    <p className="mt-1 text-sm">
                      Use our Unity SDK to start tracking events in your game.
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <h3 className="font-semibold">2. Track Key Events</h3>
                    <p className="mt-1 text-sm">
                      Track game starts, level completions, and in-app purchases.
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <h3 className="font-semibold">3. Analyze Your Data</h3>
                    <p className="mt-1 text-sm">
                      Use the dashboard to gain insights about player behavior.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-5">
                  <Button className="w-full" variant="outline">
                    View Documentation
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
} 