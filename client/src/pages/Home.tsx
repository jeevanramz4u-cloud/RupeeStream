import React from 'react';
import { Link } from 'wouter';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { 
  ArrowRight, 
  CheckCircle, 
  Coins, 
  ListTodo, 
  Shield, 
  Users,
  Smartphone,
  Star,
  FileText,
  Youtube,
  MessageCircle,
  Eye
} from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: ListTodo,
      title: 'Simple Tasks',
      description: 'Complete easy tasks like app downloads, reviews, and social media activities'
    },
    {
      icon: Coins,
      title: 'Instant Earnings',
      description: 'Get paid immediately after task approval - no waiting periods'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'KYC verified accounts with secure payment processing'
    },
    {
      icon: Users,
      title: 'Referral Bonus',
      description: 'Earn ₹49 for every friend who joins and completes KYC'
    }
  ];

  const taskCategories = [
    { icon: Smartphone, name: 'App Downloads', reward: '₹5-25', color: 'bg-blue-500' },
    { icon: Star, name: 'Business Reviews', reward: '₹5-35', color: 'bg-blue-600' },
    { icon: FileText, name: 'Product Reviews', reward: '₹5-40', color: 'bg-blue-500' },
    { icon: Youtube, name: 'Channel Subscribe', reward: '₹5-20', color: 'bg-blue-600' },
    { icon: MessageCircle, name: 'Comments & Likes', reward: '₹5-15', color: 'bg-blue-500' },
    { icon: Eye, name: 'Video Views', reward: '₹5-30', color: 'bg-blue-600' }
  ];

  const stats = [
    { label: 'Active Users', value: '10,000+' },
    { label: 'Tasks Completed', value: '50,000+' },
    { label: 'Total Paid Out', value: '₹5,00,000+' },
    { label: 'Average Rating', value: '4.8/5' }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-blue-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Earn Money by Completing
              <span className="block text-white">Simple Online Tasks</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Join thousands of users earning real money daily. Complete tasks, get instant payments, and build your income stream.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  Start Earning Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/tasks">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Browse Tasks
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-blue-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-900">{stat.value}</div>
                <div className="text-sm text-blue-600 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Task Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
              6 Ways to Earn Money
            </h2>
            <p className="text-xl text-blue-600 max-w-3xl mx-auto">
              Choose from multiple task categories and start earning immediately
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {taskCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.name} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription className="text-lg font-semibold text-blue-700">
                      Earn {category.reward}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-blue-600">
                      Complete {category.name.toLowerCase()} tasks and earn rewards instantly
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
              Why Choose Innovative Task Earn?
            </h2>
            <p className="text-xl text-blue-600 max-w-3xl mx-auto">
              We make earning money online simple, secure, and rewarding
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">{feature.title}</h3>
                  <p className="text-blue-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-blue-600 max-w-3xl mx-auto">
              Start earning in 4 simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Sign Up', description: 'Create your free account in seconds' },
              { step: '2', title: 'Complete KYC', description: 'Verify your identity with ₹99 fee' },
              { step: '3', title: 'Complete Tasks', description: 'Choose and complete tasks you like' },
              { step: '4', title: 'Get Paid', description: 'Receive instant payments to your account' }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">{item.title}</h3>
                <p className="text-blue-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Earning?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of users who are already earning money daily
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                Create Free Account
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Login to Dashboard
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center space-x-8 text-sm">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>No Hidden Fees</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Instant Payments</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}