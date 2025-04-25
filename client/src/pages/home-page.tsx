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
  const { data: projects } = useQuery({
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
      <section className="hero-gradient py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Connect Companies with Qualified Contractors</h1>
              <p className="text-lg mb-8 text-slate-200">ContractHub streamlines the process of finding, hiring, and managing contractors for your projects. Post your requirements and get bids from qualified professionals.</p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/auth?role=company">
                  <Button className="w-full sm:w-auto btn-primary">
                    I'm a Company
                  </Button>
                </Link>
                <Link href="/auth?role=contractor">
                  <Button className="w-full sm:w-auto btn-accent">
                    I'm a Contractor
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
                alt="Contractor and company handshake" 
                className="rounded-lg shadow-xl max-w-full h-auto" 
                width="500" 
                height="350" />
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 bg-white" id="how-it-works">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-800">How ContractHub Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 rounded-xl p-6 shadow-md flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mb-4">
                <BellRing className="text-sky-600 h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-800">Post Your Project</h3>
              <p className="text-slate-600">Describe your project needs, timeline, and budget to attract qualified contractors.</p>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-6 shadow-md flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mb-4">
                <MessagesSquare className="text-sky-600 h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-800">Receive & Compare Bids</h3>
              <p className="text-slate-600">Review proposals from interested contractors and select the best match for your project.</p>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-6 shadow-md flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mb-4">
                <Handshake className="text-sky-600 h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-800">Complete Your Project</h3>
              <p className="text-slate-600">Track progress, manage milestones, and finalize work through our secure platform.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Projects Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800">Featured Projects</h2>
            <Link href="/projects" className="text-sky-600 hover:text-sky-700 font-medium">
              View All Projects <span aria-hidden="true">→</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects && projects.slice(0, 3).map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                profile={{
                  name: project.company?.name || "Company Name",
                  avatar: project.company?.avatar || "https://randomuser.me/api/portraits/men/32.jpg"
                }}
              />
            ))}
            
            {!projects && (
              <>
                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-slate-200 h-80 animate-pulse"></div>
                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-slate-200 h-80 animate-pulse"></div>
                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-slate-200 h-80 animate-pulse"></div>
              </>
            )}
          </div>
        </div>
      </section>
      
      {/* Top Contractors Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800">Top Rated Contractors</h2>
            <Link href="/contractors" className="text-sky-600 hover:text-sky-700 font-medium">
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
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-800">What Our Users Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0 mr-4">
                  <img src="https://randomuser.me/api/portraits/women/45.jpg" alt="Testimonial author" className="w-12 h-12 rounded-full" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">Jennifer Lawrence</h4>
                  <p className="text-slate-500 text-sm">Operations Manager at BuildRight Inc.</p>
                  <div className="flex text-yellow-400 mt-1">
                    <span className="sr-only">5 out of 5 stars</span>
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-slate-600 italic">"ContractHub has revolutionized how we find and hire contractors. The platform is intuitive, and we've been able to find quality professionals for all our projects. The bidding system helps us get competitive pricing while ensuring we still get top-quality work."</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0 mr-4">
                  <img src="https://randomuser.me/api/portraits/men/33.jpg" alt="Testimonial author" className="w-12 h-12 rounded-full" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">Michael Rodriguez</h4>
                  <p className="text-slate-500 text-sm">Independent Electrical Contractor</p>
                  <div className="flex text-yellow-400 mt-1">
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
              <p className="text-slate-600 italic">"As a contractor, finding consistent work used to be challenging. With ContractHub, I can browse available projects that match my skills and bid on them directly. The milestone payment system ensures I get paid on time, which has been a game-changer for my business."</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 cta-gradient">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Contracting Experience?</h2>
          <p className="text-lg text-sky-100 mb-8 max-w-2xl mx-auto">Join thousands of companies and contractors who are already using ContractHub to streamline their projects.</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/auth?role=company">
              <Button className="w-full sm:w-auto btn-white">
                Post a Project
              </Button>
            </Link>
            <Link href="/auth?role=contractor">
              <Button className="w-full sm:w-auto btn-accent">
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
