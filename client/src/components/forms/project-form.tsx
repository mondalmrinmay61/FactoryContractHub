import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, X } from "lucide-react";

const projectSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.enum([
    "construction", 
    "electrical", 
    "painting", 
    "plumbing", 
    "labour", 
    "transportation", 
    "other"
  ]),
  location: z.string().min(2, "Location is required"),
  budgetMin: z.number().positive("Minimum budget must be a positive number"),
  budgetMax: z.number().positive("Maximum budget must be a positive number"),
  duration: z.string().min(2, "Duration is required"),
  requirements: z.array(
    z.object({
      requirement: z.string().min(3, "Requirement must be at least 3 characters"),
      isRequired: z.boolean().default(true),
    })
  ).optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  onSuccess?: () => void;
}

export function ProjectForm({ onSuccess }: ProjectFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requirements, setRequirements] = useState<{ id: string; text: string; isRequired: boolean }[]>([]);
  const [requirementInput, setRequirementInput] = useState("");
  
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "construction",
      location: "",
      budgetMin: undefined,
      budgetMax: undefined,
      duration: "",
      requirements: [],
    },
  });
  
  const createProject = useMutation({
    mutationFn: async (data: ProjectFormValues) => {
      // Add requirements to the form data
      const formData = {
        ...data,
        requirements: requirements.map(req => ({
          requirement: req.text,
          isRequired: req.isRequired,
        })),
      };
      
      const res = await apiRequest("POST", "/api/projects", formData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${user?.id}/projects`] });
      
      toast({
        title: "Project Created",
        description: "Your project has been posted successfully.",
      });
      
      form.reset();
      setRequirements([]);
      setRequirementInput("");
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create Project",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const addRequirement = () => {
    if (requirementInput.trim().length > 0) {
      setRequirements([
        ...requirements,
        { id: crypto.randomUUID(), text: requirementInput.trim(), isRequired: true },
      ]);
      setRequirementInput("");
    }
  };
  
  const removeRequirement = (id: string) => {
    setRequirements(requirements.filter(req => req.id !== id));
  };
  
  const toggleRequirementStatus = (id: string) => {
    setRequirements(
      requirements.map(req => 
        req.id === id ? { ...req, isRequired: !req.isRequired } : req
      )
    );
  };
  
  const onSubmit = (data: ProjectFormValues) => {
    createProject.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter a clear title for your project" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your project in detail, including scope, objectives, and specific requirements" 
                  className="resize-none" 
                  rows={5}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="construction">Construction</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="painting">Painting</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="labour">Labour</SelectItem>
                    <SelectItem value="transportation">Transportation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="City, State" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="budgetMin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Budget ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="e.g. 5000" 
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="budgetMax"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Budget ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="e.g. 10000" 
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Duration</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 2-3 months" {...field} />
              </FormControl>
              <FormDescription>
                Specify the expected timeframe for project completion
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div>
          <FormLabel>Requirements</FormLabel>
          <div className="flex mt-1 mb-2">
            <Input
              placeholder="Add a requirement for contractors"
              value={requirementInput}
              onChange={(e) => setRequirementInput(e.target.value)}
              className="mr-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addRequirement();
                }
              }}
            />
            <Button 
              type="button" 
              onClick={addRequirement}
              size="sm"
              className="flex-shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {requirements.length > 0 ? (
            <div className="space-y-2 mt-3">
              {requirements.map((req) => (
                <div key={req.id} className="flex items-center bg-slate-50 p-2 rounded-md">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className={req.isRequired ? "font-medium" : "text-slate-600"}>
                        {req.text}
                      </span>
                      {req.isRequired && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => toggleRequirementStatus(req.id)}
                    >
                      {req.isRequired ? "Optional" : "Required"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500"
                      onClick={() => removeRequirement(req.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 mt-2">
              No requirements added yet. Adding specific requirements helps contractors understand your needs better.
            </p>
          )}
        </div>
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={createProject.isPending}
        >
          {createProject.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Project...
            </>
          ) : "Post Project"}
        </Button>
      </form>
    </Form>
  );
}
