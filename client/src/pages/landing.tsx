import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Play, Users, Coins, Clock, CheckCircle, Shield, User, TrendingUp, CreditCard, BarChart3, Lock, Building2, Headphones } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30 safe-area-padding">
      <Header />

      {/* Hero Section */}
      <section className="relative py-8 sm:py-12 lg:py-16 px-3 sm:px-4 overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20">
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
          
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-gray-900 mb-4 sm:mb-6 leading-tight tracking-tight">
            Complete Simple Tasks<br />
            <span className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent font-black">
              Earn Real Money
            </span>
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed font-medium">
            Join India's most trusted task completion platform. Complete simple tasks like app downloads, 
            reviews, and social media activities to earn sustainable income with our professional ecosystem.
          </p>
          
          {/* Enhanced Bonus Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
            <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6 shadow-xl border-2 border-green-200/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 group overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-300/20 to-emerald-400/20 rounded-full blur-xl"></div>
              <div className="relative flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300">
                  <Coins className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                  <span className="text-3xl font-black text-green-700 block tracking-tight leading-none">₹1,000</span>
                  <span className="text-green-600 font-bold text-sm mt-1 block">Welcome Bonus</span>
                  <span className="text-xs text-green-500 font-medium">After KYC Verification</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-b-3xl"></div>
            </div>
            
            <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 shadow-xl border-2 border-blue-200/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 group overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-300/20 to-indigo-400/20 rounded-full blur-xl"></div>
              <div className="relative flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                  <span className="text-3xl font-black text-blue-700 block tracking-tight leading-none">₹15-40</span>
                  <span className="text-blue-600 font-bold text-sm mt-1 block">Per Task</span>
                  <span className="text-xs text-blue-500 font-medium">Simple 5-20 min tasks</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-b-3xl"></div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center max-w-2xl mx-auto">
            <Button 
              size="xl" 
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700"
              onClick={() => window.location.href = '/signup'}
            >
              Start Earning Now
            </Button>
            <Button 
              size="xl" 
              variant="outline"
              className="w-full sm:w-auto border-2 border-gray-300 hover:bg-gray-50 hover:border-primary/50"
              onClick={() => window.location.href = '/login'}
            >
              Already Have Account?
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto opacity-70">
            <div className="flex items-center justify-center gap-2 bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-gray-100 hover:bg-white/80 transition-all duration-300">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">100% Secure</span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-gray-100 hover:bg-white/80 transition-all duration-300">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Verified Platform</span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-gray-100 hover:bg-white/80 transition-all duration-300">
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
      <section id="features" className="py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/20 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute top-10 left-20 w-80 h-80 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-tr from-blue-400 to-cyan-400 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            {/* Features Icon Badge */}
            <div className="flex items-center justify-center mb-6">
              <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-lg">
                  <Shield className="w-8 h-8" />
                </div>
              </div>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight tracking-tight">
              Why Choose
              <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-black">
                Innovative Task Earn?
              </span>
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
              India's most trusted video monetization platform with guaranteed earnings and transparent business model
            </p>
            
            {/* Decorative divider */}
            <div className="flex items-center justify-center mt-8 mb-4">
              <div className="h-1 w-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
              <div className="mx-4 w-3 h-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full"></div>
              <div className="h-1 w-20 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
            {/* Feature 1 - Business Trust */}
            <div className="group relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl hover:border-primary/30 transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02]">
              <div className="absolute -top-4 -right-4 w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full opacity-90 group-hover:opacity-100 transition-opacity shadow-lg"></div>
              <div className="flex items-center justify-center mb-8">
                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <Shield className="text-green-600 w-10 h-10 lg:w-12 lg:h-12" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-6 text-center tracking-tight">Legitimate Business</h3>
              <p className="text-gray-700 text-center leading-relaxed font-medium text-lg">Government-compliant platform with proper business registration and tax compliance for your peace of mind.</p>
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-green-500 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-3xl"></div>
            </div>

            {/* Feature 2 - Real Revenue Model */}
            <div className="group relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl hover:border-primary/30 transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02]">
              <div className="absolute -top-4 -right-4 w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-90 group-hover:opacity-100 transition-opacity shadow-lg"></div>
              <div className="flex items-center justify-center mb-8">
                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <TrendingUp className="text-blue-600 w-10 h-10 lg:w-12 lg:h-12" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-6 text-center tracking-tight">Sustainable Revenue</h3>
              <p className="text-gray-700 text-center leading-relaxed font-medium text-lg">Built on advertising partnerships with major brands, ensuring long-term sustainability and consistent earnings.</p>
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-3xl"></div>
            </div>

            {/* Feature 3 - Professional Payouts */}
            <div className="group relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl hover:border-primary/30 transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02]">
              <div className="absolute -top-4 -right-4 w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-90 group-hover:opacity-100 transition-opacity shadow-lg"></div>
              <div className="flex items-center justify-center mb-8">
                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <CreditCard className="text-purple-600 w-10 h-10 lg:w-12 lg:h-12" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-6 text-center tracking-tight">Professional Payouts</h3>
              <p className="text-gray-700 text-center leading-relaxed font-medium text-lg">Weekly bank transfers every Tuesday with complete transaction history and tax documentation.</p>
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-3xl"></div>
            </div>

            {/* Feature 4 - Proven Track Record */}
            <div className="group relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl hover:border-primary/30 transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02]">
              <div className="absolute -top-4 -right-4 w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full opacity-90 group-hover:opacity-100 transition-opacity shadow-lg"></div>
              <div className="flex items-center justify-center mb-8">
                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <BarChart3 className="text-orange-600 w-10 h-10 lg:w-12 lg:h-12" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-6 text-center tracking-tight">₹10M+ Distributed</h3>
              <p className="text-gray-700 text-center leading-relaxed font-medium text-lg">Over 10 million rupees paid to our community with transparent financial reporting and growth metrics.</p>
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 to-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-3xl"></div>
            </div>

            {/* Feature 5 - Enterprise Security */}
            <div className="group relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl hover:border-primary/30 transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02]">
              <div className="absolute -top-4 -right-4 w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full opacity-90 group-hover:opacity-100 transition-opacity shadow-lg"></div>
              <div className="flex items-center justify-center mb-8">
                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <Lock className="text-teal-600 w-10 h-10 lg:w-12 lg:h-12" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-6 text-center tracking-tight">Enterprise Security</h3>
              <p className="text-gray-700 text-center leading-relaxed font-medium text-lg">Bank-grade encryption, secure KYC verification, and fraud prevention systems protect your data and earnings.</p>
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-3xl"></div>
            </div>

            {/* Feature 6 - Business Support */}
            <div className="group relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl hover:border-primary/30 transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02]">
              <div className="absolute -top-4 -right-4 w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full opacity-90 group-hover:opacity-100 transition-opacity shadow-lg"></div>
              <div className="flex items-center justify-center mb-8">
                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-violet-100 to-purple-100 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <Building2 className="text-violet-600 w-10 h-10 lg:w-12 lg:h-12" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-6 text-center tracking-tight">Business Support</h3>
              <p className="text-gray-700 text-center leading-relaxed font-medium text-lg">Professional customer service with dedicated account managers and comprehensive business documentation.</p>
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-violet-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-3xl"></div>
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
              How It
              <span className="block bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent font-black">
                Works
              </span>
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
              Professional earning process designed for sustainable income generation through simple task completion
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
                <h3 className="text-xl lg:text-2xl font-black text-gray-900 mb-4 text-center tracking-tight">Professional Registration</h3>
                <p className="text-gray-600 text-center leading-relaxed font-medium">Complete business-grade KYC verification with government ID, bank details, and ₹99 processing fee for legitimate user base.</p>
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
                <h3 className="text-xl lg:text-2xl font-black text-gray-900 mb-4 text-center tracking-tight">Complete Simple Tasks</h3>
                <p className="text-gray-600 text-center leading-relaxed font-medium">Choose from 5 task categories including app downloads, reviews, and social media activities. Each task takes 5-20 minutes to complete.</p>
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
                <h3 className="text-xl lg:text-2xl font-black text-gray-900 mb-4 text-center tracking-tight">Professional Commitment</h3>
                <p className="text-gray-600 text-center leading-relaxed font-medium">Maintain 8-hour daily engagement to ensure consistent revenue stream and professional standing in our ecosystem.</p>
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
                <h3 className="text-xl lg:text-2xl font-black text-gray-900 mb-4 text-center tracking-tight">Business Payouts</h3>
                <p className="text-gray-600 text-center leading-relaxed font-medium">Receive professional weekly bank transfers every Tuesday with complete transaction history and tax documentation.</p>
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
              Get answers to common questions about earning money with Innovative Task Earn
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
                  How much can I earn per task?
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 pb-4 leading-relaxed text-base">
                <div className="pl-10 md:pl-13">
                  Earnings per task vary based on task type and complexity. You can earn between <span className="font-semibold text-green-600">₹10-₹40 per task</span>. 
                  App downloads and reviews offer higher earnings. All earnings are credited after admin approval of your submission.
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
                    <div><strong className="text-blue-600">Task Completion Bonus:</strong> Earn <span className="font-semibold">bonus rewards</span> for completing multiple tasks in a day.</div>
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
                    <div><strong className="text-orange-600">Reactivation Fee:</strong> <span className="font-semibold">₹49 fee</span> to reactivate suspended accounts (if applicable).</div>
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
                  What types of tasks are available?
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 pb-6 leading-relaxed text-base">
                <div className="pl-13">
                  We offer 5 main categories: <span className="font-semibold text-indigo-600">App Downloads</span> (₹15-25), <span className="font-semibold text-indigo-600">Business Reviews</span> (₹30-35), 
                  <span className="font-semibold text-indigo-600">Product Reviews</span> (₹25-40), <span className="font-semibold text-indigo-600">Channel Subscribe</span> (₹15-20), and <span className="font-semibold text-indigo-600">Comments & Likes</span> (₹10-15). 
                  Each task takes 5-20 minutes and requires proof submission for approval.
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
                  How do I submit proof of task completion?
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 pt-2 pb-6 leading-relaxed text-base">
                <div className="pl-13">
                  After completing a task, take clear screenshots showing proof of completion. Upload these images in the task submission form. 
                  Include app download confirmations, review screenshots, subscription confirmations, or social media activity as required.
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
        {/* Enhanced Background Decorations */}
        <div className="absolute inset-0">
          {/* Animated gradient orbs */}
          <div className="absolute top-10 left-10 w-80 h-80 bg-gradient-to-r from-white/20 to-yellow-300/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0s', animationDuration: '4s'}}></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-l from-blue-200/40 to-purple-300/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
          <div className="absolute top-1/2 left-1/3 w-60 h-60 bg-gradient-to-br from-orange-200/30 to-pink-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s', animationDuration: '3s'}}></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(circle at 50% 50%, white 1px, transparent 1px)', backgroundSize: '50px 50px'}}></div>
        </div>
        
        {/* Enhanced floating elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-4 h-4 bg-yellow-300 rounded-full animate-bounce" style={{animationDelay: '0.5s', animationDuration: '2s'}}></div>
          <div className="absolute top-40 right-32 w-6 h-6 bg-orange-300 rounded-full animate-bounce" style={{animationDelay: '1.5s', animationDuration: '2.5s'}}></div>
          <div className="absolute bottom-32 left-1/4 w-3 h-3 bg-white rounded-full animate-bounce" style={{animationDelay: '2.5s', animationDuration: '1.8s'}}></div>
          <div className="absolute bottom-20 right-16 w-5 h-5 bg-pink-300 rounded-full animate-bounce" style={{animationDelay: '3.5s', animationDuration: '2.2s'}}></div>
          <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-blue-200 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-1/3 left-1/5 w-3 h-3 bg-green-300 rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Enhanced CTA Icon Badge with animation */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur animate-pulse"></div>
              <div className="relative inline-flex items-center justify-center p-4 bg-white/25 backdrop-blur-md rounded-full border border-white/30 shadow-2xl hover:scale-110 transition-all duration-500 group">
                <div className="bg-gradient-to-br from-white to-yellow-100 text-primary p-5 rounded-full shadow-xl group-hover:shadow-2xl transition-all duration-300">
                  <Play className="w-10 h-10" />
                </div>
              </div>
              {/* Pulsing ring animation */}
              <div className="absolute inset-0 bg-white/10 rounded-full animate-ping" style={{animationDuration: '3s'}}></div>
            </div>
          </div>
          
          <div className="mb-10">
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-8 text-white leading-tight tracking-tight">
              Ready to Start
              <span className="block bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent font-black drop-shadow-sm">
                Earning?
              </span>
            </h2>
            <p className="text-xl lg:text-2xl mb-8 text-white/95 max-w-4xl mx-auto leading-relaxed font-medium">
              Join our community and turn your free time into real income with our trusted platform.
            </p>
            <p className="text-lg text-white/85 max-w-3xl mx-auto font-medium mb-8">
              Watch videos, earn money, and get paid weekly. Start your earning journey today.
            </p>
            
            {/* New engagement stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-black text-yellow-300 mb-1">200K+</div>
                <div className="text-sm text-white/80 font-medium">Active Users</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-black text-orange-300 mb-1">₹10M+</div>
                <div className="text-sm text-white/80 font-medium">Paid Out</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-black text-pink-300 mb-1">4.9★</div>
                <div className="text-sm text-white/80 font-medium">User Rating</div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-2xl mx-auto mb-10">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-gradient-to-r from-white to-yellow-100 text-primary hover:from-yellow-50 hover:to-orange-100 font-black text-xl px-12 py-7 h-auto rounded-2xl shadow-2xl hover:shadow-white/30 transition-all duration-300 transform hover:scale-105 border-2 border-white/30 group"
              >
                <Play className="w-5 h-5 mr-3 group-hover:animate-pulse" />
                Start Earning Now
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline"
              className="w-full sm:w-auto border-2 border-white/50 text-white hover:bg-white/15 hover:border-white backdrop-blur-md font-bold text-xl px-12 py-7 h-auto rounded-2xl bg-white/10 transition-all duration-300 hover:scale-105 group"
              onClick={() => window.location.href = '/login'}
            >
              <User className="w-5 h-5 mr-3 group-hover:animate-pulse" />
              I Have Account
            </Button>
          </div>
          
          {/* New trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-white/70 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-300" />
              <span className="font-medium">SSL Secured</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-300" />
              <span className="font-medium">Verified Payouts</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-300" />
              <span className="font-medium">24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-300" />
              <span className="font-medium">Community Trusted</span>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
