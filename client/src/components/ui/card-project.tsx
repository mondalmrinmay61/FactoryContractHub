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
    <Card className="bg-white rounded-lg shadow-md overflow-hidden border border-slate-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-slate-800">{project.title}</h3>
          <span className="tag">{project.category}</span>
        </div>
        
        <p className="text-slate-600 mb-4 line-clamp-2">{project.description}</p>
        
        <div className="flex items-center text-slate-500 text-sm mb-4">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{project.location}</span>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-sm text-slate-500">Budget</span>
            <p className="font-semibold text-slate-800">
              ${Number(project.budgetMin).toLocaleString()} 
              {project.budgetMin !== project.budgetMax && ` - $${Number(project.budgetMax).toLocaleString()}`}
            </p>
          </div>
          <div>
            <span className="text-sm text-slate-500">Duration</span>
            <p className="font-semibold text-slate-800">{project.duration}</p>
          </div>
        </div>
        
        {profile && (
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img src={profile.avatar} alt="Company logo" className="w-8 h-8 rounded-full mr-2" />
              <span className="text-sm font-medium text-slate-700">{profile.name}</span>
            </div>
            <span className="text-xs text-slate-500">Posted {postedDate}</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="bg-slate-50 px-6 py-3 border-t border-slate-200">
        <Link href={`/projects/${project.id}`} className="text-sky-600 hover:text-sky-700 font-medium text-sm">
          View Details
        </Link>
      </CardFooter>
    </Card>
  );
}
