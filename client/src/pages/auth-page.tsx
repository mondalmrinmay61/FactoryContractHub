import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, useSearch } from "wouter";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["company", "contractor"], {
    required_error: "Please select a role",
  }),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const defaultRole = params.get("role") === "contractor" ? "contractor" : "company";
  const defaultTab = params.get("tab") === "register" ? "register" : "login";

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: defaultRole,
    },
  });

  const onLoginSubmit = (data: LoginValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterValues) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl w-full space-y-8 flex flex-col md:flex-row gap-8">
          {/* Auth Forms */}
          <div className="md:w-1/2">
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                      Enter your credentials to access your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Enter your password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={loginMutation.isPending || isLoading}
                        >
                          {loginMutation.isPending ? "Logging in..." : "Sign In"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Create a new account</CardTitle>
                    <CardDescription>
                      Register to start posting projects or bidding as a contractor
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Choose a username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Enter your email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Create a password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>I am a</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select your role" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="company">Company</SelectItem>
                                  <SelectItem value="contractor">Contractor</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={registerMutation.isPending || isLoading}
                        >
                          {registerMutation.isPending ? "Creating Account..." : "Register"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Hero Section */}
          <div className="md:w-1/2 bg-gradient-to-r from-slate-900 to-sky-900 text-white rounded-lg px-8 py-12 flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-4">Welcome to ContractHub</h2>
            <p className="mb-6">The premier platform connecting companies with qualified contractors for industrial and construction projects.</p>
            
            <div className="space-y-4">
              <div className="flex">
                <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-white">
                  ✓
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium">Post projects and receive bids from qualified contractors</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-white">
                  ✓
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium">Find quality work opportunities that match your skills</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-white">
                  ✓
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium">Track project progress and manage payments through milestones</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-white">
                  ✓
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium">Build your reputation with reviews and ratings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
