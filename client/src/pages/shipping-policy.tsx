import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-neutral-50 safe-area-padding">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <Monitor className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Digital Service Delivery Policy</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-IN')}</p>
        </div>

        <Card className="mb-8">
          <CardContent className="prose prose-gray max-w-none pt-6">
            <p className="text-lg text-gray-700 mb-6">
              This Digital Service Delivery Policy clarifies that INNOVATIVE GROW SOLUTIONS PRIVATE LIMITED 
              through Innovative Task Earn operates as a 100% digital platform and does not sell or ship 
              any physical products or items.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Digital Service Platform</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    <strong>Innovative Task Earn is a completely digital service platform.</strong> We provide 
                    task completion opportunities and digital earnings management services only.
                  </p>
                  <p>
                    We do NOT:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Sell any physical products or items</li>
                    <li>Provide shipping or delivery services</li>
                    <li>Handle physical merchandise of any kind</li>
                    <li>Offer product catalogs or e-commerce services</li>
                    <li>Manage inventory or physical goods</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Our Digital Services</h2>
                <div className="space-y-4 text-gray-700">
                  <p>We provide the following digital services only:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Task Completion Platform:</strong> Access to various micro-tasks</li>
                    <li><strong>Earnings Management:</strong> Digital wallet and payout system</li>
                    <li><strong>Referral Program:</strong> Digital referral tracking and bonuses</li>
                    <li><strong>KYC Verification:</strong> Online document verification system</li>
                    <li><strong>Customer Support:</strong> Digital chat and email support</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Service Delivery Method</h2>
                <div className="space-y-4 text-gray-700">
                  <p>All our services are delivered digitally:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Instant Access:</strong> Services available immediately upon registration</li>
                    <li><strong>Real-time Processing:</strong> Task approvals and earnings credit within minutes</li>
                    <li><strong>Digital Notifications:</strong> SMS and email updates for all activities</li>
                    <li><strong>Online Management:</strong> Complete account management through web platform</li>
                  </ul>
                  <p>
                    No physical delivery is required for any of our services.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Payment & Earnings Delivery</h2>
                <div className="space-y-4 text-gray-700">
                  <p>Financial transactions are processed digitally:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Digital Payments:</strong> All payments via bank transfer (IMPS/NEFT)</li>
                    <li><strong>No Cash Transactions:</strong> We do not handle physical cash</li>
                    <li><strong>Weekly Payouts:</strong> Earnings transferred directly to your bank account</li>
                    <li><strong>Transaction Tracking:</strong> Complete digital record of all transactions</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Important Notice</h2>
                <div className="space-y-4 text-gray-700">
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <p className="font-semibold text-yellow-800">Please Note:</p>
                    <p className="text-yellow-700">
                      If you have received any communication claiming physical product delivery 
                      or shipping from Innovative Task Earn, please verify with our official 
                      support team immediately. We do not engage in any physical commerce activities.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Contact Information</h2>
                <div className="space-y-4 text-gray-700">
                  <p>For service-related queries:</p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p><strong>INNOVATIVE GROW SOLUTIONS PRIVATE LIMITED</strong></p>
                    <p>Email: support@innovativetaskearn.online</p>
                    <p>Address: C/O YOGESH, Kharbla 99, VATS STREET, KHARBLA</p>
                    <p>Hisar, Haryana - 125042</p>
                    <p>GST: 06AAGCI9044P1ZZ</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Policy Updates</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    We reserve the right to update this digital service delivery policy at any time. 
                    Changes will be posted on our website and users will be notified 
                    of significant changes via email.
                  </p>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/">
            <button className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}