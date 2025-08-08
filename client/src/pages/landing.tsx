import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Play, Users, Coins, Clock, CheckCircle, Shield, User, Zap, Star, TrendingUp, Award, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 safe-area-padding relative overflow-hidden">
      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blob-animation"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-lg transform rotate-45 blob-animation" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-gradient-to-br from-green-400/20 to-cyan-400/20 rounded-full blob-animation" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-60 right-1/3 w-16 h-16 bg-gradient-to-br from-yellow-400/20 to-red-400/20 rounded-lg blob-animation" style={{animationDelay: '6s'}}></div>
      </div>
      
      <Header />

      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-blue-50/40"></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          {/* Modern Badge */}
          <div className="inline-flex items-center justify-center mb-10">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20"></div>
              <div className="relative bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-xl">
                  <Play className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>
          
          <h1 className="font-outfit text-5xl sm:text-6xl lg:text-8xl font-black text-gray-900 mb-8 leading-tight text-shadow">
            <span className="block mb-2">Transform Your</span>
            <span className="gradient-text">Free Time</span>
            <span className="block mt-2 text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-700">into Real Income</span>
          </h1>
          
          <p className="font-inter text-xl sm:text-2xl lg:text-3xl text-gray-600 mb-10 max-w-5xl mx-auto leading-relaxed font-medium">
            Join the <span className="font-bold text-blue-600">most rewarding</span> video platform where every minute counts. 
            Watch, earn, and get paid weekly with complete transparency.
          </p>
          
          {/* Earnings Stats */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 sm:p-10 mb-12 max-w-6xl mx-auto shadow-xl border border-gray-100">
            <div className="grid sm:grid-cols-3 gap-8 items-center">
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Coins className="w-10 h-10 text-white" />
                </div>
                <div className="font-code text-4xl font-bold text-emerald-600 mb-1">₹2,500</div>
                <div className="text-gray-600 font-medium">Daily Potential</div>
              </div>
              
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
                <div className="font-code text-4xl font-bold text-blue-600 mb-1">₹15</div>
                <div className="text-gray-600 font-medium">Per Video</div>
              </div>
              
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Award className="w-10 h-10 text-white" />
                </div>
                <div className="font-code text-4xl font-bold text-purple-600 mb-1">₹49</div>
                <div className="text-gray-600 font-medium">Referral Bonus</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-4xl mx-auto">
            <Button 
              size="lg" 
              className="font-outfit bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-16 sm:h-18 text-xl font-bold px-12 sm:px-16 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 touch-manipulation"
              onClick={() => window.location.href = '/signup'}
            >
              <Play className="w-6 h-6 mr-3" />
              Start Earning Today
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="font-outfit h-16 sm:h-18 text-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-600 px-12 sm:px-16 rounded-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl touch-manipulation"
              onClick={() => window.location.href = '/login'}
            >
              Already Member?
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 hover:border-green-200 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="font-outfit text-lg font-bold text-gray-900">100% Secure</div>
                  <div className="text-gray-600 text-sm">Bank-level security</div>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 hover:border-blue-200 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-outfit text-lg font-bold text-gray-900">Verified Platform</div>
                  <div className="text-gray-600 text-sm">Trusted by millions</div>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 hover:border-purple-200 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="font-outfit text-lg font-bold text-gray-900">200K+ Users</div>
                  <div className="text-gray-600 text-sm">Active community</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Live stats ticker */}
          <div className="mt-12 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-full p-4 max-w-lg mx-auto border border-emerald-200">
            <div className="font-inter text-center">
              <span className="text-emerald-600 font-bold">🔥 Live Stats:</span>
              <span className="text-gray-700 ml-2">₹2,47,530 earned today • 1,247 active users</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-24 lg:py-28 px-4 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-100 rounded-full opacity-20 blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            {/* Modern Features Badge */}
            <div className="inline-flex items-center justify-center mb-10">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-20"></div>
                <div className="relative bg-white border border-gray-200 rounded-3xl p-8 shadow-xl">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-5 rounded-2xl">
                    <Star className="w-10 h-10" />
                  </div>
                </div>
              </div>
            </div>
            
            <h2 className="font-outfit text-5xl lg:text-7xl font-black text-gray-900 mb-8 leading-tight text-shadow">
              <span className="block mb-2">Why Choose</span>
              <span className="gradient-text">EarnPay?</span>
            </h2>
            <p className="font-inter text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Experience the most <span className="font-bold text-indigo-600">trusted and rewarding platform</span> for earning money through video engagement. 
              Join thousands of satisfied users who are already earning.
            </p>
            
            {/* Decorative divider */}
            <div className="flex items-center justify-center mt-8 mb-4">
              <div className="h-1 w-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
              <div className="mx-4 w-3 h-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full"></div>
              <div className="h-1 w-20 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {/* Real Money Earnings */}
            <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 card-hover border border-gray-100 hover:border-emerald-200">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Coins className="text-white w-8 h-8" />
              </div>
              <h3 className="font-outfit text-2xl font-bold text-gray-900 mb-4 text-center">Real Money Earnings</h3>
              <p className="font-inter text-gray-600 leading-relaxed text-center">
                Earn genuine rupees for every video you watch completely. No fake rewards or points - just real cash directly to your bank account.
              </p>
            </div>

            {/* Referral Program */}
            <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 card-hover border border-gray-100 hover:border-blue-200">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Users className="text-white w-8 h-8" />
              </div>
              <h3 className="font-outfit text-2xl font-bold text-gray-900 mb-4 text-center">Smart Referrals</h3>
              <p className="font-inter text-gray-600 leading-relaxed text-center">
                Earn ₹49 for every friend you refer who completes verification. Build your network and multiply your earnings exponentially.
              </p>
            </div>

            {/* Flexible Schedule */}
            <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 card-hover border border-gray-100 hover:border-orange-200">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Clock className="text-white w-8 h-8" />
              </div>
              <h3 className="font-outfit text-2xl font-bold text-gray-900 mb-4 text-center">Complete Flexibility</h3>
              <p className="font-inter text-gray-600 leading-relaxed text-center">
                Watch videos anytime, anywhere. Meet the 8-hour daily target at your own pace with complete schedule freedom.
              </p>
            </div>

            {/* Weekly Payouts */}
            <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 card-hover border border-gray-100 hover:border-purple-200">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <CheckCircle className="text-white w-8 h-8" />
              </div>
              <h3 className="font-outfit text-2xl font-bold text-gray-900 mb-4 text-center">Weekly Payouts</h3>
              <p className="font-inter text-gray-600 leading-relaxed text-center">
                Receive your earnings every Tuesday directly to your bank account. Fast, secure, and reliable payment processing.
              </p>
            </div>

            {/* Secure Platform */}
            <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 card-hover border border-gray-100 hover:border-cyan-200">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Shield className="text-white w-8 h-8" />
              </div>
              <h3 className="font-outfit text-2xl font-bold text-gray-900 mb-4 text-center">Bank-Level Security</h3>
              <p className="font-inter text-gray-600 leading-relaxed text-center">
                Government ID verification and encrypted transactions ensure a safe, trusted earning environment for all users.
              </p>
            </div>

            {/* Quality Content */}
            <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 card-hover border border-gray-100 hover:border-indigo-200">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Play className="text-white w-8 h-8" />
              </div>
              <h3 className="font-outfit text-2xl font-bold text-gray-900 mb-4 text-center">Premium Content</h3>
              <p className="font-inter text-gray-600 leading-relaxed text-center">
                Watch curated, high-quality videos across various categories. Entertainment that's both engaging and rewarding.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-blue-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full">
                <div className="bg-primary text-white p-3 rounded-full">
                  <Play className="w-6 h-6" />
                </div>
              </div>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight tracking-tight">
              How It Works
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
              Simple steps to start earning money by watching videos
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {/* Step 1 */}
            <div className="relative group">
              <div className="hidden lg:block absolute top-12 left-full w-8 h-0.5 bg-gradient-to-r from-primary to-primary/30 z-0"></div>
              <div className="relative bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group-hover:border-primary/20">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">1</span>
                </div>
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <User className="text-green-600 w-8 h-8 lg:w-10 lg:h-10" />
                  </div>
                </div>
                <h3 className="text-xl lg:text-2xl font-black text-gray-900 mb-4 text-center tracking-tight">Sign Up & Verify</h3>
                <p className="text-gray-600 text-center leading-relaxed font-medium">Create your account, upload your government ID and bank details for verification.</p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl"></div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="hidden lg:block absolute top-12 left-full w-8 h-0.5 bg-gradient-to-r from-primary to-primary/30 z-0"></div>
              <div className="relative bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group-hover:border-primary/20">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">2</span>
                </div>
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Play className="text-blue-600 w-8 h-8 lg:w-10 lg:h-10" />
                  </div>
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 text-center">Watch Videos</h3>
                <p className="text-gray-600 text-center leading-relaxed">Browse our video library and watch videos completely to earn money. No skipping allowed!</p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl"></div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="hidden lg:block absolute top-12 left-full w-8 h-0.5 bg-gradient-to-r from-primary to-primary/30 z-0"></div>
              <div className="relative bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group-hover:border-primary/20">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">3</span>
                </div>
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Clock className="text-orange-600 w-8 h-8 lg:w-10 lg:h-10" />
                  </div>
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
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Coins className="text-purple-600 w-8 h-8 lg:w-10 lg:h-10" />
                  </div>
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 text-center">Get Paid</h3>
                <p className="text-gray-600 text-center leading-relaxed">Request weekly payouts every Tuesday and receive money directly to your bank account.</p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl"></div>
              </div>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="text-center mt-12">
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
      <section id="faq" className="py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-primary to-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-gradient-to-tr from-purple-400 to-pink-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12">
            {/* FAQ Icon Badge */}
            <div className="flex items-center justify-center mb-6">
              <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-lg">
                  <CheckCircle className="w-8 h-8" />
                </div>
              </div>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight tracking-tight">
              Frequently Asked
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent font-black">
                Questions
              </span>
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
              Get answers to common questions about earning money with EarnPay
            </p>
            
            {/* Decorative divider */}
            <div className="flex items-center justify-center mt-8 mb-4">
              <div className="h-1 w-20 bg-gradient-to-r from-primary to-blue-600 rounded-full"></div>
              <div className="mx-4 w-3 h-3 bg-gradient-to-br from-primary to-blue-600 rounded-full"></div>
              <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-primary rounded-full"></div>
            </div>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-3 md:space-y-4">
            <AccordionItem value="item-1" className="bg-white/80 backdrop-blur-sm border border-gray-100 px-6 md:px-8 py-2 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group">
              <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:text-primary transition-colors py-6 group-hover:text-blue-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Coins className="w-5 h-5 text-green-600" />
                  </div>
                  How much can I earn per video?
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 pb-4 leading-relaxed text-base">
                <div className="pl-10 md:pl-13">
                  Earnings per video vary based on video length and category. Typically, you can earn between <span className="font-semibold text-green-600">₹5-₹25 per video</span>. 
                  Longer videos and premium content offer higher earnings. All earnings are credited immediately after completing the full video.
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="bg-white/80 backdrop-blur-sm border border-gray-100 px-6 md:px-8 py-1 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group">
              <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:text-primary transition-colors py-6 group-hover:text-blue-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  What bonuses can I earn?
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 pb-6 leading-relaxed text-base">
                <div className="pl-10 md:pl-13 space-y-3">
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
      <section className="py-16 sm:py-20 lg:py-24 px-4 bg-gradient-to-br from-primary via-blue-600 to-indigo-700 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 opacity-[0.08]">
          <div className="absolute top-10 left-10 w-80 h-80 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-200 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-60 h-60 bg-purple-200 rounded-full blur-3xl"></div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-4 h-4 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-32 w-6 h-6 bg-white/80 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-32 left-1/4 w-3 h-3 bg-white rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-20 right-16 w-5 h-5 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '3s'}}></div>
        </div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* CTA Icon Badge */}
          <div className="flex items-center justify-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-white/20 backdrop-blur-sm rounded-full">
              <div className="bg-white text-primary p-4 rounded-full shadow-lg">
                <Play className="w-8 h-8" />
              </div>
            </div>
          </div>
          
          <div className="mb-10">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 text-white leading-tight tracking-tight">
              Ready to Start
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent font-black">
                Earning?
              </span>
            </h2>
            <p className="text-xl lg:text-2xl mb-6 text-white/90 max-w-4xl mx-auto leading-relaxed font-medium">
              Join our community and turn your free time into real income with our trusted platform.
            </p>
            <p className="text-lg text-white/80 max-w-3xl mx-auto font-medium">
              Watch videos, earn money, and get paid weekly. Start your earning journey today.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-2xl mx-auto">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-white text-primary hover:bg-yellow-50 hover:text-primary/90 font-bold text-xl px-10 py-6 h-auto rounded-2xl shadow-2xl hover:shadow-white/20 transition-all duration-300 transform hover:scale-105 border-2 border-white/20"
              >
                Sign Up Now
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline"
              className="w-full sm:w-auto border-2 border-white/40 text-white hover:bg-white/10 hover:border-white backdrop-blur-sm font-semibold text-xl px-10 py-6 h-auto rounded-2xl bg-transparent transition-all duration-300"
              onClick={() => window.location.href = '/login'}
            >
              Already a Member?
            </Button>
          </div>
          
          <div className="mt-12 grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
              <CheckCircle className="w-8 h-8 text-white mx-auto mb-3" />
              <div className="text-white font-bold text-lg tracking-tight">No Hidden Fees</div>
              <div className="text-white/80 text-sm mt-1 font-medium">Transparent pricing always</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
              <Coins className="w-8 h-8 text-white mx-auto mb-3" />
              <div className="text-white font-bold text-lg tracking-tight">Weekly Payouts</div>
              <div className="text-white/80 text-sm mt-1 font-medium">Every Tuesday guaranteed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
              <Shield className="w-8 h-8 text-white mx-auto mb-3" />
              <div className="text-white font-bold text-lg tracking-tight">24/7 Support</div>
              <div className="text-white/80 text-sm mt-1 font-medium">Always here to help</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
