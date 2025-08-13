import { Link } from "wouter";
import { Handshake, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 oimf-gradient rounded-full flex items-center justify-center">
                <Handshake className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">OIMF</h3>
                <p className="text-sm text-gray-400">Oldies International Monetary Foundation</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4">
              Empowering individuals and communities worldwide through accessible grant opportunities 
              and innovative funding solutions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/grants" className="text-gray-400 hover:text-white transition-colors">Find Grants</Link></li>
              <li><Link href="/apply" className="text-gray-400 hover:text-white transition-colors">Apply Now</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About OIMF</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><a href="mailto:support@oimf.org" className="text-gray-400 hover:text-white transition-colors">Email Support</a></li>
              <li><a href="tel:+15551234646" className="text-gray-400 hover:text-white transition-colors">Call Support</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2024 Oldies International Monetary Foundation. All rights reserved.</p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span className="text-sm text-gray-400">Secure payments powered by</span>
              <div className="flex space-x-3">
                <span className="text-oimf-gold">$</span>
                <span className="text-oimf-gold">£</span>
                <span className="text-oimf-gold">€</span>
                <span className="text-oimf-gold">¥</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
