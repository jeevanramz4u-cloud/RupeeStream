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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
                <Play className="text-white w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-gray-900">EarnPay</span>
            </div>
            <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base max-w-md">
              Transform your free time into real income. Join thousands of users who are already earning money by watching videos on our platform.
            </p>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-gray-900 font-bold text-base sm:text-lg mb-3 sm:mb-6">Company</h3>
            <ul className="space-y-2 sm:space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-gray-600 hover:text-primary transition-colors text-sm font-medium block py-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Earn Links */}
          <div>
            <h3 className="text-gray-900 font-bold text-base sm:text-lg mb-3 sm:mb-6">Earn Money</h3>
            <ul className="space-y-2 sm:space-y-3">
              {earnLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-gray-600 hover:text-primary transition-colors text-sm font-medium block py-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-gray-900 font-bold text-base sm:text-lg mb-3 sm:mb-6">Legal</h3>
            <ul className="space-y-2 sm:space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-gray-600 hover:text-primary transition-colors text-sm font-medium block py-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 mt-6 sm:mt-8 lg:mt-12 pt-4 sm:pt-6 lg:pt-8">
          <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
            <div className="flex flex-col items-center space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Play className="text-white w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <span className="text-lg sm:text-xl font-bold text-gray-900">EarnPay</span>
              </div>
              <span className="hidden sm:inline text-sm text-gray-500">•</span>
              <span className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">Video Monetization Platform</span>
            </div>
            <div className="flex flex-col items-center space-y-2 text-center lg:flex-row lg:items-center lg:gap-4 lg:text-right">
              <span className="text-xs sm:text-sm text-gray-500">© 2024 EarnPay Technologies. All rights reserved.</span>
              <span className="hidden lg:block text-gray-400">•</span>
              <span className="text-xs sm:text-sm text-gray-500 font-medium">200K+ Active Users</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}