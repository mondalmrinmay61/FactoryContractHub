import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, StarHalf, Check, MapPin } from "lucide-react";
import { Link } from "wouter";

interface ContractorCardProps {
  contractor: {
    id: number;
    name: string;
    specialty: string;
    avatar: string;
    location: string;
    rating: number;
    reviewCount: number;
    projectCount: number;
    skills: string[];
  };
}

export function ContractorCard({ contractor }: ContractorCardProps) {
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

  return (
    <Card className="bg-white rounded-lg shadow-md border border-emerald-100 hover:border-emerald-200 transition-colors overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col items-center mb-4">
          <img 
            src={contractor.avatar} 
            alt={`${contractor.name} profile`} 
            className="w-20 h-20 rounded-full mb-3 border-2 border-emerald-100"
          />
          <h3 className="text-lg font-semibold text-emerald-900">{contractor.name}</h3>
          <p className="text-brand font-medium">{contractor.specialty}</p>
        </div>
        
        <div className="flex justify-center mb-4">
          <div className="flex items-center">
            {renderStars(contractor.rating)}
            <span className="text-emerald-700 ml-2">
              {contractor.rating.toFixed(1)} ({contractor.reviewCount})
            </span>
          </div>
        </div>
        
        <div className="flex justify-between text-sm text-emerald-600 mb-4">
          <div className="flex items-center">
            <Check className="text-brand w-4 h-4 mr-1" />
            <span>{contractor.projectCount} Projects</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{contractor.location}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {contractor.skills.map((skill, index) => (
            <span key={index} className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">{skill}</span>
          ))}
        </div>
        
        <Link href={`/contractors/${contractor.id}`}>
          <Button className="w-full bg-brand hover:bg-brand-700">
            Contact Contractor
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
