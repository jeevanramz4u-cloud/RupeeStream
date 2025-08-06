import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Play, Users, Coins, Clock, CheckCircle, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Play className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-gray-900">EarnPay</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-primary">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-primary">How it Works</a>
              <a href="#faq" className="text-gray-600 hover:text-primary">FAQ</a>
              <a href="/privacy-policy" className="text-gray-600 hover:text-primary">Privacy</a>
              <a href="/terms-conditions" className="text-gray-600 hover:text-primary">Terms</a>
            </nav>

            <Button onClick={() => window.location.href = '/api/login'} className="bg-primary hover:bg-primary/90">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Earn Money by Watching Videos
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Turn your free time into income. Watch entertaining videos, complete daily targets, 
            and earn real money with our trusted platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90"
              onClick={() => window.location.href = '/signup'}
            >
              Sign Up to Start Earning
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => window.location.href = '/login'}
            >
              Already Have Account?
            </Button>
            <Button size="lg" variant="outline">
              <a href="/how-to-earn">Learn How It Works</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose EarnPay?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join thousands of users who are already earning money by watching videos on our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Coins className="text-secondary w-6 h-6" />
                </div>
                <CardTitle>Real Money Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Earn real rupees for every video you watch completely. No fake rewards or points.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="text-accent w-6 h-6" />
                </div>
                <CardTitle>Referral Bonuses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Earn ₹49 for every friend you refer who gets verified on our platform.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="text-primary w-6 h-6" />
                </div>
                <CardTitle>Flexible Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Watch videos anytime, anywhere. Meet the 8-hour daily target to maximize earnings.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="text-purple-600 w-6 h-6" />
                </div>
                <CardTitle>Weekly Payouts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Receive your earnings every Tuesday directly to your bank account.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="text-orange-600 w-6 h-6" />
                </div>
                <CardTitle>Secure & Verified</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Government ID verification ensures a safe and trusted earning environment.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Play className="text-secondary w-6 h-6" />
                </div>
                <CardTitle>Quality Content</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Watch curated, high-quality videos across various categories and topics.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 px-4 bg-neutral-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600">Simple steps to start earning money by watching videos</p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign Up & Verify</h3>
                <p className="text-gray-600">
                  Create your account, upload your government ID and bank details for verification.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Watch Videos</h3>
                <p className="text-gray-600">
                  Browse our video library and watch videos completely to earn money. No skipping allowed!
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Meet Daily Target</h3>
                <p className="text-gray-600">
                  Watch videos for 8 hours daily to maintain your account in good standing.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Paid</h3>
                <p className="text-gray-600">
                  Request weekly payouts every Tuesday and receive money directly to your bank account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">
              Get answers to common questions about earning money with EarnPay
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1" className="bg-gray-50 px-6 rounded-lg">
              <AccordionTrigger className="text-left">
                How much can I earn per video?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pt-2">
                Earnings per video vary based on video length and category. Typically, you can earn between ₹5-₹25 per video. 
                Longer videos and premium content offer higher earnings. All earnings are credited immediately after completing the full video.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="bg-gray-50 px-6 rounded-lg">
              <AccordionTrigger className="text-left">
                What is the 8-hour daily requirement?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pt-2">
                To maintain your account in good standing and maximize earnings, you need to watch videos for 8 hours daily. 
                This can be spread throughout the day. Failing to meet this requirement may result in account suspension until you catch up.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-gray-50 px-6 rounded-lg">
              <AccordionTrigger className="text-left">
                Can I skip or fast-forward videos?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pt-2">
                No, you must watch videos completely without skipping or fast-forwarding. Our system monitors viewing behavior 
                to ensure fair compensation. Attempting to skip content will not credit earnings and may result in account penalties.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="bg-gray-50 px-6 rounded-lg">
              <AccordionTrigger className="text-left">
                When do I get paid?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pt-2">
                Payouts are processed every Tuesday. You can request a payout once your earnings reach the minimum threshold. 
                Money is transferred directly to your verified bank account within 24-48 hours of payout processing.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="bg-gray-50 px-6 rounded-lg">
              <AccordionTrigger className="text-left">
                How does the referral program work?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pt-2">
                Share your unique referral code with friends and family. When someone signs up using your code and gets verified 
                (completes ID verification), you earn ₹49. There's no limit to how many people you can refer.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="bg-gray-50 px-6 rounded-lg">
              <AccordionTrigger className="text-left">
                Why do I need to verify my identity?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pt-2">
                Identity verification ensures a safe and legitimate earning environment for all users. It prevents fraud and 
                enables secure payouts. You need to upload a government-issued ID and bank details for verification before you can start earning.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7" className="bg-gray-50 px-6 rounded-lg">
              <AccordionTrigger className="text-left">
                What happens if I miss the daily target?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pt-2">
                If you don't meet the 8-hour daily target, your account may be suspended temporarily. You can reactivate it by 
                completing the missed hours. Consistent non-compliance may result in permanent account suspension.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8" className="bg-gray-50 px-6 rounded-lg">
              <AccordionTrigger className="text-left">
                Is there a minimum payout amount?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pt-2">
                Yes, the minimum payout amount is ₹100. Once your earnings reach this threshold, you can request a weekly payout. 
                This helps minimize transaction fees and ensures efficient payment processing.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-9" className="bg-gray-50 px-6 rounded-lg">
              <AccordionTrigger className="text-left">
                Can I use multiple devices?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pt-2">
                You can access your account from multiple devices, but you can only watch videos on one device at a time. 
                Our system tracks active sessions to prevent abuse and ensure fair earnings distribution.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-10" className="bg-gray-50 px-6 rounded-lg">
              <AccordionTrigger className="text-left">
                How do I contact support?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pt-2">
                You can contact our support team through the live chat feature available in your dashboard, or send us a message 
                through the Support page. Our team is available 24/7 to help with any questions or issues.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Earning?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Join our community and turn your free time into real income.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => window.location.href = '/api/login'}
          >
            Sign Up Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Company</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#about" className="text-sm text-gray-600 hover:text-primary">About Us</a></li>
                <li><a href="#contact" className="text-sm text-gray-600 hover:text-primary">Contact</a></li>
                <li><a href="#careers" className="text-sm text-gray-600 hover:text-primary">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Earn</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="/how-to-earn" className="text-sm text-gray-600 hover:text-primary">How to Earn</a></li>
                <li><a href="#referrals" className="text-sm text-gray-600 hover:text-primary">Referral Program</a></li>
                <li><a href="#payouts" className="text-sm text-gray-600 hover:text-primary">Payout Schedule</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Support</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#help" className="text-sm text-gray-600 hover:text-primary">Help Center</a></li>
                <li><a href="/support" className="text-sm text-gray-600 hover:text-primary">Live Chat</a></li>
                <li><a href="#faq" className="text-sm text-gray-600 hover:text-primary">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Legal</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="/privacy-policy" className="text-sm text-gray-600 hover:text-primary">Privacy Policy</a></li>
                <li><a href="/terms-conditions" className="text-sm text-gray-600 hover:text-primary">Terms & Conditions</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Play className="text-white w-4 h-4" />
                </div>
                <span className="text-lg font-bold text-gray-900">EarnPay</span>
              </div>
              <p className="text-sm text-gray-500">© 2024 EarnPay. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
