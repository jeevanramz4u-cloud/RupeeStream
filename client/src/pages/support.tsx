import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  HelpCircle,
  Clock,
  Users,
  Shield,
  Wallet,
  CheckCircle,
  Coins,
  Play
} from "lucide-react";

export default function Support() {
  const faqItems = [
    {
      question: "What bonuses do I get when signing up?",
      answer: "You receive a ₹1,000 signup bonus when you create your account and complete the registration process. This bonus is credited to your account immediately after successful signup."
    },
    {
      question: "How do I earn money on EarnPay?",
      answer: "You earn money by watching videos completely without skipping or fast-forwarding. Each video has a specific earning amount that gets credited to your account once you finish watching it. Additionally, you earn ₹10 every hour as a login bonus just for being active on the platform."
    },
    {
      question: "What is the hourly login bonus?",
      answer: "You earn ₹10 every hour simply by logging into your account and staying active on the platform. This bonus is automatically credited to your account for each hour you remain logged in."
    },
    {
      question: "What fees are required on the platform?",
      answer: "There are two required fees: (1) ₹99 KYC processing fee - mandatory for document verification and to access payout features, and (2) ₹49 account reactivation fee - required if your account gets suspended for not meeting daily watch time targets for 3 consecutive days."
    },
    {
      question: "What is the daily target requirement?",
      answer: "You must watch videos for a minimum of 8 hours daily to maintain your account in good standing. Failing to meet this requirement for 3 consecutive days may result in account suspension, which requires a ₹49 reactivation fee."
    },
    {
      question: "How does the referral program work?",
      answer: "Share your unique referral code with friends. When they sign up and complete their KYC verification, you earn ₹49. There's no limit to how many people you can refer."
    },
    {
      question: "When do I get paid?",
      answer: "Payouts are processed weekly on Tuesdays. You can request a payout anytime after completing KYC verification, and it will be included in the next weekly batch."
    },
    {
      question: "What verification documents do I need?",
      answer: "You need to upload a government-issued ID (Aadhaar, Passport, or Driver's License) and provide your bank account details for verification and payouts. A ₹99 processing fee is required to complete the KYC verification."
    },
    {
      question: "Can I skip or fast-forward videos?",
      answer: "No, you cannot skip, fast-forward, or rewind videos. You must watch the complete video from start to finish to earn money."
    },
    {
      question: "How long does verification take?",
      answer: "Account verification typically takes 24-48 hours after payment of the ₹99 processing fee. Our admin team reviews all submitted documents manually to ensure security."
    },
    {
      question: "What happens if I don't meet the daily target?",
      answer: "If you fail to meet the 8-hour daily target for 3 consecutive days, your account will be suspended. To reactivate it, you'll need to pay a ₹49 reactivation fee."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30">
      <Header />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 safe-area-padding">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4 leading-tight tracking-tight">Help & Support</h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed font-medium">
            Get professional help with your EarnPay account, earnings, and business operations
          </p>
        </div>

        {/* Contact Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="text-center touch-manipulation">
            <CardContent className="pt-4 sm:pt-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <MessageCircle className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Live Chat</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                Get instant help from our support team via live chat.
              </p>
              <p className="text-xs text-gray-500">Available 24/7</p>
            </CardContent>
          </Card>

          <Card className="text-center touch-manipulation">
            <CardContent className="pt-4 sm:pt-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Mail className="text-secondary w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Email Support</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                Send us an email for detailed inquiries.
              </p>
              <Button variant="outline" size="sm" className="touch-manipulation text-xs sm:text-sm">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                support@earnpay.com
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center touch-manipulation sm:col-span-2 lg:col-span-1">
            <CardContent className="pt-4 sm:pt-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Phone className="text-accent w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Phone Support</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                Call us for urgent issues or account problems.
              </p>
              <Button variant="outline" size="sm" className="touch-manipulation text-xs sm:text-sm">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                +91-XXXX-XXXX
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Help Topics */}
        <Card className="mb-6 sm:mb-8 border border-gray-100 shadow-lg">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Quick Help Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100 hover:shadow-md transition-all duration-300 group cursor-pointer">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                    <Wallet className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="font-semibold text-gray-900 text-base">Earnings & Payouts</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">Questions about earnings tracking, payout schedules, and withdrawal processes</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 hover:shadow-md transition-all duration-300 group cursor-pointer">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-semibold text-gray-900 text-base">Account Verification</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">Help with KYC document upload, verification status, and approval process</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100 hover:shadow-md transition-all duration-300 group cursor-pointer">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="font-semibold text-gray-900 text-base">Referral Program</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">Questions about referral codes, bonuses, and tracking referred users</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100 hover:shadow-md transition-all duration-300 group cursor-pointer">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <span className="font-semibold text-gray-900 text-base">Daily Targets</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">Help with 8-hour daily requirements, suspension, and reactivation</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section - Redesigned to match landing page */}
        <section className="py-8 sm:py-12 px-4 bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20 relative overflow-hidden rounded-3xl border border-gray-100 shadow-xl">
          {/* Background Decorations */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-primary to-blue-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-64 h-64 bg-gradient-to-tr from-purple-400 to-pink-400 rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="text-center mb-8 sm:mb-12">
              {/* FAQ Icon Badge */}
              <div className="flex items-center justify-center mb-6">
                <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full">
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-lg">
                    <HelpCircle className="w-8 h-8" />
                  </div>
                </div>
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-6 leading-tight tracking-tight">
                Frequently Asked
                <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent font-black">
                  Questions
                </span>
              </h2>
              <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
                Get instant answers to common questions about your EarnPay professional earnings platform
              </p>
              
              {/* Decorative divider */}
              <div className="flex items-center justify-center mt-8 mb-4">
                <div className="h-1 w-20 bg-gradient-to-r from-primary to-blue-600 rounded-full"></div>
                <div className="mx-4 w-3 h-3 bg-gradient-to-br from-primary to-blue-600 rounded-full"></div>
                <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-primary rounded-full"></div>
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-3 md:space-y-4">
              {faqItems.map((item, index) => {
                const iconConfigs = [
                  { icon: Coins, bgClass: "bg-gradient-to-br from-green-100 to-emerald-100", iconClass: "text-green-600" },
                  { icon: Play, bgClass: "bg-gradient-to-br from-blue-100 to-indigo-100", iconClass: "text-blue-600" },
                  { icon: Clock, bgClass: "bg-gradient-to-br from-orange-100 to-red-100", iconClass: "text-orange-600" },
                  { icon: Wallet, bgClass: "bg-gradient-to-br from-purple-100 to-pink-100", iconClass: "text-purple-600" },
                  { icon: Shield, bgClass: "bg-gradient-to-br from-indigo-100 to-blue-100", iconClass: "text-indigo-600" },
                  { icon: Users, bgClass: "bg-gradient-to-br from-pink-100 to-rose-100", iconClass: "text-pink-600" },
                  { icon: CheckCircle, bgClass: "bg-gradient-to-br from-emerald-100 to-green-100", iconClass: "text-emerald-600" },
                  { icon: HelpCircle, bgClass: "bg-gradient-to-br from-cyan-100 to-blue-100", iconClass: "text-cyan-600" },
                  { icon: MessageCircle, bgClass: "bg-gradient-to-br from-violet-100 to-purple-100", iconClass: "text-violet-600" },
                  { icon: Phone, bgClass: "bg-gradient-to-br from-amber-100 to-yellow-100", iconClass: "text-amber-600" },
                  { icon: Mail, bgClass: "bg-gradient-to-br from-rose-100 to-pink-100", iconClass: "text-rose-600" }
                ];
                const config = iconConfigs[index % iconConfigs.length];
                const IconComponent = config.icon;
                
                return (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index + 1}`} 
                    className="bg-white/80 backdrop-blur-sm border border-gray-100 px-6 md:px-8 py-2 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:text-primary transition-colors py-6 group-hover:text-blue-600">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${config.bgClass} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <IconComponent className={`w-5 h-5 ${config.iconClass}`} />
                        </div>
                        {item.question}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700 pt-2 pb-4 leading-relaxed text-base">
                      <div className="pl-10 md:pl-13">
                        {item.answer}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </section>

        {/* Support Hours */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-8 text-center">
              <div>
                <h3 className="font-semibold text-gray-900">Live Chat</h3>
                <p className="text-sm text-gray-600">24/7 Available</p>
              </div>
              <div className="h-8 w-px bg-gray-300"></div>
              <div>
                <h3 className="font-semibold text-gray-900">Email Support</h3>
                <p className="text-sm text-gray-600">Response within 24 hours</p>
              </div>
              <div className="h-8 w-px bg-gray-300"></div>
              <div>
                <h3 className="font-semibold text-gray-900">Phone Support</h3>
                <p className="text-sm text-gray-600">Mon-Fri 9 AM - 6 PM</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
      
      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}
