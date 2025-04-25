import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(2, "Location is required"),
  contactEmail: z.string().email("Invalid email address").optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  website: z.string().url("Invalid website URL").optional().nullable(),
});

const companySchema = z.object({
  companySize: z.string().optional(),
  industry: z.string().optional(),
  yearFounded: z.number().int().positive().optional(),
});

const contractorSchema = z.object({
  specialization: z.string().min(2, "Specialization is required"),
  yearsOfExperience: z.number().int().positive("Years of experience must be a positive number"),
  skills: z.string().array().nonempty("At least one skill is required"),
  hourlyRate: z.number().positive("Hourly rate must be a positive number"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type CompanyFormValues = z.infer<typeof companySchema>;
type ContractorFormValues = z.infer<typeof contractorSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // Fetch user profile data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}/profile`],
    enabled: !!user,
  });
  
  // Fetch specific profile data (company or contractor)
  const { data: specificProfile, isLoading: specificProfileLoading } = useQuery({
    queryKey: [`/api/${user?.role === 'company' ? 'company' : 'contractor'}-profiles/${user?.id}`],
    enabled: !!user,
  });
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || "",
      description: profile?.description || "",
      location: profile?.location || "",
      contactEmail: profile?.contactEmail || "",
      contactPhone: profile?.contactPhone || "",
      website: profile?.website || "",
    },
  });
  
  // Company form
  const companyForm = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companySize: specificProfile?.companySize || "",
      industry: specificProfile?.industry || "",
      yearFounded: specificProfile?.yearFounded || undefined,
    },
  });
  
  // Contractor form
  const contractorForm = useForm<ContractorFormValues>({
    resolver: zodResolver(contractorSchema),
    defaultValues: {
      specialization: specificProfile?.specialization || "",
      yearsOfExperience: specificProfile?.yearsOfExperience || undefined,
      skills: specificProfile?.skills || [],
      hourlyRate: specificProfile?.hourlyRate || undefined,
    },
  });
  
  // Update profile forms when data is loaded
  if (profile && !profileLoading && 
      profileForm.getValues().name === "" && 
      profile.name !== "") {
    profileForm.reset({
      name: profile.name,
      description: profile.description || "",
      location: profile.location || "",
      contactEmail: profile.contactEmail || "",
      contactPhone: profile.contactPhone || "",
      website: profile.website || "",
    });
  }
  
  if (specificProfile && !specificProfileLoading) {
    if (user?.role === "company" &&
        companyForm.getValues().companySize === "" &&
        specificProfile.companySize !== "") {
      companyForm.reset({
        companySize: specificProfile.companySize,
        industry: specificProfile.industry,
        yearFounded: specificProfile.yearFounded,
      });
    } else if (user?.role === "contractor" &&
              contractorForm.getValues().specialization === "" &&
              specificProfile.specialization !== "") {
      contractorForm.reset({
        specialization: specificProfile.specialization,
        yearsOfExperience: specificProfile.yearsOfExperience,
        skills: specificProfile.skills,
        hourlyRate: specificProfile.hourlyRate,
      });
    }
  }
  
  // Avatar upload handler
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Profile update mutation
  const updateProfile = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest("PATCH", `/api/users/${user?.id}/profile`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/profile`] });
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Company profile update mutation
  const updateCompanyProfile = useMutation({
    mutationFn: async (data: CompanyFormValues) => {
      const res = await apiRequest("PATCH", `/api/company-profiles/${user?.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/company-profiles/${user?.id}`] });
      toast({
        title: "Company Profile Updated",
        description: "Your company information has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Contractor profile update mutation
  const updateContractorProfile = useMutation({
    mutationFn: async (data: ContractorFormValues) => {
      const res = await apiRequest("PATCH", `/api/contractor-profiles/${user?.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/contractor-profiles/${user?.id}`] });
      toast({
        title: "Contractor Profile Updated",
        description: "Your contractor information has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Submit handlers
  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfile.mutate(data);
  };
  
  const onCompanySubmit = (data: CompanyFormValues) => {
    updateCompanyProfile.mutate(data);
  };
  
  const onContractorSubmit = (data: ContractorFormValues) => {
    updateContractorProfile.mutate(data);
  };
  
  // Loading state
  if (profileLoading || specificProfileLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
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
          <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
          
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general">General Information</TabsTrigger>
              {user?.role === "company" && (
                <TabsTrigger value="company">Company Details</TabsTrigger>
              )}
              {user?.role === "contractor" && (
                <TabsTrigger value="contractor">Contractor Details</TabsTrigger>
              )}
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Information</CardTitle>
                  <CardDescription>
                    Update your profile information and contact details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-200">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                        ) : profile?.avatar ? (
                          <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <User className="h-12 w-12" />
                          </div>
                        )}
                      </div>
                      <label 
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 bg-sky-600 text-white rounded-full p-1 cursor-pointer"
                      >
                        <Upload className="h-4 w-4" />
                      </label>
                      <input 
                        id="avatar-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleAvatarChange}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">Profile Picture</h3>
                      <p className="text-sm text-slate-500 mb-2">PNG, JPG or GIF, max 2MB</p>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => document.getElementById('avatar-upload')?.click()}>
                          Change
                        </Button>
                        {avatarPreview && (
                          <Button size="sm" variant="outline" className="text-red-500" onClick={() => {
                            setAvatarFile(null);
                            setAvatarPreview(null);
                          }}>
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name or company name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio/Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell us about yourself or your company" 
                                className="resize-none" 
                                rows={4}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
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
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="contactEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Email</FormLabel>
                              <FormControl>
                                <Input placeholder="contact@example.com" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="contactPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="(123) 456-7890" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={profileForm.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input placeholder="https://www.example.com" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="mt-2"
                        disabled={updateProfile.isPending}
                      >
                        {updateProfile.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : "Save Changes"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            {user?.role === "company" && (
              <TabsContent value="company">
                <Card>
                  <CardHeader>
                    <CardTitle>Company Details</CardTitle>
                    <CardDescription>
                      Add specific information about your company
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...companyForm}>
                      <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-4">
                        <FormField
                          control={companyForm.control}
                          name="companySize"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Size</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select company size" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1-10 employees">1-10 employees</SelectItem>
                                  <SelectItem value="11-50 employees">11-50 employees</SelectItem>
                                  <SelectItem value="51-200 employees">51-200 employees</SelectItem>
                                  <SelectItem value="201-500 employees">201-500 employees</SelectItem>
                                  <SelectItem value="501-1000 employees">501-1000 employees</SelectItem>
                                  <SelectItem value="1000+ employees">1000+ employees</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={companyForm.control}
                          name="industry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Industry</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select industry" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Construction">Construction</SelectItem>
                                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                                  <SelectItem value="Transportation & Logistics">Transportation & Logistics</SelectItem>
                                  <SelectItem value="Energy & Utilities">Energy & Utilities</SelectItem>
                                  <SelectItem value="Real Estate">Real Estate</SelectItem>
                                  <SelectItem value="Technology">Technology</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={companyForm.control}
                          name="yearFounded"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Year Founded</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="e.g. 2010" 
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="mt-2"
                          disabled={updateCompanyProfile.isPending}
                        >
                          {updateCompanyProfile.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : "Save Company Details"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
            
            {user?.role === "contractor" && (
              <TabsContent value="contractor">
                <Card>
                  <CardHeader>
                    <CardTitle>Contractor Details</CardTitle>
                    <CardDescription>
                      Add specific information about your services and skills
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...contractorForm}>
                      <form onSubmit={contractorForm.handleSubmit(onContractorSubmit)} className="space-y-4">
                        <FormField
                          control={contractorForm.control}
                          name="specialization"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Specialization</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select specialization" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Electrical Contractor">Electrical Contractor</SelectItem>
                                  <SelectItem value="Plumbing Contractor">Plumbing Contractor</SelectItem>
                                  <SelectItem value="Painting Contractor">Painting Contractor</SelectItem>
                                  <SelectItem value="Construction Manager">Construction Manager</SelectItem>
                                  <SelectItem value="HVAC Contractor">HVAC Contractor</SelectItem>
                                  <SelectItem value="Roofing Contractor">Roofing Contractor</SelectItem>
                                  <SelectItem value="Transportation Provider">Transportation Provider</SelectItem>
                                  <SelectItem value="General Contractor">General Contractor</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={contractorForm.control}
                          name="yearsOfExperience"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Years of Experience</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="e.g. 5" 
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={contractorForm.control}
                          name="hourlyRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hourly Rate ($)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="e.g. 75.00" 
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
                          control={contractorForm.control}
                          name="skills"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Skills (comma-separated)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g. Commercial, Industrial, Maintenance" 
                                  value={field.value?.join(", ") || ""}
                                  onChange={(e) => {
                                    const skillsArray = e.target.value
                                      .split(",")
                                      .map(skill => skill.trim())
                                      .filter(skill => skill !== "");
                                    field.onChange(skillsArray);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="mt-2"
                          disabled={updateContractorProfile.isPending}
                        >
                          {updateContractorProfile.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : "Save Contractor Details"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
            
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your password and security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Change Password</h3>
                    
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <label htmlFor="current-password" className="text-sm font-medium">Current Password</label>
                        <Input id="current-password" type="password" />
                      </div>
                      
                      <div className="grid gap-2">
                        <label htmlFor="new-password" className="text-sm font-medium">New Password</label>
                        <Input id="new-password" type="password" />
                      </div>
                      
                      <div className="grid gap-2">
                        <label htmlFor="confirm-password" className="text-sm font-medium">Confirm New Password</label>
                        <Input id="confirm-password" type="password" />
                      </div>
                      
                      <Button>Update Password</Button>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-4">Account Settings</h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Delete Account</p>
                          <p className="text-sm text-slate-500">Permanently delete your account and all your data</p>
                        </div>
                        <Button variant="destructive">Delete Account</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
