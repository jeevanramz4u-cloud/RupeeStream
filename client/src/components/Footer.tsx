import { Link } from "wouter";
import { Play, Mail, Phone, MapPin, ChevronDown, ChevronUp, Heart, IndianRupee } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Footer() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [isDonateDialogOpen, setIsDonateDialogOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleDonation = async () => {
    if (!donationAmount || !donorName || !donorEmail) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(donationAmount);
    if (isNaN(amount) || amount < 1) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid donation amount (minimum ₹1).",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await apiRequest("POST", "/api/donate/create-payment", {
        amount: amount,
        donorName: donorName,
        donorEmail: donorEmail,
      });
      const result = await response.json();

      if (!response.ok) {
        throw result;
      }

      toast({
        title: "Redirecting to Payment",
        description: "Opening Cashfree payment gateway...",
      });

      // Redirect to Cashfree payment page
      window.open(result.paymentUrl, '_blank');
      
      // Reset form and close dialog
      setDonationAmount("");
      setDonorName("");
      setDonorEmail("");
      setIsDonateDialogOpen(false);
      
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to create donation payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const predefinedAmounts = [50, 100, 250, 500, 1000];

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
    { href: "/shipping-policy", label: "Shipping Policy" },
    { href: "/refund-policy", label: "Refund Policy" },
  ];

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Mobile: Collapsible Sections, Desktop: Grid Layout */}
        <div className="block sm:hidden">
          {/* Company Info */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <IndianRupee className="text-white w-4 h-4" />
              </div>
              <span className="text-xl font-black text-gray-900 tracking-tight">Innovative Task Earn</span>
            </div>
            <p className="text-gray-600 mb-4 leading-relaxed text-sm">
              Transform your free time into real income.
            </p>
          </div>

          {/* Collapsible Sections for Mobile */}
          <div className="space-y-4">
            {/* Company Section */}
            <div className="border-b border-gray-100 pb-4">
              <button
                onClick={() => toggleSection('company')}
                className="flex items-center justify-between w-full text-left py-3 px-1 touch-manipulation hover:bg-gray-50 rounded-lg transition-colors"
              >
                <h3 className="text-gray-900 font-bold text-base">Company</h3>
                {openSections.company ? 
                  <ChevronUp className="w-4 h-4 text-gray-500" /> : 
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                }
              </button>
              {openSections.company && (
                <ul className="mt-3 space-y-2">
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
              )}
            </div>

            {/* Earn Money Section */}
            <div className="border-b border-gray-100 pb-4">
              <button
                onClick={() => toggleSection('earn')}
                className="flex items-center justify-between w-full text-left py-3 px-1 touch-manipulation hover:bg-gray-50 rounded-lg transition-colors"
              >
                <h3 className="text-gray-900 font-bold text-base">Earn Money</h3>
                {openSections.earn ? 
                  <ChevronUp className="w-4 h-4 text-gray-500" /> : 
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                }
              </button>
              {openSections.earn && (
                <ul className="mt-3 space-y-2">
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
              )}
            </div>

            {/* Legal Section */}
            <div className="border-b border-gray-100 pb-4">
              <button
                onClick={() => toggleSection('legal')}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="text-gray-900 font-bold text-base">Legal</h3>
                {openSections.legal ? 
                  <ChevronUp className="w-4 h-4 text-gray-500" /> : 
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                }
              </button>
              {openSections.legal && (
                <ul className="mt-3 space-y-2">
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
              )}
            </div>
          </div>
        </div>

        {/* Desktop: Grid Layout */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
                <IndianRupee className="text-white w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Innovative Task Earn</span>
            </div>
            <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base max-w-md">
              Transform your free time into real income.
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

        {/* Donation Section */}
        <div className="border-t border-gray-200 mt-6 sm:mt-8 lg:mt-12 pt-4 sm:pt-6 lg:pt-8">
          <div className="flex flex-col items-center text-center mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Support Our Mission</h3>
            <p className="text-sm text-gray-600 mb-4 max-w-md">Help us grow and serve more users by making a donation to support our platform.</p>
            
            <Dialog open={isDonateDialogOpen} onOpenChange={setIsDonateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300">
                  <Heart className="w-4 h-4 mr-2" />
                  Donate Now
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-center">
                    Support Innovative Task Earn
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="donor-name" className="text-sm font-medium">Full Name *</Label>
                    <Input
                      id="donor-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="donor-email" className="text-sm font-medium">Email *</Label>
                    <Input
                      id="donor-email"
                      type="email"
                      placeholder="Enter your email address"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="amount" className="text-sm font-medium">Donation Amount (₹) *</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2 mb-3">
                      {predefinedAmounts.map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="sm"
                          onClick={() => setDonationAmount(amount.toString())}
                          className={`${donationAmount === amount.toString() ? 'bg-primary text-white border-primary' : ''}`}
                        >
                          ₹{amount}
                        </Button>
                      ))}
                    </div>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter custom amount"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      min="1"
                      className="mt-1"
                    />
                  </div>
                  
                  <Button
                    onClick={handleDonation}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold"
                  >
                    {isProcessing ? (
                      <div className="flex items-center">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      <>
                        <Heart className="w-4 h-4 mr-2" />
                        Donate ₹{donationAmount || "0"}
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    Secure payment powered by Cashfree. Your donation helps us improve our platform and serve more users.
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 pt-4 sm:pt-6 lg:pt-8">
          <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
            <div className="flex flex-col items-center space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center">
                  <IndianRupee className="text-white w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <span className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">Innovative Task Earn</span>
              </div>
              <span className="hidden sm:inline text-sm text-gray-500">•</span>
              <span className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">Task Completion Platform</span>
            </div>
            <div className="flex flex-col items-center space-y-2 text-center lg:flex-row lg:items-center lg:gap-4 lg:text-right">
              <span className="text-xs sm:text-sm text-gray-500">© 2024 Innovative Grow Solutions Pvt. Ltd. All rights reserved.</span>
              <span className="hidden lg:block text-gray-400">•</span>
              <span className="text-xs sm:text-sm text-gray-500 font-medium">200K+ Active Users</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}