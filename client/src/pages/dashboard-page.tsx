import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ProjectForm } from "@/components/forms/project-form";
import { ProjectCard } from "@/components/ui/card-project";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Building, Briefcase, PlusCircle, FileText, Settings, User, Bell, MessageSquare, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  
  // Fetch user's projects or bids based on their role
  const { data: userProjects, isLoading: projectsLoading } = useQuery({
    queryKey: [`/api/${user?.role === 'company' ? 'companies' : 'contractors'}/${user?.id}/${user?.role === 'company' ? 'projects' : 'bids'}`],
    enabled: !!user,
  });
  
  // Calculate dashboard stats based on the role
  const stats = {
    company: [
      { label: "Active Projects", value: Array.isArray(userProjects) ? userProjects.filter((p: any) => p.status === "open" || p.status === "in_progress").length : 0 },
      { label: "Completed Projects", value: Array.isArray(userProjects) ? userProjects.filter((p: any) => p.status === "completed").length : 0 },
      { label: "Open Bids", value: Array.isArray(userProjects) ? userProjects.reduce((acc: number, project: any) => acc + (project.bidCount || 0), 0) : 0 },
    ],
    contractor: [
      { label: "Active Bids", value: Array.isArray(userProjects) ? userProjects.filter((b: any) => b.status === "pending").length : 0 },
      { label: "Won Contracts", value: Array.isArray(userProjects) ? userProjects.filter((b: any) => b.status === "accepted").length : 0 },
      { label: "Completed Jobs", value: Array.isArray(userProjects) ? userProjects.filter((b: any) => b.project?.status === "completed").length : 0 },
    ],
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Please Log In</h1>
            <p className="text-slate-600 mb-4">You need to be logged in to access your dashboard.</p>
            <Link href="/auth">
              <Button>Go to Login</Button>
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
      
      <div className="flex-grow flex">
        {/* Dashboard Sidebar */}
        <aside className="hidden md:block w-64 bg-emerald-900 text-white border-r border-emerald-800 min-h-screen">
        <div className="sticky top-0">
          <div className="p-4">
            <div className="flex items-center mb-8">
              <div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center text-white mr-3">
                {user.role === "company" ? <Building className="h-5 w-5" /> : <User className="h-5 w-5" />}
              </div>
              <div>
                <p className="font-semibold">{user.username}</p>
                <p className="text-xs text-emerald-300 capitalize">{user.role}</p>
              </div>
            </div>
            
            <nav className="space-y-1">
              <Link href="/dashboard" className="flex items-center px-3 py-2 text-white rounded-md bg-emerald-800 font-medium">
                <Briefcase className="mr-3 h-5 w-5 text-emerald-300" />
                Dashboard
              </Link>
              {user.role === "company" ? (
                <>
                  <Link href="/dashboard/projects" className="flex items-center px-3 py-2 text-emerald-100 rounded-md hover:bg-emerald-800/60">
                    <FileText className="mr-3 h-5 w-5 text-emerald-300" />
                    My Projects
                  </Link>
                  <button 
                    className="w-full flex items-center px-3 py-2 text-emerald-100 rounded-md hover:bg-emerald-800/60"
                    onClick={() => setNewProjectDialogOpen(true)}
                  >
                    <PlusCircle className="mr-3 h-5 w-5 text-emerald-300" />
                    Post New Project
                  </button>
                </>
              ) : (
                <>
                  <Link href="/dashboard/bids" className="flex items-center px-3 py-2 text-emerald-100 rounded-md hover:bg-emerald-800/60">
                    <FileText className="mr-3 h-5 w-5 text-emerald-300" />
                    My Bids
                  </Link>
                  <Link href="/projects" className="flex items-center px-3 py-2 text-emerald-100 rounded-md hover:bg-emerald-800/60">
                    <PlusCircle className="mr-3 h-5 w-5 text-emerald-300" />
                    Find Projects
                  </Link>
                </>
              )}
              <Link href="/dashboard/messages" className="flex items-center px-3 py-2 text-emerald-100 rounded-md hover:bg-emerald-800/60">
                <MessageSquare className="mr-3 h-5 w-5 text-emerald-300" />
                Messages
              </Link>
              <Link href="/dashboard/notifications" className="flex items-center px-3 py-2 text-emerald-100 rounded-md hover:bg-emerald-800/60">
                <Bell className="mr-3 h-5 w-5 text-emerald-300" />
                Notifications
              </Link>
              <Link href="/profile" className="flex items-center px-3 py-2 text-emerald-100 rounded-md hover:bg-emerald-800/60">
                <Settings className="mr-3 h-5 w-5 text-emerald-300" />
                Settings
              </Link>
            </nav>
          </div>
        </aside>
        
        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto bg-gray-50">
          <div className="container mx-auto p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold heading-gradient">Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user.username}</p>
              </div>
              
              {user.role === "company" && (
                <Button 
                  className="mt-4 md:mt-0 bg-brand hover:bg-brand-700"
                  onClick={() => setNewProjectDialogOpen(true)}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Post New Project
                </Button>
              )}
              
              {user.role === "contractor" && (
                <Link href="/projects">
                  <Button className="mt-4 md:mt-0 bg-brand hover:bg-brand-700">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Find Projects
                  </Button>
                </Link>
              )}
            </div>
            
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {(user.role === "company" ? stats.company : stats.contractor).map((stat, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-emerald-800">{stat.value}</div>
                    <p className="text-sm text-emerald-600">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Dashboard Tabs */}
            <Tabs defaultValue={user.role === "company" ? "projects" : "bids"} className="mb-6">
              <TabsList>
                <TabsTrigger value={user.role === "company" ? "projects" : "bids"}>
                  {user.role === "company" ? "Recent Projects" : "Recent Bids"}
                </TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>
              
              <TabsContent value={user.role === "company" ? "projects" : "bids"} className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{user.role === "company" ? "Your Projects" : "Your Bids"}</CardTitle>
                    <CardDescription>
                      {user.role === "company" 
                        ? "Projects you've posted recently" 
                        : "Bids you've submitted on recent projects"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {projectsLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                      </div>
                    ) : userProjects && Array.isArray(userProjects) && userProjects.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {(userProjects as any[]).slice(0, 3).map((item: any) => (
                          <div key={item.id} className="border rounded-lg p-4">
                            {user.role === "company" ? (
                              <div>
                                <h3 className="font-semibold">{item.title}</h3>
                                <div className="flex justify-between mt-2">
                                  <span className="text-sm text-emerald-600">Status: {item.status.replace('_', ' ')}</span>
                                  <span className="text-sm text-emerald-600">Bids: {item.bidCount || 0}</span>
                                </div>
                                <Link href={`/projects/${item.id}`}>
                                  <Button variant="link" className="p-0 mt-2 text-brand hover:text-brand-700">View Project</Button>
                                </Link>
                              </div>
                            ) : (
                              <div>
                                <h3 className="font-semibold">{item.project?.title || "Project"}</h3>
                                <div className="flex justify-between mt-2">
                                  <span className="text-sm text-emerald-600">Bid Amount: ${Number(item.amount).toLocaleString()}</span>
                                  <span className="text-sm text-emerald-600">Status: {item.status}</span>
                                </div>
                                <Link href={`/projects/${item.projectId}`}>
                                  <Button variant="link" className="p-0 mt-2 text-brand hover:text-brand-700">View Project</Button>
                                </Link>
                              </div>
                            )}
                          </div>
                        ))}
                        
                        <Link href={user.role === "company" ? "/dashboard/projects" : "/dashboard/bids"}>
                          <Button variant="outline" className="w-full mt-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800">
                            View All
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-emerald-600 mb-4">
                          {user.role === "company" 
                            ? "You haven't posted any projects yet." 
                            : "You haven't submitted any bids yet."}
                        </p>
                        {user.role === "company" ? (
                          <Button onClick={() => setNewProjectDialogOpen(true)} className="bg-brand hover:bg-brand-700">
                            Post Your First Project
                          </Button>
                        ) : (
                          <Link href="/projects">
                            <Button className="bg-brand hover:bg-brand-700">Browse Projects</Button>
                          </Link>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="messages" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Messages</CardTitle>
                    <CardDescription>
                      Recent messages from your contacts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-6">
                      <MessageSquare className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
                      <p className="text-emerald-600">No messages yet.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>
                      Your recent notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-6">
                      <Bell className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
                      <p className="text-emerald-600">No notifications at this time.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            {/* Account Completion Card */}
            <Card>
              <CardHeader>
                <CardTitle>Complete Your Profile</CardTitle>
                <CardDescription>
                  A complete profile helps you get more {user.role === "company" ? "bids" : "projects"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-emerald-700">Profile Completion</span>
                    <span className="text-sm font-medium text-emerald-800">60%</span>
                  </div>
                  <div className="w-full bg-emerald-100 rounded-full h-2.5">
                    <div className="bg-brand h-2.5 rounded-full" style={{ width: "60%" }}></div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-brand flex items-center justify-center mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm text-emerald-700">Account created</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-brand flex items-center justify-center mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm text-emerald-700">Email verified</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-emerald-200 flex items-center justify-center mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <Link href="/profile" className="text-sm text-brand hover:underline">
                      Complete your profile details
                    </Link>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-emerald-200 flex items-center justify-center mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm text-emerald-700">
                      {user.role === "company" 
                        ? "Add company details" 
                        : "Upload portfolio and certifications"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* New Project Dialog */}
      <Dialog open={newProjectDialogOpen} onOpenChange={setNewProjectDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Post a New Project</DialogTitle>
            <DialogDescription>
              Complete the form below to post your project and start receiving bids from qualified contractors.
            </DialogDescription>
          </DialogHeader>
          
          <ProjectForm onSuccess={() => setNewProjectDialogOpen(false)} />
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}
