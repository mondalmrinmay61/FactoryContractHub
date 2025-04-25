import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  Briefcase, 
  Building2, 
  Hammer, 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  User,
  Loader2
} from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuth();
  
  // Fetch all users
  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: !!user && user.role === 'admin',
  });
  
  // Fetch all projects
  const { data: allProjects, isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/admin/projects'],
    enabled: !!user && user.role === 'admin',
  });
  
  // Fetch all contracts
  const { data: allContracts, isLoading: contractsLoading } = useQuery({
    queryKey: ['/api/admin/contracts'],
    enabled: !!user && user.role === 'admin',
  });
  
  const isLoading = usersLoading || projectsLoading || contractsLoading;
  
  // Calculate stats
  const stats = {
    users: {
      total: Array.isArray(allUsers) ? allUsers.length : 0,
      companies: Array.isArray(allUsers) ? allUsers.filter((u: any) => u.role === 'company').length : 0,
      contractors: Array.isArray(allUsers) ? allUsers.filter((u: any) => u.role === 'contractor').length : 0,
      verified: Array.isArray(allUsers) ? allUsers.filter((u: any) => u.profile?.isVerified).length : 0,
    },
    projects: {
      total: Array.isArray(allProjects) ? allProjects.length : 0,
      open: Array.isArray(allProjects) ? allProjects.filter((p: any) => p.status === 'open').length : 0,
      inProgress: Array.isArray(allProjects) ? allProjects.filter((p: any) => p.status === 'in_progress').length : 0,
      completed: Array.isArray(allProjects) ? allProjects.filter((p: any) => p.status === 'completed').length : 0,
      cancelled: Array.isArray(allProjects) ? allProjects.filter((p: any) => p.status === 'cancelled').length : 0,
    },
    contracts: {
      total: Array.isArray(allContracts) ? allContracts.length : 0,
      active: Array.isArray(allContracts) ? allContracts.filter((c: any) => c.status === 'active').length : 0,
      completed: Array.isArray(allContracts) ? allContracts.filter((c: any) => c.status === 'completed').length : 0,
    }
  };
  
  const getStatusBadge = (status: string) => {
    const statusMap: any = {
      open: { label: 'Open', variant: 'outline' },
      pending: { label: 'Pending', variant: 'outline' },
      in_progress: { label: 'In Progress', variant: 'secondary' },
      completed: { label: 'Completed', variant: 'success' },
      cancelled: { label: 'Cancelled', variant: 'destructive' },
      active: { label: 'Active', variant: 'secondary' },
      verified: { label: 'Verified', variant: 'success' },
      rejected: { label: 'Rejected', variant: 'destructive' },
      withdrawn: { label: 'Withdrawn', variant: 'destructive' },
      paid: { label: 'Paid', variant: 'success' },
    };
    
    const config = statusMap[status] || { label: status, variant: 'outline' };
    
    return (
      <Badge variant={config.variant === 'success' ? 'success' : config.variant === 'destructive' ? 'destructive' : config.variant}>
        {config.label}
      </Badge>
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 py-10 px-4 md:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-emerald-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome, {user?.username}</p>
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                <ShieldCheck className="mr-2 h-4 w-4" />
                <span>Admin Settings</span>
              </Button>
            </div>
          </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <Users className="mr-2 h-5 w-5 text-emerald-600" />
                  User Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Users</span>
                    <span className="font-semibold text-emerald-700">{stats.users.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Companies</span>
                    <span className="font-semibold text-emerald-700">{stats.users.companies}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Contractors</span>
                    <span className="font-semibold text-emerald-700">{stats.users.contractors}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Verified Users</span>
                    <span className="font-semibold text-emerald-700">{stats.users.verified}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <Briefcase className="mr-2 h-5 w-5 text-emerald-600" />
                  Project Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Projects</span>
                    <span className="font-semibold text-emerald-700">{stats.projects.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Open</span>
                    <span className="font-semibold text-emerald-700">{stats.projects.open}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">In Progress</span>
                    <span className="font-semibold text-emerald-700">{stats.projects.inProgress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Completed</span>
                    <span className="font-semibold text-emerald-700">{stats.projects.completed}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <ShieldCheck className="mr-2 h-5 w-5 text-emerald-600" />
                  Contract Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Contracts</span>
                    <span className="font-semibold text-emerald-700">{stats.contracts.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Active</span>
                    <span className="font-semibold text-emerald-700">{stats.contracts.active}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Completed</span>
                    <span className="font-semibold text-emerald-700">{stats.contracts.completed}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content Tabs */}
          <Tabs defaultValue="users" className="mb-6">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="users">
                <Users className="mr-2 h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="projects">
                <Briefcase className="mr-2 h-4 w-4" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="contracts">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Contracts
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>View and manage all users of the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    </div>
                  ) : (
                    <Table>
                      <TableCaption>A list of all users on the platform.</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Username</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.isArray(allUsers) && allUsers.length > 0 ? (
                          allUsers.slice(0, 5).map((user: any) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.username}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell className="capitalize">{user.role}</TableCell>
                              <TableCell>
                                {user.profile?.isVerified ? (
                                  <Badge variant="success">Verified</Badge>
                                ) : (
                                  <Badge variant="outline">Unverified</Badge>
                                )}
                              </TableCell>
                              <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm">View</Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center">
                              No users found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                  
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline">View All Users</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="projects">
              <Card>
                <CardHeader>
                  <CardTitle>Project Management</CardTitle>
                  <CardDescription>View and manage all projects on the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    </div>
                  ) : (
                    <Table>
                      <TableCaption>A list of all projects on the platform.</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Project</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Budget</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.isArray(allProjects) && allProjects.length > 0 ? (
                          allProjects.slice(0, 5).map((project: any) => (
                            <TableRow key={project.id}>
                              <TableCell className="font-medium">{project.title}</TableCell>
                              <TableCell>{project.company?.username || 'Unknown'}</TableCell>
                              <TableCell>${Number(project.budgetMin).toLocaleString()} - ${Number(project.budgetMax).toLocaleString()}</TableCell>
                              <TableCell>{getStatusBadge(project.status)}</TableCell>
                              <TableCell>{new Date(project.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm">View</Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center">
                              No projects found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                  
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline">View All Projects</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="contracts">
              <Card>
                <CardHeader>
                  <CardTitle>Contract Management</CardTitle>
                  <CardDescription>View and manage all contracts on the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    </div>
                  ) : (
                    <Table>
                      <TableCaption>A list of all contracts on the platform.</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Project</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Contractor</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Start Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.isArray(allContracts) && allContracts.length > 0 ? (
                          allContracts.slice(0, 5).map((contract: any) => (
                            <TableRow key={contract.id}>
                              <TableCell className="font-medium">{contract.project?.title || 'Unknown'}</TableCell>
                              <TableCell>{contract.project?.company?.username || 'Unknown'}</TableCell>
                              <TableCell>{contract.bid?.contractor?.username || 'Unknown'}</TableCell>
                              <TableCell>{getStatusBadge(contract.status)}</TableCell>
                              <TableCell>{new Date(contract.startDate).toLocaleDateString()}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm">View</Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center">
                              No contracts found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                  
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline">View All Contracts</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}