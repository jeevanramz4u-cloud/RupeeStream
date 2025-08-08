import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Play, Users, Coins, Clock, CheckCircle, Shield, User } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-neutral-50 safe-area-padding">
      <Header />

      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-24 px-3 sm:px-4 overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20">
        {/* Background Decorations */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-10 left-10 w-40 h-40 bg-primary rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Logo Badge */}
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-8">
            <div className="bg-gradient-to-br from-primary to-blue-600 text-white p-4 rounded-full shadow-lg">
              <Play className="w-8 h-8" />
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight">
            Earn Money by<br />
            <span className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Watching Videos
            </span>
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-10 max-w-4xl mx-auto leading-relaxed">
            Turn your free time into income. Watch entertaining videos, complete daily targets, 
            and earn real money with our trusted platform.
          </p>
          
          {/* Bonus Features */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 mb-8 sm:mb-12 max-w-4xl mx-auto shadow-lg border border-gray-100">
            <div className="grid sm:grid-cols-2 gap-6 items-center justify-center">
              <div className="flex items-center gap-4 justify-center sm:justify-start">
                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center shadow-sm">
                  <Coins className="w-7 h-7 text-green-600" />
                </div>
                <div className="text-left">
                  <span className="text-2xl font-bold text-green-700 block">₹1,000</span>
                  <span className="text-gray-600">Signup Bonus</span>
                </div>
              </div>
              <div className="flex items-center gap-4 justify-center sm:justify-start">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center shadow-sm">
                  <Clock className="w-7 h-7 text-blue-600" />
                </div>
                <div className="text-left">
                  <span className="text-2xl font-bold text-blue-700 block">₹10/Hour</span>
                  <span className="text-gray-600">Login Bonus</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center max-w-2xl mx-auto">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 h-14 sm:h-16 text-lg font-semibold px-8 sm:px-12 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 touch-manipulation"
              onClick={() => window.location.href = '/signup'}
            >
              Start Earning Now
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="h-14 sm:h-16 text-lg border-2 border-gray-300 hover:bg-gray-50 hover:border-primary/50 px-8 sm:px-12 rounded-2xl transition-all duration-300 touch-manipulation"
              onClick={() => window.location.href = '/login'}
            >
              Already Have Account?
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-12 sm:mt-16 flex flex-wrap items-center justify-center gap-8 opacity-60">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">100% Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Verified Platform</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">200K+ Users</span>
            </div>
          </div>
          <div className="mt-4 sm:hidden">
            <Button size="sm" variant="outline" className="text-xs touch-manipulation rounded-xl">
              <a href="#how-it-works">Learn How It Works</a>
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
      <section id="how-it-works" className="py-16 sm:py-20 lg:py-24 px-4 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-blue-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-6">
              <div className="bg-primary text-white p-3 rounded-full">
                <Play className="w-6 h-6" />
              </div>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              How It Works
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Simple steps to start earning money by watching videos
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Step 1 */}
            <div className="relative group">
              <div className="hidden lg:block absolute top-12 left-full w-12 h-0.5 bg-gradient-to-r from-primary to-primary/30 z-0"></div>
              <div className="relative bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group-hover:border-primary/20">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">1</span>
                </div>
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <User className="text-green-600 w-8 h-8 lg:w-10 lg:h-10" />
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 text-center">Sign Up & Verify</h3>
                <p className="text-gray-600 text-center leading-relaxed">Create your account, upload your government ID and bank details for verification.</p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl"></div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="hidden lg:block absolute top-12 left-full w-12 h-0.5 bg-gradient-to-r from-primary to-primary/30 z-0"></div>
              <div className="relative bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group-hover:border-primary/20">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">2</span>
                </div>
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Play className="text-blue-600 w-8 h-8 lg:w-10 lg:h-10" />
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 text-center">Watch Videos</h3>
                <p className="text-gray-600 text-center leading-relaxed">Browse our video library and watch videos completely to earn money. No skipping allowed!</p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl"></div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="hidden lg:block absolute top-12 left-full w-12 h-0.5 bg-gradient-to-r from-primary to-primary/30 z-0"></div>
              <div className="relative bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group-hover:border-primary/20">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">3</span>
                </div>
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="text-orange-600 w-8 h-8 lg:w-10 lg:h-10" />
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 text-center">Meet Daily Target</h3>
                <p className="text-gray-600 text-center leading-relaxed">Watch videos for 8 hours daily to maintain your account in good standing.</p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl"></div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative group">
              <div className="relative bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group-hover:border-primary/20">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">4</span>
                </div>
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Coins className="text-purple-600 w-8 h-8 lg:w-10 lg:h-10" />
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 text-center">Get Paid</h3>
                <p className="text-gray-600 text-center leading-relaxed">Request weekly payouts every Tuesday and receive money directly to your bank account.</p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl"></div>
              </div>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-lg font-semibold text-gray-900">Ready to start earning?</span>
              </div>
              <Link href="/signup">
                <Button size="lg" className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Get Started Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 sm:py-20 lg:py-24 px-4 bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-primary to-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-gradient-to-tr from-purple-400 to-pink-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            {/* FAQ Icon Badge */}
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-8">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-lg">
                <CheckCircle className="w-8 h-8" />
              </div>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Frequently Asked
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Get answers to common questions about earning money with EarnPay
            </p>
            
            {/* Decorative divider */}
            <div className="flex items-center justify-center mt-8 mb-4">
              <div className="h-1 w-20 bg-gradient-to-r from-primary to-blue-600 rounded-full"></div>
              <div className="mx-4 w-3 h-3 bg-gradient-to-br from-primary to-blue-600 rounded-full"></div>
              <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-primary rounded-full"></div>
            </div>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-6">
            <AccordionItem value="item-1" className="bg-white/80 backdrop-blur-sm border border-gray-100 px-8 py-2 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group">
              <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:text-primary transition-colors py-6 group-hover:text-blue-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Coins className="w-5 h-5 text-green-600" />
                  </div>
                  How much can I earn per video?
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 pb-6 leading-relaxed text-base">
                <div className="pl-13">
                  Earnings per video vary based on video length and category. Typically, you can earn between <span className="font-semibold text-green-600">₹5-₹25 per video</span>. 
                  Longer videos and premium content offer higher earnings. All earnings are credited immediately after completing the full video.
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="bg-white/80 backdrop-blur-sm border border-gray-100 px-8 py-2 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group">
              <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:text-primary transition-colors py-6 group-hover:text-blue-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  What bonuses can I earn?
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 pb-6 leading-relaxed text-base">
                <div className="pl-13 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div><strong className="text-green-600">Welcome Bonus:</strong> Get <span className="font-semibold">₹1,000 signup bonus</span> when you join and complete verification.</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div><strong className="text-blue-600">Hourly Login Bonus:</strong> Earn <span className="font-semibold">₹10 for every hour</span> you stay logged in and active.</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div><strong className="text-purple-600">Referral Bonus:</strong> Earn <span className="font-semibold">₹49 for every friend</span> you refer who completes KYC verification.</div>
                  </div>
                  <div className="mt-4 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                    <span className="text-sm text-gray-600">All bonuses are automatically credited to your account and can be withdrawn with regular earnings.</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-white/80 backdrop-blur-sm border border-gray-100 px-8 py-2 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group">
              <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:text-primary transition-colors py-6 group-hover:text-blue-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  What are the fees I need to pay?
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 pb-6 leading-relaxed text-base">
                <div className="pl-13 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div><strong className="text-blue-600">KYC Processing Fee:</strong> One-time <span className="font-semibold">₹99 fee</span> for document verification and account activation.</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div><strong className="text-orange-600">Reactivation Fee:</strong> <span className="font-semibold">₹49 fee</span> to reactivate suspended accounts for missing daily targets.</div>
                  </div>
                  <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                    <span className="text-sm text-gray-600">These fees ensure platform security and help maintain a genuine user base.</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="bg-white/80 backdrop-blur-sm border border-gray-100 px-8 py-2 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group">
              <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:text-primary transition-colors py-6 group-hover:text-blue-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 text-indigo-600" />
                  </div>
                  Can I skip or fast-forward videos?
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 pb-6 leading-relaxed text-base">
                <div className="pl-13">
                  No, you must watch videos completely without skipping or fast-forwarding. Our system monitors viewing behavior 
                  to ensure fair compensation. Attempting to skip content will not credit earnings and may result in account penalties.
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="bg-white/80 backdrop-blur-sm border border-gray-100 px-8 py-2 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group">
              <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:text-primary transition-colors py-6 group-hover:text-blue-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  When do I get paid?
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 pb-6 leading-relaxed text-base">
                <div className="pl-13">
                  Payouts are processed every <span className="font-semibold text-green-600">Tuesday</span>. You can request a payout once your earnings reach the minimum threshold. 
                  Money is transferred directly to your verified bank account within 24-48 hours of payout processing.
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="bg-white/80 backdrop-blur-sm border border-gray-100 px-8 py-2 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group">
              <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:text-primary transition-colors py-6 group-hover:text-blue-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5 text-pink-600" />
                  </div>
                  How does the referral program work?
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 pb-6 leading-relaxed text-base">
                <div className="pl-13">
                  Share your unique referral code with friends and family. When someone signs up using your code and gets verified 
                  (completes ID verification), you earn <span className="font-semibold text-pink-600">₹49</span>. There's no limit to how many people you can refer.
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7" className="bg-white/80 backdrop-blur-sm border border-gray-100 px-8 py-2 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group">
              <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:text-primary transition-colors py-6 group-hover:text-blue-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  What is the 8-hour daily requirement?
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 pb-6 leading-relaxed text-base">
                <div className="pl-13">
                  To maintain your account in good standing and maximize earnings, you need to watch videos for <span className="font-semibold text-yellow-600">8 hours daily</span>. 
                  This can be spread throughout the day. Missing this target for 3 consecutive days may result in account suspension.
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8" className="bg-white/80 backdrop-blur-sm border border-gray-100 px-8 py-2 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group">
              <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:text-primary transition-colors py-6 group-hover:text-blue-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Coins className="w-5 h-5 text-teal-600" />
                  </div>
                  Is there a minimum payout amount?
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 pb-6 leading-relaxed text-base">
                <div className="pl-13">
                  Yes, the minimum payout amount is <span className="font-semibold text-teal-600">₹100</span>. Once your earnings reach this threshold, you can request a weekly payout. 
                  This helps minimize transaction fees and ensures efficient payment processing.
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-9" className="bg-white/80 backdrop-blur-sm border border-gray-100 px-8 py-2 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group">
              <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:text-primary transition-colors py-6 group-hover:text-blue-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Shield className="w-5 h-5 text-violet-600" />
                  </div>
                  Why do I need to verify my identity?
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 pb-6 leading-relaxed text-base">
                <div className="pl-13">
                  Identity verification ensures a safe and legitimate earning environment for all users. It prevents fraud and 
                  enables secure payouts. You need to upload a government-issued ID and bank details for verification before you can start earning.
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-10" className="bg-white/80 backdrop-blur-sm border border-gray-100 px-8 py-2 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group">
              <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:text-primary transition-colors py-6 group-hover:text-blue-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CheckCircle className="w-5 h-5 text-sky-600" />
                  </div>
                  How do I contact support?
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 pb-6 leading-relaxed text-base">
                <div className="pl-13">
                  You can contact our support team through the live chat feature available in your dashboard, or send us a message 
                  through the Support page. Our team is available <span className="font-semibold text-sky-600">24/7</span> to help with any questions or issues.
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary via-primary/90 to-secondary relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-white rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white rounded-full"></div>
          <div className="absolute bottom-32 right-10 w-14 h-14 bg-white rounded-full"></div>
        </div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="mb-8">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white leading-tight">
              Ready to Start Earning?
            </h2>
            <p className="text-xl lg:text-2xl mb-4 text-white/90 max-w-3xl mx-auto leading-relaxed">
              Join our community and turn your free time into real income.
            </p>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Watch videos, earn money, and get paid weekly. It's that simple.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                variant="secondary"
                className="w-full sm:w-auto bg-white text-primary hover:bg-gray-100 font-semibold text-lg px-8 py-4 h-auto shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Sign Up Now
              </Button>
            </Link>
            <Link href="/how-to-earn" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                variant="outline"
                className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary font-semibold text-lg px-8 py-4 h-auto bg-transparent transition-all duration-300"
              >
                Learn More
              </Button>
            </Link>
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-white/80">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-white" />
              <span className="text-sm">No hidden fees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-white" />
              <span className="text-sm">Weekly payouts</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-white" />
              <span className="text-sm">24/7 support</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
