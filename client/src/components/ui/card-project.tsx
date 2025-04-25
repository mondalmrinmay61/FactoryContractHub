import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Project } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { MapPin } from "lucide-react";
import { Link } from "wouter";

interface ProjectCardProps {
  project: Project;
  profile?: {
    name: string;
    avatar: string;
  };
}

export function ProjectCard({ project, profile }: ProjectCardProps) {
  // Format dates for display
  const postedDate = project.createdAt 
    ? formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })
    : 'Recently';

  return (
    <Card className="bg-white rounded-lg shadow-md overflow-hidden border border-emerald-100 hover:border-emerald-200 transition-colors">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-emerald-900">{project.title}</h3>
          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">{project.category}</span>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
        
        <div className="flex items-center text-emerald-600 text-sm mb-4">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{project.location}</span>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-sm text-emerald-600">Budget</span>
            <p className="font-semibold text-emerald-800">
              ${Number(project.budgetMin).toLocaleString()} 
              {project.budgetMin !== project.budgetMax && ` - $${Number(project.budgetMax).toLocaleString()}`}
            </p>
          </div>
          <div>
            <span className="text-sm text-emerald-600">Duration</span>
            <p className="font-semibold text-emerald-800">{project.duration}</p>
          </div>
        </div>
        
        {profile && (
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img src={profile.avatar} alt="Company logo" className="w-8 h-8 rounded-full mr-2" />
              <span className="text-sm font-medium text-gray-700">{profile.name}</span>
            </div>
            <span className="text-xs text-emerald-600">Posted {postedDate}</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="bg-emerald-50 px-6 py-3 border-t border-emerald-100">
        <Link href={`/projects/${project.id}`} className="text-brand hover:text-brand-700 font-medium text-sm">
          View Details
        </Link>
      </CardFooter>
    </Card>
  );
}
