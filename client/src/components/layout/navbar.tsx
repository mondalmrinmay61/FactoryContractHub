import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Building, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const isActive = (path: string) => {
    return location === path ? "text-brand-400" : "hover:text-brand-400";
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="bg-emerald-900 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <Building className="text-brand-400 h-6 w-6" />
            <Link href="/" className="font-bold text-xl">ContractHub</Link>
          </div>
          
          <div className="hidden md:flex space-x-8">
            <Link href="/projects" className={`transition ${isActive("/projects")}`}>
              Find Projects
            </Link>
            <Link href="/contractors" className={`transition ${isActive("/contractors")}`}>
              Find Contractors
            </Link>
            <Link href="/#how-it-works" className="hover:text-brand-400 transition">
              How It Works
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-brand">
                        {getInitials(user.username)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Link href="/dashboard" className="w-full">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/profile" className="w-full">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/auth" className="hover:text-brand-400 transition hidden md:inline">
                  Sign In
                </Link>
                <Link href="/auth" className="bg-brand hover:bg-brand-700 px-4 py-2 rounded-md transition text-white">
                  Get Started
                </Link>
              </>
            )}
            <button 
              className="md:hidden text-white focus:outline-none" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="flex flex-col space-y-3 pb-4">
              <Link 
                href="/projects" 
                className={`py-2 ${isActive("/projects")}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Find Projects
              </Link>
              <Link 
                href="/contractors" 
                className={`py-2 ${isActive("/contractors")}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Find Contractors
              </Link>
              <Link 
                href="/#how-it-works" 
                className="hover:text-brand-400 transition py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              {!user && (
                <Link 
                  href="/auth" 
                  className="hover:text-brand-400 transition py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
