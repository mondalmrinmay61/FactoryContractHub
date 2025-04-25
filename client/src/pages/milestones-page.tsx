import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Calendar,
  CalendarIcon,
  CheckCircle,
  CircleDollarSign,
  Clock,
  Download,
  FileText,
  Link as LinkIcon,
  Loader2,
  Plus,
  RefreshCw,
  Upload,
} from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

// Milestone form schema
const milestoneSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  amount: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    { message: "Amount must be a positive number" }
  ),
  dueDate: z.date().optional(),
  order: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) >= 0,
    { message: "Order must be a non-negative number" }
  ),
});

// Milestone status update schema
const statusUpdateSchema = z.object({
  notes: z.string().optional(),
  deliverableUrl: z.string().url("Must provide a valid URL").optional(),
});

export default function MilestonesPage() {
  const { id: contractId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
  const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  
  // Fetch contract details
  const { data: contract, isLoading: contractLoading } = useQuery({
    queryKey: [`/api/contracts/${contractId}`],
    enabled: !!contractId && !!user,
  });
  
  // Fetch milestones
  const { data: milestones, isLoading: milestonesLoading } = useQuery({
    queryKey: [`/api/contracts/${contractId}/milestones`],
    enabled: !!contractId && !!user,
  });
  
  // Add milestone form
  const form = useForm<z.infer<typeof milestoneSchema>>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: "",
      order: "0",
    },
  });
  
  // Status update form
  const statusForm = useForm<z.infer<typeof statusUpdateSchema>>({
    resolver: zodResolver(statusUpdateSchema),
    defaultValues: {
      notes: "",
      deliverableUrl: "",
    },
  });
  
  // Add milestone mutation
  const addMilestoneMutation = useMutation({
    mutationFn: async (data: z.infer<typeof milestoneSchema>) => {
      const res = await apiRequest("POST", `/api/contracts/${contractId}/milestones`, {
        title: data.title,
        description: data.description,
        amount: Number(data.amount),
        dueDate: data.dueDate,
        order: Number(data.order),
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Milestone added",
        description: "The milestone has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/contracts/${contractId}/milestones`] });
      setIsAddMilestoneOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add milestone",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update milestone status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (data: { id: number; status: string; notes?: string; deliverableUrl?: string }) => {
      const res = await apiRequest("PATCH", `/api/milestones/${data.id}/status`, {
        status: data.status,
        notes: data.notes,
        deliverableUrl: data.deliverableUrl,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Status updated",
        description: "The milestone status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/contracts/${contractId}/milestones`] });
      setIsStatusUpdateOpen(false);
      statusForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update status",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Calculate progress
  const calculateProgress = () => {
    if (!Array.isArray(milestones) || milestones.length === 0) return 0;
    
    const completedMilestones = milestones.filter(
      (m: any) => m.status === "completed" || m.status === "verified" || m.status === "paid"
    ).length;
    
    return (completedMilestones / milestones.length) * 100;
  };
  
  // Get total contract amount
  const getTotalAmount = () => {
    if (!Array.isArray(milestones) || milestones.length === 0) return 0;
    
    return milestones.reduce((total: number, milestone: any) => {
      return total + Number(milestone.amount);
    }, 0);
  };
  
  // Get paid amount
  const getPaidAmount = () => {
    if (!Array.isArray(milestones) || milestones.length === 0) return 0;
    
    return milestones
      .filter((m: any) => m.status === "paid")
      .reduce((total: number, milestone: any) => {
        return total + Number(milestone.amount);
      }, 0);
  };
  
  // Format milestone status
  const formatStatus = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-slate-100">Pending</Badge>;
      case "completed":
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">Completed</Badge>;
      case "verified":
        return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200">Verified</Badge>;
      case "paid":
        return <Badge variant="success">Paid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Check if user can update milestone status
  const canUpdateStatus = (milestone: any) => {
    if (!user) return false;
    
    // Contractor can mark as completed if pending
    if (user.role === "contractor" && milestone.status === "pending") {
      return true;
    }
    
    // Company can mark as verified if completed
    if (user.role === "company" && milestone.status === "completed") {
      return true;
    }
    
    // Company can mark as paid if verified
    if (user.role === "company" && milestone.status === "verified") {
      return true;
    }
    
    // Admin can update any status
    if (user.role === "admin") {
      return true;
    }
    
    return false;
  };
  
  // Get next status based on current status and user role
  const getNextStatus = (currentStatus: string) => {
    if (!user) return null;
    
    if (user.role === "contractor" && currentStatus === "pending") {
      return "completed";
    }
    
    if (user.role === "company" && currentStatus === "completed") {
      return "verified";
    }
    
    if (user.role === "company" && currentStatus === "verified") {
      return "paid";
    }
    
    if (user.role === "admin") {
      switch (currentStatus) {
        case "pending": return "completed";
        case "completed": return "verified";
        case "verified": return "paid";
        default: return null;
      }
    }
    
    return null;
  };
  
  // Handle status update button click
  const handleStatusUpdate = (milestone: any) => {
    setSelectedMilestone(milestone);
    statusForm.reset({
      notes: "",
      deliverableUrl: "",
    });
    setIsStatusUpdateOpen(true);
  };
  
  // Submit status update
  const onStatusUpdateSubmit = (data: z.infer<typeof statusUpdateSchema>) => {
    if (!selectedMilestone) return;
    
    const nextStatus = getNextStatus(selectedMilestone.status);
    if (!nextStatus) return;
    
    updateStatusMutation.mutate({
      id: selectedMilestone.id,
      status: nextStatus,
      notes: data.notes,
      deliverableUrl: data.deliverableUrl,
    });
  };
  
  // Submit add milestone form
  const onSubmit = (data: z.infer<typeof milestoneSchema>) => {
    addMilestoneMutation.mutate(data);
  };
  
  // Loading state
  const isLoading = contractLoading || milestonesLoading;
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-brand" />
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!contract) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Contract Not Found</h1>
            <p className="text-gray-600 mb-4">The contract you're looking for doesn't exist or you don't have permission to view it.</p>
            <Link href="/dashboard">
              <Button className="bg-brand hover:bg-brand-700">Go to Dashboard</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 py-10 px-4 md:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link href={`/projects/${contract.project?.id}`}>
                  <span className="text-brand hover:text-brand-700">{contract.project?.title}</span>
                </Link>
                <span className="text-gray-400">/</span>
                <span className="text-gray-600">Contract #{contract.id}</span>
              </div>
              <h1 className="text-3xl font-bold text-emerald-900">Milestones</h1>
              <p className="text-gray-600">Manage and track project milestones and payments</p>
            </div>
            
            <div className="flex space-x-3">
              {(user?.role === "company" || user?.role === "admin") && (
                <Button 
                  className="bg-brand hover:bg-brand-700"
                  onClick={() => setIsAddMilestoneOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Milestone
                </Button>
              )}
            </div>
          </div>
          
          {/* Contract Overview Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Contract Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Project</h3>
                  <p className="text-lg font-semibold text-emerald-900">{contract.project?.title}</p>
                  <div className="flex items-center mt-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-600">
                      {new Date(contract.startDate).toLocaleDateString()}
                      {contract.endDate && ` - ${new Date(contract.endDate).toLocaleDateString()}`}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Parties</h3>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <span className="text-xs text-gray-500">Company</span>
                      <p className="font-medium">{contract.project?.company?.username}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Contractor</span>
                      <p className="font-medium">{contract.bid?.contractor?.username}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Financial</h3>
                  <div className="mt-1">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Amount</span>
                      <span className="font-semibold">${getTotalAmount().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span className="text-sm">Paid Amount</span>
                      <span className="font-semibold">${getPaidAmount().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-amber-600">
                      <span className="text-sm">Remaining</span>
                      <span className="font-semibold">${(getTotalAmount() - getPaidAmount()).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-emerald-700">Project Progress</span>
                  <span className="text-sm font-medium text-emerald-800">{Math.round(calculateProgress())}%</span>
                </div>
                <Progress value={calculateProgress()} className="bg-emerald-100 h-2.5">
                  <div className="bg-brand h-2.5 rounded-full"></div>
                </Progress>
              </div>
            </CardContent>
          </Card>
          
          {/* Milestones */}
          <Tabs defaultValue="milestones" className="mb-6">
            <TabsList className="mb-4">
              <TabsTrigger value="milestones">
                <Clock className="mr-2 h-4 w-4" />
                Milestones
              </TabsTrigger>
              <TabsTrigger value="timeline">
                <Calendar className="mr-2 h-4 w-4" />
                Timeline
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="milestones">
              <Card>
                <CardHeader>
                  <CardTitle>Project Milestones</CardTitle>
                  <CardDescription>
                    View and manage all payment milestones for this contract
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {Array.isArray(milestones) && milestones.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {milestones.map((milestone: any) => (
                          <TableRow key={milestone.id}>
                            <TableCell>{milestone.order || 0}</TableCell>
                            <TableCell className="font-medium">{milestone.title}</TableCell>
                            <TableCell className="max-w-xs">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="line-clamp-1">{milestone.description}</span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">{milestone.description}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                            <TableCell>${Number(milestone.amount).toLocaleString()}</TableCell>
                            <TableCell>
                              {milestone.dueDate 
                                ? new Date(milestone.dueDate).toLocaleDateString() 
                                : "-"}
                            </TableCell>
                            <TableCell>{formatStatus(milestone.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {canUpdateStatus(milestone) && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                    onClick={() => handleStatusUpdate(milestone)}
                                  >
                                    <RefreshCw className="h-4 w-4 mr-1" />
                                    Update Status
                                  </Button>
                                )}
                                
                                {milestone.deliverableUrl && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => window.open(milestone.deliverableUrl, "_blank")}
                                        >
                                          <Download className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>View deliverable</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12">
                      <Clock className="h-12 w-12 text-emerald-200 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No Milestones Found</h3>
                      <p className="text-gray-500 mb-4">
                        This contract doesn't have any milestones yet.
                      </p>
                      {(user?.role === "company" || user?.role === "admin") && (
                        <Button 
                          className="bg-brand hover:bg-brand-700"
                          onClick={() => setIsAddMilestoneOpen(true)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add First Milestone
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle>Milestone Timeline</CardTitle>
                  <CardDescription>
                    Timeline view of project milestones and their status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {Array.isArray(milestones) && milestones.length > 0 ? (
                    <div className="relative border-l-2 border-emerald-100 ml-3 pl-8 py-4 space-y-10">
                      {milestones
                        .sort((a: any, b: any) => a.order - b.order)
                        .map((milestone: any, index: number) => (
                          <div key={milestone.id} className="relative">
                            {/* Timeline dot */}
                            <div className={cn(
                              "absolute -left-[41px] w-6 h-6 rounded-full flex items-center justify-center",
                              milestone.status === "pending" && "bg-gray-100 border-2 border-gray-300",
                              milestone.status === "completed" && "bg-amber-100 border-2 border-amber-300",
                              milestone.status === "verified" && "bg-emerald-100 border-2 border-emerald-300",
                              milestone.status === "paid" && "bg-brand"
                            )}>
                              {milestone.status === "paid" && (
                                <CheckCircle className="h-4 w-4 text-white" />
                              )}
                              {milestone.status !== "paid" && (
                                <span className="text-xs font-semibold">{index + 1}</span>
                              )}
                            </div>
                            
                            <div className="mb-1 flex items-center">
                              <h3 className="text-lg font-semibold text-emerald-900">{milestone.title}</h3>
                              <div className="ml-3">{formatStatus(milestone.status)}</div>
                            </div>
                            
                            <p className="text-gray-600 mb-2">{milestone.description}</p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center text-sm text-gray-500 mb-1">
                                  <CircleDollarSign className="h-4 w-4 mr-1 text-emerald-500" />
                                  <span>Amount</span>
                                </div>
                                <p className="font-semibold">${Number(milestone.amount).toLocaleString()}</p>
                              </div>
                              
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center text-sm text-gray-500 mb-1">
                                  <Calendar className="h-4 w-4 mr-1 text-emerald-500" />
                                  <span>Due Date</span>
                                </div>
                                <p className="font-semibold">
                                  {milestone.dueDate 
                                    ? new Date(milestone.dueDate).toLocaleDateString() 
                                    : "Not specified"}
                                </p>
                              </div>
                              
                              {milestone.deliverableUrl && (
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <div className="flex items-center text-sm text-gray-500 mb-1">
                                    <FileText className="h-4 w-4 mr-1 text-emerald-500" />
                                    <span>Deliverable</span>
                                  </div>
                                  <a 
                                    href={milestone.deliverableUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center text-brand hover:text-brand-700 font-medium"
                                  >
                                    <LinkIcon className="h-4 w-4 mr-1" />
                                    <span>View Deliverable</span>
                                  </a>
                                </div>
                              )}
                            </div>
                            
                            {/* Display status notes if available */}
                            {milestone.notes && (
                              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-sm text-amber-800">{milestone.notes}</p>
                              </div>
                            )}
                            
                            {/* Display date information if available */}
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-500">
                              {milestone.completionDate && (
                                <div>
                                  <span className="font-medium">Completed:</span> {new Date(milestone.completionDate).toLocaleDateString()}
                                </div>
                              )}
                              {milestone.verificationDate && (
                                <div>
                                  <span className="font-medium">Verified:</span> {new Date(milestone.verificationDate).toLocaleDateString()}
                                </div>
                              )}
                              {milestone.paymentDate && (
                                <div>
                                  <span className="font-medium">Paid:</span> {new Date(milestone.paymentDate).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 text-emerald-200 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No Timeline Available</h3>
                      <p className="text-gray-500 mb-4">
                        Add milestones to see the project timeline.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Add Milestone Dialog */}
      <Dialog open={isAddMilestoneOpen} onOpenChange={setIsAddMilestoneOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Milestone</DialogTitle>
            <DialogDescription>
              Create a new payment milestone for this contract.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Initial Design" {...field} />
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
                      <Textarea
                        placeholder="Describe the deliverables for this milestone"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount ($)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="1" {...field} />
                      </FormControl>
                      <FormDescription>
                        Sequence number (0, 1, 2...)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Optional. When this milestone is due.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddMilestoneOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-brand hover:bg-brand-700"
                  disabled={addMilestoneMutation.isPending}
                >
                  {addMilestoneMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Milestone
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Status Update Dialog */}
      <Dialog open={isStatusUpdateOpen} onOpenChange={setIsStatusUpdateOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Update Milestone Status</DialogTitle>
            <DialogDescription>
              {selectedMilestone && (
                <>
                  Change status from <strong>{selectedMilestone.status}</strong> to{" "}
                  <strong>
                    {getNextStatus(selectedMilestone.status)}
                  </strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...statusForm}>
            <form onSubmit={statusForm.handleSubmit(onStatusUpdateSubmit)} className="space-y-4">
              {user?.role === "contractor" && selectedMilestone?.status === "pending" && (
                <FormField
                  control={statusForm.control}
                  name="deliverableUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deliverable URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/deliverable"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Link to the deliverable files or documentation
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={statusForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any notes or comments about this status update"
                        className="min-h-[80px]"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsStatusUpdateOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-brand hover:bg-brand-700"
                  disabled={updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Status
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}