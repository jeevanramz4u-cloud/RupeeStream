import { Link } from "wouter";
import { Play, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const companyLinks = [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/careers", label: "Careers" },
  ];

  const earnLinks = [
    { href: "/how-to-earn", label: "How to Earn" },
    { href: "/referral-program", label: "Referral Program" },
    { href: "/payout-schedule", label: "Payout Schedule" },
  ];



  const legalLinks = [
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/terms-conditions", label: "Terms & Conditions" },
  ];

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Play className="text-white w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-gray-900">EarnPay</span>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed max-w-md">
              Transform your free time into real income. Join thousands of users who are already earning money by watching videos on our platform.
            </p>
            <div className="flex space-x-4">
              <div className="bg-gray-50 hover:bg-gray-100 p-3 rounded-lg transition-colors cursor-pointer">
                <span className="text-sm font-medium text-gray-700">Trusted Platform</span>
              </div>
              <div className="bg-gray-50 hover:bg-gray-100 p-3 rounded-lg transition-colors cursor-pointer">
                <span className="text-sm font-medium text-gray-700">Secure Payments</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-gray-900 font-bold text-lg mb-6">Company</h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-gray-600 hover:text-primary transition-colors text-sm font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Earn Links */}
          <div>
            <h3 className="text-gray-900 font-bold text-lg mb-6">Earn Money</h3>
            <ul className="space-y-3">
              {earnLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-gray-600 hover:text-primary transition-colors text-sm font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-gray-900 font-bold text-lg mb-6">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-gray-600 hover:text-primary transition-colors text-sm font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Play className="text-white w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-gray-900">EarnPay</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-600">Video Monetization Platform</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-500">
              <span>© 2024 EarnPay Technologies. All rights reserved.</span>
              <span className="hidden sm:block">•</span>
              <span>200K+ Active Users</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}