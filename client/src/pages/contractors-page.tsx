import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ContractorCard } from "@/components/ui/card-contractor";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Loader2 } from "lucide-react";

export default function ContractorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock contractor data - in a real app this would come from an API
  const contractors = [
    {
      id: 1,
      name: "Robert Johnson",
      specialty: "Electrical Contractor",
      avatar: "https://randomuser.me/api/portraits/men/75.jpg",
      location: "Dallas, TX",
      rating: 4.5,
      reviewCount: 38,
      projectCount: 24,
      skills: ["Commercial", "Industrial", "Maintenance"]
    },
    {
      id: 2,
      name: "Maria Rodriguez",
      specialty: "Painting Contractor",
      avatar: "https://randomuser.me/api/portraits/women/26.jpg",
      location: "Miami, FL",
      rating: 5.0,
      reviewCount: 42,
      projectCount: 36,
      skills: ["Commercial", "Residential", "Interior"]
    },
    {
      id: 3,
      name: "David Chen",
      specialty: "Plumbing Contractor",
      avatar: "https://randomuser.me/api/portraits/men/52.jpg",
      location: "Seattle, WA",
      rating: 4.0,
      reviewCount: 21,
      projectCount: 15,
      skills: ["Industrial", "Emergency", "Installation"]
    },
    {
      id: 4,
      name: "James Wilson",
      specialty: "Construction Manager",
      avatar: "https://randomuser.me/api/portraits/men/36.jpg",
      location: "Houston, TX",
      rating: 4.7,
      reviewCount: 53,
      projectCount: 42,
      skills: ["Commercial", "Industrial", "Project Management"]
    },
    {
      id: 5,
      name: "Sarah Thompson",
      specialty: "HVAC Contractor",
      avatar: "https://randomuser.me/api/portraits/women/42.jpg",
      location: "Chicago, IL",
      rating: 4.3,
      reviewCount: 29,
      projectCount: 18,
      skills: ["Residential", "Commercial", "System Installation"]
    },
    {
      id: 6,
      name: "Michael Brown",
      specialty: "Roofing Contractor",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg",
      location: "Phoenix, AZ",
      rating: 4.8,
      reviewCount: 37,
      projectCount: 31,
      skills: ["Commercial", "Residential", "Repairs"]
    },
    {
      id: 7,
      name: "Jennifer Lee",
      specialty: "Interior Designer",
      avatar: "https://randomuser.me/api/portraits/women/33.jpg",
      location: "San Francisco, CA",
      rating: 4.9,
      reviewCount: 45,
      projectCount: 28,
      skills: ["Commercial", "Residential", "Space Planning"]
    },
    {
      id: 8,
      name: "Carlos Mendez",
      specialty: "Landscaping Contractor",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
      location: "Austin, TX",
      rating: 4.6,
      reviewCount: 31,
      projectCount: 23,
      skills: ["Commercial", "Residential", "Garden Design"]
    }
  ];
  
  const filteredContractors = contractors.filter(contractor => {
    // Filter by search term
    const matchesSearch = 
      contractor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by specialty
    const matchesSpecialty = specializationFilter === "all" || 
      contractor.specialty.toLowerCase().includes(specializationFilter.toLowerCase());
    
    // Filter by location
    const matchesLocation = locationFilter === "all" || 
      contractor.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    return matchesSearch && matchesSpecialty && matchesLocation;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Find Qualified Contractors</h1>
          <p className="text-slate-300">Discover top-rated professionals for your industrial and construction projects</p>
        </div>
      </div>
      
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 items-center">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search contractors..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="w-full md:w-1/4">
              <Select 
                value={specializationFilter} 
                onValueChange={setSpecializationFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specializations</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="plumbing">Plumbing</SelectItem>
                  <SelectItem value="painting">Painting</SelectItem>
                  <SelectItem value="construction">Construction</SelectItem>
                  <SelectItem value="hvac">HVAC</SelectItem>
                  <SelectItem value="roofing">Roofing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-1/4">
              <Select 
                value={locationFilter} 
                onValueChange={setLocationFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="dallas">Dallas, TX</SelectItem>
                  <SelectItem value="miami">Miami, FL</SelectItem>
                  <SelectItem value="seattle">Seattle, WA</SelectItem>
                  <SelectItem value="houston">Houston, TX</SelectItem>
                  <SelectItem value="chicago">Chicago, IL</SelectItem>
                  <SelectItem value="phoenix">Phoenix, AZ</SelectItem>
                  <SelectItem value="san francisco">San Francisco, CA</SelectItem>
                  <SelectItem value="austin">Austin, TX</SelectItem>
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
          ) : filteredContractors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredContractors.map(contractor => (
                <ContractorCard key={contractor.id} contractor={contractor} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex rounded-full bg-slate-100 p-4 mb-4">
                <Filter className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mt-2">No contractors found</h3>
              <p className="text-slate-500 mt-1">
                Try adjusting your search or filters to find qualified contractors.
              </p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
