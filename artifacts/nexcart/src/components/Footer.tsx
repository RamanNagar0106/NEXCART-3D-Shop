import { Link } from 'wouter';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import logo from '@assets/ChatGPT_Image_Jul_1,_2026,_06_59_33_PM_1782956871976.png';

export function Footer() {
  return (
    <footer className="bg-[#0a1128] text-gray-300 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Col */}
          <div className="space-y-6">
            <img src={logo} alt="NEXCART" className="h-10 brightness-0 invert opacity-90" />
            <p className="text-sm text-gray-400">
              The next generation of online shopping. Experience premium retail with futuristic tech and lightning-fast delivery.
            </p>
            <div className="flex gap-4">
              <a href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-secondary hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-secondary hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-secondary hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 relative inline-block">
              Quick Links
              <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-secondary rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              <li><Link href="/products" className="hover:text-secondary transition-colors">All Products</Link></li>
              <li><Link href="/products?isDeal=true" className="hover:text-secondary transition-colors">Deals of the Day</Link></li>
              <li><Link href="/orders" className="hover:text-secondary transition-colors">Track Order</Link></li>
              <li><Link href="/wishlist" className="hover:text-secondary transition-colors">Wishlist</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 relative inline-block">
              Categories
              <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-secondary rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              <li><Link href="/products?category=electronics" className="hover:text-secondary transition-colors">Electronics</Link></li>
              <li><Link href="/products?category=fashion" className="hover:text-secondary transition-colors">Fashion</Link></li>
              <li><Link href="/products?category=home" className="hover:text-secondary transition-colors">Home Appliances</Link></li>
              <li><Link href="/products?category=sports" className="hover:text-secondary transition-colors">Sports & Fitness</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 relative inline-block">
              Contact Us
              <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-secondary rounded-full"></span>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                <span className="text-sm">123 Nexus Avenue, Indore District, Indore 452010</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-secondary shrink-0" />
                <span className="text-sm">+91 8461045420</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-secondary shrink-0" />
                <span className="text-sm">support@nexcart.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© 2026 NEXCART. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Returns</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
