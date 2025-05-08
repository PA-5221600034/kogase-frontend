"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LucideUsers,
  LucideActivity,
  LucidePlusCircle,
  LucideClock,
  LucideDownload,
  LucideChevronRight,
  LucideCode,
  LucideBarChart3,
  LucideSettings,
} from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  createProjectSchema,
  type CreateProjectFormData,
} from "@/lib/validators/projects";
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
  const [analytics, setAnalytics] = useState<GetAnalyticsResponse | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [openDialog, setOpenDialog] = useState(false);

  const isLoadingProject = useRef(false);
  const isLoadingAnalytics = useRef(false);

  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    const savedProject = localStorage.getItem("selected-project-id");
    if (savedProject) {
      setSelectedProjectId(savedProject);
    }

    const handleProjectChange = (e: CustomEvent<string>) => {
      setSelectedProjectId(e.detail);
    };

    window.addEventListener(
      "projectChanged",
      handleProjectChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "projectChanged",
        handleProjectChange as EventListener
      );
    };
  }, []);

  useEffect(() => {
    const savedProject = localStorage.getItem("selected-project-id");
    if (savedProject && savedProject !== selectedProjectId) {
      setSelectedProjectId(savedProject);
    }
  }, [pathname, selectedProjectId]);

  async function loadProject() {
    isLoadingProject.current = true;

    try {
      if (selectedProjectId && selectedProjectId !== "all") {
        const response = await getProject(selectedProjectId);
        setProject(response);
      } else {
        setProject(null);
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
      toast.error("Failed to load project details");
      setProject(null);
    } finally {
      isLoadingProject.current = false;
    }
  }

  async function loadAnalytics() {
    isLoadingAnalytics.current = true;

    try {
      const data =
        selectedProjectId === "all" || !selectedProjectId
          ? await getAnalytics()
          : await getAnalytics({ project_id: selectedProjectId });

      setAnalytics(data);
    } catch (error) {
      console.error("Failed to load analytics:", error);
      setAnalytics(null);
    } finally {
      isLoadingAnalytics.current = false;
    }
  }

  useEffect(() => {
    if (!selectedProjectId) return;

    if (isLoadingProject.current) return;

    loadProject();
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId]);

  const onSubmit = async (data: CreateProjectFormData) => {
    try {
      const newProject = await createProject({
        name: data.name,
      });
      toast.success("Project created successfully!");
      setSelectedProjectId(newProject.project_id);
      localStorage.setItem("selected-project-id", newProject.project_id);

      // Dispatch custom event to notify that a project was created
      window.dispatchEvent(new CustomEvent("projectCreated"));

      setOpenDialog(false);
      form.reset();
    } catch (error) {
      console.error("Failed to create project:", error);
      toast.error("Failed to create project. Please try again.");
    }
  };

  const goToEvents = () => {
    if (selectedProjectId && selectedProjectId !== "all") {
      router.push(`/dashboard/events?projectId=${selectedProjectId}`);
    } else {
      router.push(`/dashboard/events`);
    }
  };

  return (
    <div className="space-y-8 w-full max-w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {selectedProjectId === "all"
              ? "Dashboard"
              : project?.name || "Dashboard"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {selectedProjectId === "all"
              ? "Overview of all your projects"
              : project
              ? `Detailed analytics for ${project.name}`
              : "Loading project details..."}
          </p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2 shrink-0">
              <LucidePlusCircle className="h-4 w-4" />
              <span>New Project</span>
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
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
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
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    {form.formState.isSubmitting
                      ? "Creating..."
                      : "Create Project"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {projectsLoading ? (
        <div className="space-y-6 w-full">
          <Skeleton className="h-10 w-full max-w-xs" />
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        </div>
      ) : (
        selectedProjectId && (
          <>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
              <Card className="overflow-hidden border-border/50 transition-all hover:shadow-md hover:border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
                  <CardTitle className="text-sm font-medium">
                    Daily Active Users
                  </CardTitle>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <LucideUsers className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {analyticsLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <div className="text-2xl font-bold">
                      {analytics?.dau || 0}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="overflow-hidden border-border/50 transition-all hover:shadow-md hover:border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
                  <CardTitle className="text-sm font-medium">
                    Monthly Active Users
                  </CardTitle>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <LucideUsers className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {analyticsLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <div className="text-2xl font-bold">
                      {analytics?.mau || 0}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="overflow-hidden border-border/50 transition-all hover:shadow-md hover:border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
                  <CardTitle className="text-sm font-medium">
                    Total Session Duration
                  </CardTitle>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <LucideClock className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {analyticsLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <div className="text-2xl font-bold">
                      {formatDuration(analytics?.total_duration || 0)}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="overflow-hidden border-border/50 transition-all hover:shadow-md hover:border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
                  <CardTitle className="text-sm font-medium">
                    Total Installs
                  </CardTitle>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <LucideDownload className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {analyticsLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <div className="text-2xl font-bold">
                      {analytics?.total_installs || 0}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {project && (
              <div className="mt-6 grid gap-4 md:grid-cols-2 w-full">
                <Card className="border-border/50 transition-all hover:shadow-md hover:border-border overflow-hidden">
                  <CardHeader className="bg-muted/30">
                    <CardTitle className="flex items-center gap-2">
                      <LucideSettings className="h-5 w-5 text-primary" />
                      Project Details
                    </CardTitle>
                    <CardDescription>
                      Information about your selected project
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-6">
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="font-medium text-muted-foreground">
                        Name
                      </span>
                      <span>{project.name}</span>
                    </div>
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="font-medium text-muted-foreground">
                        Created By
                      </span>
                      <span>{project.owner?.name || project.owner?.email}</span>
                    </div>
                    <div className="pt-4">
                      <span className="font-medium text-muted-foreground block mb-2">
                        API Key
                      </span>
                      <div className="flex overflow-hidden">
                        <ScrollArea className="max-w-full">
                          <code className="block rounded bg-muted p-3 text-sm">
                            {project.api_key}
                          </code>
                        </ScrollArea>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-5 bg-muted/20">
                    <Button
                      variant="outline"
                      onClick={goToEvents}
                      className="group flex items-center gap-2 transition-all"
                    >
                      <LucideActivity className="h-4 w-4 text-primary" />
                      Explore Events
                      <LucideChevronRight className="h-4 w-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    </Button>
                  </CardFooter>
                </Card>
                <Card className="border-border/50 transition-all hover:shadow-md hover:border-border overflow-hidden">
                  <CardHeader className="bg-muted/30">
                    <CardTitle className="flex items-center gap-2">
                      <LucideBarChart3 className="h-5 w-5 text-primary" />
                      Quick Tips
                    </CardTitle>
                    <CardDescription>
                      Getting started with Kogase
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="rounded-lg bg-muted/50 p-4 border border-border/50">
                      <div className="flex items-start gap-3">
                        <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                          <LucideCode className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            1. Integrate the SDK
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Use our Unity SDK to start tracking events in your
                            game.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-4 border border-border/50">
                      <div className="flex items-start gap-3">
                        <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                          <LucideActivity className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">2. Track Key Events</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Track game starts, level completions, and in-app
                            purchases.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-4 border border-border/50">
                      <div className="flex items-start gap-3">
                        <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                          <LucideBarChart3 className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            3. Analyze Your Data
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Use the dashboard to gain insights about player
                            behavior.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-5 bg-muted/20">
                    <Button className="w-full group" variant="outline">
                      <span className="flex items-center gap-2">
                        View Documentation
                        <LucideChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}
          </>
        )
      )}
    </div>
  );
}
