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

  const supportLinks = [
    { href: "/support", label: "Help Center" },
    { href: "/support", label: "Live Chat" },
    { href: "/support", label: "FAQ" },
  ];

  const legalLinks = [
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/terms-conditions", label: "Terms & Conditions" },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Play className="text-white w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-white">EarnPay</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Revolutionizing video monetization by rewarding genuine engagement and creating sustainable income opportunities for users worldwide.
            </p>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Earn Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Earn</h3>
            <ul className="space-y-2">
              {earnLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Legal Combined */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support & Legal</h3>
            <ul className="space-y-2">
              {supportLinks.map((link, index) => (
                <li key={`${link.href}-${index}`}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400">
              © 2025 EarnPay Technologies Pvt Ltd. All rights reserved.
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>Platform Status: Online</span>
              <span>•</span>
              <span>200K+ Active Users</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}