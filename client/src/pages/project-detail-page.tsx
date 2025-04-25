import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BidForm } from "@/components/forms/bid-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Calendar, DollarSign, Clock, MapPin, CheckCircle2, Info } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

const categoryColorMap: Record<string, string> = {
  construction: "bg-blue-100 text-blue-800",
  electrical: "bg-yellow-100 text-yellow-800",
  painting: "bg-purple-100 text-purple-800",
  plumbing: "bg-green-100 text-green-800",
  labour: "bg-orange-100 text-orange-800",
  transportation: "bg-red-100 text-red-800",
  other: "bg-gray-100 text-gray-800"
};

const statusColorMap: Record<string, string> = {
  open: "bg-green-100 text-green-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-purple-100 text-purple-800",
  cancelled: "bg-red-100 text-red-800"
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  
  // Fetch project data
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: [`/api/projects/${id}`],
  });
  
  // Fetch bids for the project
  const { data: bids, isLoading: bidsLoading } = useQuery({
    queryKey: [`/api/projects/${id}/bids`],
    enabled: !!project,
  });
  
  // Mutation for updating bid status
  const updateBidStatus = useMutation({
    mutationFn: async ({ bidId, status }: { bidId: number, status: string }) => {
      const res = await apiRequest("PATCH", `/api/bids/${bidId}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}/bids`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
    },
  });
  
  const handleAcceptBid = (bidId: number) => {
    updateBidStatus.mutate({ bidId, status: "accepted" });
  };
  
  const handleRejectBid = (bidId: number) => {
    updateBidStatus.mutate({ bidId, status: "rejected" });
  };
  
  if (projectLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Project Not Found</h1>
            <p className="text-slate-600 mb-4">The project you're looking for doesn't exist or has been removed.</p>
            <Link href="/projects">
              <Button>Browse Projects</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  const categoryClass = categoryColorMap[project.category] || "bg-gray-100 text-gray-800";
  const statusClass = statusColorMap[project.status] || "bg-gray-100 text-gray-800";
  const postedDate = project.createdAt ? formatDistanceToNow(new Date(project.createdAt), { addSuffix: true }) : 'Recently';
  
  const isOwner = user && user.id === project.companyId;
  const isContractor = user && user.role === "contractor";
  const canBid = isContractor && project.status === "open";
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-slate-50 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Project Details */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <CardTitle className="text-2xl">{project.title}</CardTitle>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge className={categoryClass}>{project.category}</Badge>
                        <Badge className={statusClass}>{project.status.replace('_', ' ')}</Badge>
                        <div className="flex items-center text-sm text-slate-500">
                          <MapPin className="h-4 w-4 mr-1" />
                          {project.location}
                        </div>
                      </div>
                    </div>
                    {canBid && (
                      <div className="mt-4 md:mt-0">
                        <Button onClick={() => setBidDialogOpen(true)}>
                          Submit a Bid
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex flex-col">
                      <span className="text-sm text-slate-500">Budget</span>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-slate-500" />
                        <span className="font-semibold">
                          ${Number(project.budgetMin).toLocaleString()} 
                          {project.budgetMin !== project.budgetMax && ` - $${Number(project.budgetMax).toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-slate-500">Duration</span>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-slate-500" />
                        <span className="font-semibold">{project.duration}</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-slate-500">Posted</span>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-slate-500" />
                        <span className="font-semibold">{postedDate}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Project Description</h3>
                    <p className="text-slate-600 whitespace-pre-line">{project.description}</p>
                  </div>
                  
                  {project.requirements && project.requirements.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {project.requirements.map((req: any, index: number) => (
                          <li key={index} className="text-slate-600">
                            {req.requirement}
                            {req.isRequired && <span className="text-red-500 ml-1">*</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Bids Section - Only visible to the project owner */}
              {isOwner && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Bids</CardTitle>
                    <CardDescription>
                      {bids && Array.isArray(bids) 
                        ? `${bids.length} contractors have submitted bids for this project` 
                        : "View and manage bids for your project"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {bidsLoading ? (
                      <div className="flex justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                      </div>
                    ) : bids && Array.isArray(bids) && bids.length > 0 ? (
                      <div className="space-y-4">
                        {bids.map((bid: any) => (
                          <div key={bid.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center">
                                  <h4 className="font-semibold">{bid.contractor?.username || "Contractor"}</h4>
                                  {bid.status === "accepted" && (
                                    <Badge className="ml-2 bg-green-100 text-green-800">Accepted</Badge>
                                  )}
                                  {bid.status === "rejected" && (
                                    <Badge className="ml-2 bg-red-100 text-red-800">Rejected</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-slate-500">
                                  Bid Amount: ${Number(bid.amount).toLocaleString()}
                                </p>
                                <p className="text-sm text-slate-500">
                                  Delivery Time: {bid.deliveryTime}
                                </p>
                              </div>
                              {bid.status === "pending" && (
                                <div className="flex space-x-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-green-600 hover:bg-green-50" 
                                    onClick={() => handleAcceptBid(bid.id)}
                                    disabled={updateBidStatus.isPending}
                                  >
                                    Accept
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-red-600 hover:bg-red-50" 
                                    onClick={() => handleRejectBid(bid.id)}
                                    disabled={updateBidStatus.isPending}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                            <Separator className="my-3" />
                            <p className="text-slate-600">{bid.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Info className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-600">No bids have been submitted yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {/* Bid Summary - Only visible to contractors */}
              {!isOwner && bids && !Array.isArray(bids) && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Bid Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-sm text-slate-500">Total Bids</p>
                        <p className="text-2xl font-bold">{bids.count || 0}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-sm text-slate-500">Average Bid</p>
                        <p className="text-2xl font-bold">${Number(bids.averageBid || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Company Information */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>About the Company</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                      <img 
                        src="https://randomuser.me/api/portraits/men/32.jpg" 
                        alt="Company logo" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {project.company?.name || "Company Name"}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {project.company?.location || "Location not specified"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Verified Company</p>
                        <p className="text-sm text-slate-600">This company has been verified by our team.</p>
                      </div>
                    </div>
                    {project.company?.website && (
                      <div className="flex items-start">
                        <div className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5">🌐</div>
                        <div>
                          <p className="font-medium">Website</p>
                          <a 
                            href={project.company.website} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-sm text-sky-600 hover:underline"
                          >
                            {project.company.website}
                          </a>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start">
                      <div className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5">📊</div>
                      <div>
                        <p className="font-medium">Projects Posted</p>
                        <p className="text-sm text-slate-600">
                          {project.company?.projectCount || "Multiple"} projects
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {canBid && (
                    <Button 
                      className="w-full mt-6" 
                      onClick={() => setBidDialogOpen(true)}
                    >
                      Bid on this Project
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      {/* Bid Dialog */}
      <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Submit a Bid</DialogTitle>
            <DialogDescription>
              Provide your proposal and bid amount for this project.
            </DialogDescription>
          </DialogHeader>
          <BidForm 
            projectId={parseInt(id)} 
            onBidSubmitted={() => setBidDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}
