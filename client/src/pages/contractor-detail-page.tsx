import { useParams, Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Star, StarHalf, Clock, Calendar, MapPin, Mail, Phone, Globe, MessageSquare, Award, ThumbsUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ContractorDetailPage() {
  const { id } = useParams<{ id: string }>();
  
  // Mock contractor data - in a real app, this would come from an API
  const contractor = {
    id: parseInt(id),
    name: "Robert Johnson",
    specialty: "Electrical Contractor",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    location: "Dallas, TX",
    description: "Licensed electrical contractor with over 15 years of experience in industrial and commercial projects. Specializing in electrical system installations, upgrades, and maintenance for manufacturing facilities and commercial buildings.",
    contactEmail: "robert@electricalservices.com",
    contactPhone: "214-555-7890",
    website: "https://www.rjelectrical.com",
    rating: 4.5,
    reviewCount: 38,
    projectCount: 24,
    yearsOfExperience: 15,
    completionRate: 98,
    responseRate: 95,
    responseTime: "Within 24 hours",
    skills: ["Commercial", "Industrial", "Maintenance", "Electrical System Design", "Energy Efficiency", "Troubleshooting", "Emergency Repairs"],
    certifications: ["Master Electrician License", "OSHA Safety Certification", "Energy Efficiency Specialist"],
    reviews: [
      {
        id: 1,
        project: "Factory Electrical System Upgrade",
        companyName: "TechManufacturing Ltd.",
        companyLogo: "https://randomuser.me/api/portraits/women/68.jpg",
        rating: 5,
        date: "2023-09-12",
        comment: "Robert and his team did an exceptional job upgrading our factory's electrical system. They completed the work ahead of schedule and were very professional throughout the project. Would definitely hire again."
      },
      {
        id: 2,
        project: "Office Building Rewiring",
        companyName: "Global Logistics Co.",
        companyLogo: "https://randomuser.me/api/portraits/men/45.jpg",
        rating: 4,
        date: "2023-07-25",
        comment: "Good work on our office rewiring project. Robert was knowledgeable and provided helpful suggestions for improving our electrical efficiency. The only issue was some minor delays in the schedule."
      }
    ]
  };
  
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="fill-yellow-400 text-yellow-400" />);
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-yellow-400" />);
    }
    
    return stars;
  };
  
  if (!contractor) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Contractor Not Found</h1>
            <p className="text-slate-600 mb-4">The contractor you're looking for doesn't exist or has been removed.</p>
            <Link href="/contractors">
              <Button>Browse Contractors</Button>
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
      
      <main className="flex-grow bg-slate-50 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contractor Profile */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
                      <img 
                        src={contractor.avatar} 
                        alt={contractor.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <h1 className="text-2xl font-bold">{contractor.name}</h1>
                    <p className="text-sky-600 font-medium">{contractor.specialty}</p>
                    <div className="flex items-center mt-2">
                      {renderStars(contractor.rating)}
                      <span className="ml-2 text-slate-600">
                        {contractor.rating.toFixed(1)} ({contractor.reviewCount} reviews)
                      </span>
                    </div>
                    <div className="flex items-center mt-2 text-slate-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {contractor.location}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Button className="w-full" variant="default">
                      <MessageSquare className="mr-2 h-4 w-4" /> Contact Contractor
                    </Button>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-semibold mb-2">Contact Information</h3>
                      <div className="space-y-2">
                        <div className="flex items-center text-slate-600">
                          <Mail className="h-4 w-4 mr-2" />
                          <a href={`mailto:${contractor.contactEmail}`} className="hover:text-sky-600">
                            {contractor.contactEmail}
                          </a>
                        </div>
                        <div className="flex items-center text-slate-600">
                          <Phone className="h-4 w-4 mr-2" />
                          <a href={`tel:${contractor.contactPhone}`} className="hover:text-sky-600">
                            {contractor.contactPhone}
                          </a>
                        </div>
                        <div className="flex items-center text-slate-600">
                          <Globe className="h-4 w-4 mr-2" />
                          <a 
                            href={contractor.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-sky-600"
                          >
                            Website
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-semibold mb-2">Certifications</h3>
                      <div className="space-y-2">
                        {contractor.certifications.map((cert, index) => (
                          <div key={index} className="flex items-center text-slate-600">
                            <Award className="h-4 w-4 mr-2 text-sky-600" />
                            {cert}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Contractor Details */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>About {contractor.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-6">{contractor.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex flex-col">
                      <span className="text-sm text-slate-500">Experience</span>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-slate-500" />
                        <span className="font-semibold">{contractor.yearsOfExperience} years</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-slate-500">Projects Completed</span>
                      <div className="flex items-center">
                        <ThumbsUp className="h-4 w-4 mr-1 text-slate-500" />
                        <span className="font-semibold">{contractor.projectCount} projects</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-slate-500">Response Time</span>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-slate-500" />
                        <span className="font-semibold">{contractor.responseTime}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-slate-600">Completion Rate</span>
                        <span className="text-sm font-medium">{contractor.completionRate}%</span>
                      </div>
                      <Progress value={contractor.completionRate} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-slate-600">Response Rate</span>
                        <span className="text-sm font-medium">{contractor.responseRate}%</span>
                      </div>
                      <Progress value={contractor.responseRate} className="h-2" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Skills & Expertise</h3>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {contractor.skills.map((skill, index) => (
                        <span key={index} className="bg-slate-100 text-slate-700 rounded-full px-3 py-1 text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Reviews & Feedback</CardTitle>
                  <CardDescription>
                    Client reviews from previous projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {contractor.reviews.length > 0 ? (
                    <div className="space-y-6">
                      {contractor.reviews.map(review => (
                        <div key={review.id} className="border-b pb-6 last:border-0">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 mr-4">
                              <img 
                                src={review.companyLogo} 
                                alt={review.companyName} 
                                className="w-12 h-12 rounded-full" 
                              />
                            </div>
                            <div>
                              <h4 className="font-semibold">{review.companyName}</h4>
                              <p className="text-sm text-slate-500">Project: {review.project}</p>
                              <div className="flex text-yellow-400 mt-1">
                                {[...Array(review.rating)].map((_, i) => (
                                  <Star key={i} className="fill-yellow-400 text-yellow-400 h-4 w-4" />
                                ))}
                                {[...Array(5 - review.rating)].map((_, i) => (
                                  <Star key={`empty-${i}`} className="text-yellow-400 h-4 w-4" />
                                ))}
                              </div>
                              <p className="text-xs text-slate-500 mt-1">
                                {new Date(review.date).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                          <p className="mt-3 text-slate-600">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-slate-500">No reviews yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
