"use client";

import { useEffect, useState, useCallback } from "react";
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
import { useProjects, useAnalytics } from "@/lib/hooks";
import { GetProjectResponseDetail } from "@/lib/dtos/project_dto";
import { GetAnalyticsResponse } from "@/lib/dtos/analytics_dto";
import { formatDuration } from "@/lib/utils";

export default function Dashboard() {
  const router = useRouter();
  const pathname = usePathname();

  const { getProject, createProject, loading: projectsLoading } = useProjects();
  const { getAnalytics, loading: analyticsLoading } = useAnalytics();
  
  const [project, setProject] = useState<GetProjectResponseDetail | null>(null);
  const [analyticsData, setAnalyticsData] = useState<GetAnalyticsResponse | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
    },
  });

  const fetchProject = useCallback(async () => {
    try {
      if (selectedProjectId && selectedProjectId !== 'all') {
        const response = await getProject(selectedProjectId);
        setProject(response);
      } else {
        setProject(null);
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
      toast.error('Failed to load project details');
      setProject(null);
    }
  }, [selectedProjectId, getProject]);

  const fetchAnalytics = useCallback(async (projectId: string | null) => {
    try {
      if (!projectId || projectId === 'all') {
        const data = await getAnalytics();
        return data;
      } else {
        const data = await getAnalytics({
          project_id: projectId,
        });
        return data;
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }, [getAnalytics]);

  useEffect(() => {    
    const savedProject = localStorage.getItem('selected-project-id');
    if (savedProject) {
      setSelectedProjectId(savedProject);
    }

    const handleProjectChange = (e: CustomEvent<string>) => {
      setSelectedProjectId(e.detail);
    };

    window.addEventListener('projectChanged', handleProjectChange as EventListener);

    return () => {
      window.removeEventListener('projectChanged', handleProjectChange as EventListener);
    };
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchProject();
    }
  }, [fetchProject, selectedProjectId]);

  useEffect(() => {
    const savedProject = localStorage.getItem('selected-project-id');
    if (savedProject && savedProject !== selectedProjectId) {
      setSelectedProjectId(savedProject);
    }
  }, [pathname, selectedProjectId]);

  useEffect(() => {
    async function loadAnalytics() {
      if (selectedProjectId) {
        try {
          const stats = await fetchAnalytics(selectedProjectId);
          setAnalyticsData(stats);
        } catch (error) {
          console.error("Failed to load analytics:", error);
          setAnalyticsData({
            dau: 0,
            mau: 0,
            total_duration: 0,
            total_installs: 0,
          });
        }
      }
    }

    loadAnalytics();
  }, [fetchAnalytics, selectedProjectId]);

  const onSubmit = async (data: CreateProjectFormData) => {
    try {
      const newProject = await createProject({
        name: data.name
      });
      toast.success("Project created successfully!");
      setSelectedProjectId(newProject.project_id);
      localStorage.setItem('selected-project-id', newProject.project_id);
      setOpenDialog(false);
      form.reset();
    } catch (error) {
      console.error("Failed to create project:", error);
      toast.error("Failed to create project. Please try again.");
    }
  };

  const goToEvents = () => {
    if (selectedProjectId && selectedProjectId !== 'all') {
      router.push(`/dashboard/events?projectId=${selectedProjectId}`);
    } else {
      router.push(`/dashboard/events`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          {selectedProjectId === 'all' ? 'Dashboard' : project?.name || 'Dashboard'}
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
      ) : !selectedProjectId || selectedProjectId === 'all' ? (
        <div className="rounded-lg border p-8 text-center">
          <h2 className="text-lg font-semibold">No project selected</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Please select a project from the dropdown or create a new one.
          </p>
          <Button className="mt-4" onClick={() => setOpenDialog(true)}>
            <LucidePlusCircle className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </div>
      ) : null}

      {selectedProjectId && selectedProjectId !== 'all' && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
                <LucideUsers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
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
                {analyticsLoading ? (
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
                {analyticsLoading ? (
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
                {analyticsLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{analyticsData?.total_installs || 0}</div>
                )}
              </CardContent>
            </Card>
          </div>

          {project && (
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
                    <span className="font-medium">Name:</span> {project.name}
                  </div>
                  <div>
                    <span className="font-medium">Created By:</span> {project.owner?.name || project.owner?.email}
                  </div>
                  <div className="pt-2">
                    <span className="font-medium block mb-1">API Key:</span>
                    <code className="block rounded bg-muted p-2 text-sm">
                      {project.api_key}
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