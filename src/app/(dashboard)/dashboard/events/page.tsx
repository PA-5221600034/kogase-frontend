"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import {
  LucideActivity,
  Filter,
  RefreshCw,
  XCircle,
  CalendarIcon,
  ChevronDown,
  Info
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { useEvents, useProjects } from "@/lib/hooks";
import { GetEventsRequestQuery, GetEventResponse } from "@/lib/dtos";
import { GetProjectResponseDetail } from "@/lib/dtos/project_dto";

export default function EventsPage() {
  const searchParams = useSearchParams();
  const projectIdParam = searchParams.get('projectId');
  
  const { getEvents, loading: eventsLoading } = useEvents();
  const { getProject, loading: projectLoading } = useProjects();
  
  const [events, setEvents] = useState<GetEventResponse[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<GetProjectResponseDetail | null>(null);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<Partial<GetEventsRequestQuery>>({
    limit: 10,
    offset: 0,
  });
  
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [eventType, setEventType] = useState<string>("");
  const [eventName, setEventName] = useState<string>("");
  
  // Refs to track loading states
  const isLoadingProject = useRef(false);
  const isLoadingEvents = useRef(false);
  const initialized = useRef(false);

  // Handle initial load and project param
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    // Check for projectId in URL params
    if (projectIdParam && projectIdParam !== 'all') {
      setSelectedProjectId(projectIdParam);
      setFilters(prev => ({ ...prev, project_id: projectIdParam }));
      loadProject(projectIdParam);
    } else {
      // If no project in URL, check localStorage
      const savedProject = localStorage.getItem('selected-project-id');
      if (savedProject && savedProject !== 'all') {
        setSelectedProjectId(savedProject);
        setFilters(prev => ({ ...prev, project_id: savedProject }));
        loadProject(savedProject);
      }
    }
    
    // Listen for project changes from the project selector
    const handleProjectChange = (e: CustomEvent<string>) => {
      const projectId = e.detail;
      setSelectedProjectId(projectId);
      
      if (projectId && projectId !== 'all') {
        setFilters(prev => ({ ...prev, project_id: projectId }));
        loadProject(projectId);
      } else {
        setFilters(prev => {
          const newFilters = { ...prev };
          delete newFilters.project_id;
          return newFilters;
        });
        setCurrentProject(null);
      }
    };

    window.addEventListener('projectChanged', handleProjectChange as EventListener);
    
    return () => {
      window.removeEventListener('projectChanged', handleProjectChange as EventListener);
    };
  }, [projectIdParam]);

  // Load events when filters or page changes
  useEffect(() => {
    loadEvents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, currentPage]);

  async function loadProject(projectId: string) {
    if (isLoadingProject.current) return;
    
    // Skip invalid project ids
    if (!projectId || projectId === 'all') {
      setCurrentProject(null);
      return;
    }
    
    // Set loading flag
    isLoadingProject.current = true;
    
    try {
      const project = await getProject(projectId);
      setCurrentProject(project);
    } catch (error) {
      console.error('Error fetching project details:', error);
      setCurrentProject(null);
    } finally {
      // Clear loading flag
      isLoadingProject.current = false;
    }
  }
  
  async function loadEvents() {
    if (isLoadingEvents.current) return;
    
    isLoadingEvents.current = true;
    
    try {
      const result = await getEvents({
        ...filters,
        offset: (currentPage - 1) * (filters.limit || 10),
      } as GetEventsRequestQuery);
      
      setEvents(result.events);
      setTotalEvents(result.total);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      isLoadingEvents.current = false;
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (key: keyof GetEventsRequestQuery, value: string | number | null) => {
    if (value === null || value === "") {
      setFilters(prev => {
        const newFilters = { ...prev };
        delete newFilters[key];
        return newFilters;
      });
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    // Apply date filters
    if (fromDate) {
      handleFilterChange("from_date", fromDate.toISOString());
    }
    
    if (toDate) {
      handleFilterChange("to_date", toDate.toISOString());
    }
    
    // Apply event type and name filters
    if (eventType) {
      handleFilterChange("event_type", eventType);
    }
    
    if (eventName) {
      handleFilterChange("event_name", eventName);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      limit: 10,
      offset: 0,
    });
    
    if (selectedProjectId && selectedProjectId !== 'all') {
      setFilters(prev => ({ ...prev, project_id: selectedProjectId }));
    }
    
    setFromDate(undefined);
    setToDate(undefined);
    setEventType("");
    setEventName("");
    setCurrentPage(1);
  };

  const toggleExpandEvent = (eventId: string) => {
    if (expandedEventId === eventId) {
      setExpandedEventId(null);
    } else {
      setExpandedEventId(eventId);
    }
  };

  const totalPages = Math.ceil(totalEvents / (filters.limit || 10));
  const isLoading = eventsLoading || projectLoading;

  // Filter options for event types
  const eventTypeOptions = ["session_start", "session_end", "custom", "app_install"];

  const FilterSheet = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden flex gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Filter Events</SheetTitle>
          <SheetDescription>
            Apply filters to narrow down your event results
          </SheetDescription>
        </SheetHeader>
        <div className="py-6 space-y-6">
          {/* Date range filters */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Date Range</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">From Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fromDate ? format(fromDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={fromDate}
                      onSelect={setFromDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">To Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {toDate ? format(toDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={toDate}
                      onSelect={setToDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          
          {/* Event type filter */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Event Type</h3>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {eventTypeOptions.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Event name filter */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Event Name</h3>
            <input
              type="text"
              placeholder="Filter by event name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          
          <div className="flex justify-between space-x-2">
            <Button variant="outline" onClick={handleClearFilters} className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Clear
            </Button>
            <Button onClick={handleApplyFilters} className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Apply Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="space-y-6 w-full max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {selectedProjectId === 'all' ? 'Events' : currentProject?.name ? `${currentProject.name} - Events` : 'Events'}
          </h1>
          <p className="text-muted-foreground mt-1">View and analyze event data from your application</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <FilterSheet />
          <Button variant="outline" size="sm" onClick={loadEvents} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden md:inline">Refresh</span>
          </Button>
        </div>
      </div>

      <Card className="hidden lg:block w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>
            Narrow down events by applying filters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
            <div>
              <label className="text-sm font-medium mb-1 block">From Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={setFromDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">To Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={setToDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Event Type</label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="empty">All Types</SelectItem>
                  {eventTypeOptions.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Event Name</label>
              <input
                type="text"
                placeholder="Filter by event name"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full h-10 px-3 py-2 border rounded-md"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={handleClearFilters} className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Clear
            </Button>
            <Button onClick={handleApplyFilters} className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader className="md:flex-row md:items-center md:justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <LucideActivity className="h-5 w-5" />
              Events List
            </CardTitle>
            <CardDescription className="mt-1.5">
              {totalEvents} total events found
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <label className="text-sm whitespace-nowrap">Show:</label>
            <Select 
              value={String(filters.limit || 10)} 
              onValueChange={(value) => handleFilterChange("limit", parseInt(value))}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3 w-full">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 w-full">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-background/50 w-full">
              <LucideActivity className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No events found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try adjusting your filters or check if your application is sending events.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-hidden w-full">
                <ScrollArea className="max-h-[600px] md:max-h-none w-full">
                  <Table>
                    <TableHeader className="bg-muted/50 sticky top-0">
                      <TableRow>
                        <TableHead className="w-[180px]">Event ID</TableHead>
                        <TableHead className="w-[140px]">Type</TableHead>
                        <TableHead className="w-[180px]">Name</TableHead>
                        <TableHead className="hidden md:table-cell">Timestamp</TableHead>
                        <TableHead className="w-[100px] text-right">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.map((event) => (
                        <React.Fragment key={event.event_id}>
                          <TableRow className="hover:bg-muted/50">
                            <TableCell className="font-mono text-xs sm:text-sm">
                              {event.event_id.substring(0, 10)}...
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                event.event_type === 'session_start' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                event.event_type === 'session_end' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                event.event_type === 'app_install' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }`}>
                                {event.event_type}
                              </span>
                            </TableCell>
                            <TableCell>
                              {event.event_name}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {format(new Date(event.timestamp), "PPp")}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => toggleExpandEvent(event.event_id)}
                                className="h-8 w-8 p-0"
                              >
                                <ChevronDown className={`h-4 w-4 transition-transform ${
                                  expandedEventId === event.event_id ? "rotate-180" : ""
                                }`} />
                              </Button>
                            </TableCell>
                          </TableRow>
                          {expandedEventId === event.event_id && (
                            <TableRow className="bg-muted/30">
                              <TableCell colSpan={5} className="p-0">
                                <div className="px-4 py-3">
                                  <div className="mb-2 flex items-center gap-2">
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                    <h4 className="font-medium">Event Details</h4>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    <div>
                                      <p className="text-muted-foreground mb-1">Full Event ID:</p>
                                      <p className="font-mono bg-muted p-2 rounded">{event.event_id}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground mb-1">Received At:</p>
                                      <p>{format(new Date(event.received_at), "PPp")}</p>
                                    </div>
                                  </div>
                                  <div className="mt-3">
                                    <p className="text-muted-foreground mb-1">Payload:</p>
                                    <pre className="bg-muted p-3 rounded overflow-auto max-h-40 text-xs">
                                      {JSON.stringify(event.payloads, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>

              <div className="mt-4 flex items-center justify-center w-full">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                        className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
                      />
                    </PaginationItem>
                    
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageToShow;
                      if (totalPages <= 5) {
                        pageToShow = i + 1;
                      } else if (currentPage <= 3) {
                        pageToShow = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageToShow = totalPages - 4 + i;
                      } else {
                        pageToShow = currentPage - 2 + i;
                      }
                      
                      if (pageToShow <= totalPages) {
                        return (
                          <PaginationItem key={pageToShow} className="hidden sm:inline-block">
                            <PaginationLink
                              isActive={currentPage === pageToShow}
                              onClick={() => handlePageChange(pageToShow)}
                            >
                              {pageToShow}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                        className={cn(currentPage === totalPages && "pointer-events-none opacity-50")}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
              <div className="text-center text-sm text-muted-foreground mt-2 w-full">
                Page {currentPage} of {totalPages}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 