import { Link } from "wouter";
import { Building } from "lucide-react";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="bg-emerald-900 text-emerald-100">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="mb-8 md:mb-0">
            <div className="flex items-center space-x-2 mb-4">
              <Building className="text-brand h-6 w-6" />
              <span className="font-bold text-xl text-white">ContractHub</span>
            </div>
            <p className="mb-6 text-emerald-200">Connecting companies and contractors for successful project outcomes.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-emerald-200 hover:text-brand transition">
                <FaFacebookF />
              </a>
              <a href="#" className="text-emerald-200 hover:text-brand transition">
                <FaTwitter />
              </a>
              <a href="#" className="text-emerald-200 hover:text-brand transition">
                <FaLinkedinIn />
              </a>
              <a href="#" className="text-emerald-200 hover:text-brand transition">
                <FaInstagram />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">For Companies</h3>
            <ul className="space-y-3">
              <li><Link href="/projects/post" className="hover:text-brand transition">Post a Project</Link></li>
              <li><Link href="/contractors" className="hover:text-brand transition">Find Contractors</Link></li>
              <li><Link href="/dashboard" className="hover:text-brand transition">Manage Projects</Link></li>
              <li><Link href="#" className="hover:text-brand transition">Company Resources</Link></li>
              <li><Link href="#" className="hover:text-brand transition">Success Stories</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">For Contractors</h3>
            <ul className="space-y-3">
              <li><Link href="/projects" className="hover:text-brand transition">Find Projects</Link></li>
              <li><Link href="/profile" className="hover:text-brand transition">Create Profile</Link></li>
              <li><Link href="#" className="hover:text-brand transition">Bidding Tips</Link></li>
              <li><Link href="#" className="hover:text-brand transition">Contractor Resources</Link></li>
              <li><Link href="#" className="hover:text-brand transition">Payment Protection</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="hover:text-brand transition">Contact Us</Link></li>
              <li><Link href="#" className="hover:text-brand transition">FAQ</Link></li>
              <li><Link href="#" className="hover:text-brand transition">Help Center</Link></li>
              <li><Link href="#" className="hover:text-brand transition">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-brand transition">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-emerald-800 mt-12 pt-6 text-center text-sm text-emerald-300">
          <p>&copy; {new Date().getFullYear()} ContractHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
