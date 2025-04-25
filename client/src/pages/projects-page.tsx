
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ProjectCard } from "@/components/ui/card-project";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Search, Filter, Loader2, Plus } from "lucide-react";

export default function ProjectsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("open");
  const [budgetRange, setBudgetRange] = useState("all");
  
  // Fetch projects
  const { data: projects, isLoading } = useQuery({
    queryKey: ["/api/projects", { category: categoryFilter !== "all" ? categoryFilter : undefined, status: statusFilter }],
  });
  
  const filteredProjects = projects?.filter(project => {
    const matchesSearch = 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesBudget = budgetRange === "all" || (
      budgetRange === "under5k" ? project.budgetMax <= 5000 :
      budgetRange === "5kTo20k" ? (project.budgetMax > 5000 && project.budgetMax <= 20000) :
      budgetRange === "over20k" ? project.budgetMax > 20000 : true
    );
    
    return matchesSearch && matchesBudget;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="relative bg-slate-900 text-white py-12">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 to-emerald-800/90"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Browse Projects</h1>
              <p className="text-slate-300">Find and bid on construction and industrial projects</p>
            </div>
            
            {user?.role === "company" && (
              <Link href="/dashboard/post-project">
                <Button className="mt-4 md:mt-0 bg-white text-emerald-800 hover:bg-emerald-50">
                  <Plus className="mr-2 h-4 w-4" />
                  Post a New Project
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search projects..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select 
              value={categoryFilter} 
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="construction">Construction</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
                <SelectItem value="painting">Painting</SelectItem>
                <SelectItem value="plumbing">Plumbing</SelectItem>
                <SelectItem value="labour">Labour</SelectItem>
                <SelectItem value="transportation">Transportation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={statusFilter} 
              onValueChange={setStatusFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open Projects</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={budgetRange}
              onValueChange={setBudgetRange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Budgets</SelectItem>
                <SelectItem value="under5k">Under $5,000</SelectItem>
                <SelectItem value="5kTo20k">$5,000 - $20,000</SelectItem>
                <SelectItem value="over20k">Over $20,000</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <main className="flex-grow bg-slate-50 py-8">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : filteredProjects && filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  profile={{
                    name: project.company?.name || "Company Name",
                    avatar: project.company?.avatar || "https://randomuser.me/api/portraits/men/32.jpg"
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex rounded-full bg-slate-100 p-4 mb-4">
                <Filter className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mt-2">No projects found</h3>
              <p className="text-slate-500 mt-1">
                {searchTerm 
                  ? "Try adjusting your search or filters to find what you're looking for." 
                  : "There are no projects that match your current filters."}
              </p>
              {user?.role === "company" && (
                <Link href="/dashboard/post-project">
                  <Button className="mt-4 bg-brand hover:bg-brand-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Post Your First Project
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
