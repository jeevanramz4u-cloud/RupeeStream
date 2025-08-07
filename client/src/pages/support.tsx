import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  HelpCircle,
  Clock,
  Users,
  Shield,
  Wallet
} from "lucide-react";

export default function Support() {
  const faqItems = [
    {
      question: "How do I earn money on EarnPay?",
      answer: "You earn money by watching videos completely without skipping or fast-forwarding. Each video has a specific earning amount that gets credited to your account once you finish watching it."
    },
    {
      question: "What is the daily target requirement?",
      answer: "You must watch videos for a minimum of 8 hours daily to maintain your account in good standing. Failing to meet this requirement may result in account suspension."
    },
    {
      question: "How does the referral program work?",
      answer: "Share your unique referral code with friends. When they sign up and get verified, you earn ₹49. There's no limit to how many people you can refer."
    },
    {
      question: "When do I get paid?",
      answer: "Payouts are processed weekly on Tuesdays. You can request a payout anytime, and it will be included in the next weekly batch."
    },
    {
      question: "What verification documents do I need?",
      answer: "You need to upload a government-issued ID (Aadhaar, Passport, or Driver's License) and provide your bank account details for verification and payouts."
    },
    {
      question: "Can I skip or fast-forward videos?",
      answer: "No, you cannot skip, fast-forward, or rewind videos. You must watch the complete video from start to finish to earn money."
    },
    {
      question: "How long does verification take?",
      answer: "Account verification typically takes 24-48 hours. Our admin team reviews all submitted documents manually to ensure security."
    },
    {
      question: "What happens if I don't meet the daily target?",
      answer: "If you consistently fail to meet the 8-hour daily target, your account may be suspended. It's important to maintain regular viewing activity."
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 safe-area-padding">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">Help & Support</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Get help with your EarnPay account, earnings, and any questions you may have.
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
        <Card className="mb-6 sm:mb-8">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Quick Help Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Button variant="outline" className="justify-start h-auto p-3 sm:p-4 touch-manipulation mobile-tap-target">
                <div className="flex flex-col items-start w-full">
                  <div className="flex items-center mb-1 sm:mb-2">
                    <Wallet className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base">Earnings & Payouts</span>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500 text-left">Questions about earnings and withdrawals</span>
                </div>
              </Button>

              <Button variant="outline" className="justify-start h-auto p-3 sm:p-4 touch-manipulation mobile-tap-target">
                <div className="flex flex-col items-start w-full">
                  <div className="flex items-center mb-1 sm:mb-2">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-secondary flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base">Account Verification</span>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500 text-left">Help with document upload and verification</span>
                </div>
              </Button>

              <Button variant="outline" className="justify-start h-auto p-3 sm:p-4 touch-manipulation mobile-tap-target">
                <div className="flex flex-col items-start w-full">
                  <div className="flex items-center mb-1 sm:mb-2">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600 flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base">Referral Program</span>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500 text-left">Questions about referrals and bonuses</span>
                </div>
              </Button>

              <Button variant="outline" className="justify-start h-auto p-3 sm:p-4 touch-manipulation mobile-tap-target">
                <div className="flex flex-col items-start w-full">
                  <div className="flex items-center mb-1 sm:mb-2">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-accent flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base">Daily Targets</span>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500 text-left">Help with watching requirements</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 sm:space-y-6">
              {faqItems.map((item, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 sm:pb-6 last:border-b-0 last:pb-0">
                  <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base leading-relaxed">{item.question}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{item.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
