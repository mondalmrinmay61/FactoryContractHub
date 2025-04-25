import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ProjectCard } from "@/components/ui/card-project";
import { ContractorCard } from "@/components/ui/card-contractor";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BellRing, MessagesSquare, Handshake } from "lucide-react";

export default function HomePage() {
  // Fetch featured projects
  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ["/api/projects"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mock contractor data for the home page
  const topContractors = [
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
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 to-emerald-800/90 z-0"></div>
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 space-y-8">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-200">
                Connect Companies with Qualified Contractors
              </h1>
              <p className="text-xl text-emerald-50/90 leading-relaxed">
                ContractHub streamlines the process of finding, hiring, and managing contractors for your projects. Post your requirements and get bids from qualified professionals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/auth?role=company">
                  <Button className="w-full sm:w-auto bg-white text-emerald-800 hover:bg-emerald-50 font-semibold px-8 py-6 rounded-xl transition-all duration-300 shadow-xl hover:shadow-emerald-500/20 text-lg">
                    I'm a Company
                  </Button>
                </Link>
                <Link href="/auth?role=contractor">
                  <Button className="w-full sm:w-auto bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold px-8 py-6 rounded-xl transition-all duration-300 text-lg">
                    I'm a Contractor
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-2xl blur-2xl opacity-30 animate-pulse"></div>
                <img 
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
                  alt="Contractor and company handshake" 
                  className="relative rounded-2xl shadow-2xl max-w-full h-auto border-4 border-white/20 transform hover:scale-[1.02] transition-transform duration-500" 
                  width="600" 
                  height="400" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-20 bg-white" id="how-it-works">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 heading-gradient">How ContractHub Works</h2>
          <p className="text-center mb-12 text-gray-600 max-w-2xl mx-auto">Our streamlined process makes it easy to connect companies with qualified contractors.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-md flex flex-col items-center text-center border border-emerald-100 hover:border-brand-600 transition-all">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-4">
                <BellRing className="text-brand-600 h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Post Your Project</h3>
              <p className="text-gray-600">Describe your project needs, timeline, and budget to attract qualified contractors.</p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-md flex flex-col items-center text-center border border-emerald-100 hover:border-brand-600 transition-all">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-4">
                <MessagesSquare className="text-brand-600 h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Receive & Compare Bids</h3>
              <p className="text-gray-600">Review proposals from interested contractors and select the best match for your project.</p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-md flex flex-col items-center text-center border border-emerald-100 hover:border-brand-600 transition-all">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-4">
                <Handshake className="text-brand-600 h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Complete Your Project</h3>
              <p className="text-gray-600">Track progress, manage milestones, and finalize work through our secure platform.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Projects Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold heading-gradient">Featured Projects</h2>
            <Link href="/projects" className="text-brand-600 hover:text-brand-700 font-medium">
              View All Projects <span aria-hidden="true">→</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects && projects.length > 0 ? (
              projects.slice(0, 3).map((project: any) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  profile={{
                    name: project.company?.name || "Company Name",
                    avatar: project.company?.avatar || "https://randomuser.me/api/portraits/men/32.jpg"
                  }}
                />
              ))
            ) : (
              <>
                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-emerald-100 h-80 animate-pulse"></div>
                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-emerald-100 h-80 animate-pulse"></div>
                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-emerald-100 h-80 animate-pulse"></div>
              </>
            )}
          </div>
        </div>
      </section>
      
      {/* Top Contractors Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold heading-gradient">Top Rated Contractors</h2>
            <Link href="/contractors" className="text-brand-600 hover:text-brand-700 font-medium">
              View All Contractors <span aria-hidden="true">→</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topContractors.map((contractor) => (
              <ContractorCard key={contractor.id} contractor={contractor} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20 bg-emerald-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-6 heading-gradient">What Our Users Say</h2>
          <p className="text-center mb-12 text-gray-600 max-w-2xl mx-auto">Read about the experiences of companies and contractors who have found success on our platform.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md border border-emerald-100 hover:border-brand-600 transition-all">
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0 mr-4">
                  <img src="https://randomuser.me/api/portraits/women/45.jpg" alt="Testimonial author" className="w-16 h-16 rounded-full border-2 border-brand-100" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-lg">Jennifer Lawrence</h4>
                  <p className="text-gray-500 text-sm">Operations Manager at BuildRight Inc.</p>
                  <div className="flex text-brand-500 mt-1">
                    <span className="sr-only">5 out of 5 stars</span>
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">"ContractHub has revolutionized how we find and hire contractors. The platform is intuitive, and we've been able to find quality professionals for all our projects. The bidding system helps us get competitive pricing while ensuring we still get top-quality work."</p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md border border-emerald-100 hover:border-brand-600 transition-all">
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0 mr-4">
                  <img src="https://randomuser.me/api/portraits/men/33.jpg" alt="Testimonial author" className="w-16 h-16 rounded-full border-2 border-brand-100" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-lg">Michael Rodriguez</h4>
                  <p className="text-gray-500 text-sm">Independent Electrical Contractor</p>
                  <div className="flex text-brand-500 mt-1">
                    <span className="sr-only">4.5 out of 5 stars</span>
                    {[...Array(4)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                      </svg>
                    ))}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">"As a contractor, finding consistent work used to be challenging. With ContractHub, I can browse available projects that match my skills and bid on them directly. The milestone payment system ensures I get paid on time, which has been a game-changer for my business."</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 cta-gradient">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Contracting Experience?</h2>
          <p className="text-lg text-emerald-50 mb-10 max-w-2xl mx-auto">Join thousands of companies and contractors who are already using ContractHub to streamline their projects.</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link href="/auth?role=company">
              <Button className="w-full sm:w-auto bg-white text-emerald-800 hover:bg-emerald-50 font-medium px-8 py-3 rounded-md transition-colors shadow-lg text-lg">
                Post a Project
              </Button>
            </Link>
            <Link href="/auth?role=contractor">
              <Button className="w-full sm:w-auto border-2 border-white text-white hover:bg-emerald-800/20 font-medium px-8 py-3 rounded-md transition-colors text-lg">
                Join as a Contractor
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
