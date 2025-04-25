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
import { Search, Filter, Loader2 } from "lucide-react";

export default function ProjectsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("open");
  
  // Fetch projects
  const { data: projects, isLoading } = useQuery({
    queryKey: ["/api/projects", { category: categoryFilter !== "all" ? categoryFilter : undefined, status: statusFilter }],
  });
  
  const filteredProjects = projects?.filter(project => 
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Browse Projects</h1>
              <p className="text-slate-300">Find and bid on construction and industrial projects</p>
            </div>
            
            {user?.role === "company" && (
              <Link href="/dashboard/post-project">
                <Button className="mt-4 md:mt-0 btn-primary">
                  Post a New Project
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 items-center">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search projects..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="w-full md:w-1/4">
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
            </div>
            
            <div className="w-full md:w-1/4">
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
            </div>
          </div>
        </div>
      </div>
      
      <main className="flex-grow bg-slate-50 py-8">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
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
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
