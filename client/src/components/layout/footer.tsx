import { Link } from "wouter";
import { Building } from "lucide-react";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="mb-8 md:mb-0">
            <div className="flex items-center space-x-2 mb-4">
              <Building className="text-sky-500 h-6 w-6" />
              <span className="font-bold text-xl text-white">ContractHub</span>
            </div>
            <p className="mb-4">Connecting companies and contractors for successful project outcomes.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-300 hover:text-sky-400">
                <FaFacebookF />
              </a>
              <a href="#" className="text-slate-300 hover:text-sky-400">
                <FaTwitter />
              </a>
              <a href="#" className="text-slate-300 hover:text-sky-400">
                <FaLinkedinIn />
              </a>
              <a href="#" className="text-slate-300 hover:text-sky-400">
                <FaInstagram />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">For Companies</h3>
            <ul className="space-y-2">
              <li><Link href="/projects/post" className="hover:text-sky-400 transition">Post a Project</Link></li>
              <li><Link href="/contractors" className="hover:text-sky-400 transition">Find Contractors</Link></li>
              <li><Link href="/dashboard" className="hover:text-sky-400 transition">Manage Projects</Link></li>
              <li><Link href="#" className="hover:text-sky-400 transition">Company Resources</Link></li>
              <li><Link href="#" className="hover:text-sky-400 transition">Success Stories</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">For Contractors</h3>
            <ul className="space-y-2">
              <li><Link href="/projects" className="hover:text-sky-400 transition">Find Projects</Link></li>
              <li><Link href="/profile" className="hover:text-sky-400 transition">Create Profile</Link></li>
              <li><Link href="#" className="hover:text-sky-400 transition">Bidding Tips</Link></li>
              <li><Link href="#" className="hover:text-sky-400 transition">Contractor Resources</Link></li>
              <li><Link href="#" className="hover:text-sky-400 transition">Payment Protection</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="hover:text-sky-400 transition">Contact Us</Link></li>
              <li><Link href="#" className="hover:text-sky-400 transition">FAQ</Link></li>
              <li><Link href="#" className="hover:text-sky-400 transition">Help Center</Link></li>
              <li><Link href="#" className="hover:text-sky-400 transition">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-sky-400 transition">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-700 mt-12 pt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} ContractHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
