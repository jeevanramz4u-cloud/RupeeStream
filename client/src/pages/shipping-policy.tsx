import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-neutral-50 safe-area-padding">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <Truck className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Shipping & Delivery Policy</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-IN')}</p>
        </div>

        <Card className="mb-8">
          <CardContent className="prose prose-gray max-w-none pt-6">
            <p className="text-lg text-gray-700 mb-6">
              This Shipping & Delivery Policy outlines the terms and conditions for any physical deliveries 
              related to services provided by INNOVATIVE GROW SOLUTIONS PRIVATE LIMITED through Innovative Task Earn.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Service Type</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    Innovative Task Earn is primarily a digital task completion platform. Most of our services 
                    are delivered electronically and do not require physical shipping.
                  </p>
                  <p>
                    This policy applies to any physical items that may be sent to users, including:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>KYC verification documents (if returned)</li>
                    <li>Welcome kits or promotional materials (if applicable)</li>
                    <li>Any physical rewards or certificates</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Shipping Coverage</h2>
                <div className="space-y-4 text-gray-700">
                  <p>We provide shipping services within India only.</p>
                  <h3 className="font-medium">Shipping Zones:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Zone 1:</strong> Haryana, Delhi, Punjab - 2-3 business days</li>
                    <li><strong>Zone 2:</strong> Northern India (UP, Rajasthan, HP) - 3-5 business days</li>
                    <li><strong>Zone 3:</strong> Rest of India - 5-7 business days</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Delivery Timeline</h2>
                <div className="space-y-4 text-gray-700">
                  <p>Standard delivery timelines:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Processing Time:</strong> 1-2 business days</li>
                    <li><strong>Shipping Time:</strong> 2-7 business days (depending on location)</li>
                    <li><strong>Total Delivery Time:</strong> 3-9 business days</li>
                  </ul>
                  <p>
                    Business days exclude Sundays and national holidays. Delivery may be delayed 
                    during festive seasons or due to unforeseen circumstances.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Shipping Charges</h2>
                <div className="space-y-4 text-gray-700">
                  <p>Shipping charges (if applicable):</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Zone 1: ₹50 for documents, ₹100 for packages</li>
                    <li>Zone 2: ₹75 for documents, ₹150 for packages</li>
                    <li>Zone 3: ₹100 for documents, ₹200 for packages</li>
                  </ul>
                  <p>
                    Free shipping may be provided for promotional materials or in case of 
                    company-initiated returns.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Tracking & Updates</h2>
                <div className="space-y-4 text-gray-700">
                  <ul className="list-disc pl-6 space-y-2">
                    <li>All shipments include tracking numbers</li>
                    <li>SMS and email notifications for shipping updates</li>
                    <li>Real-time tracking through our logistics partners</li>
                    <li>Customer support available for shipping queries</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Delivery Requirements</h2>
                <div className="space-y-4 text-gray-700">
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Accurate and complete delivery address required</li>
                    <li>Valid contact number for delivery coordination</li>
                    <li>Someone must be available to receive the package</li>
                    <li>Valid ID proof may be required for verification</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Failed Delivery</h2>
                <div className="space-y-4 text-gray-700">
                  <p>In case of failed delivery attempts:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Up to 3 delivery attempts will be made</li>
                    <li>Package will be held at local delivery center for 7 days</li>
                    <li>Customer will be notified via SMS/email</li>
                    <li>After 7 days, package will be returned to sender</li>
                    <li>Re-delivery charges may apply for subsequent attempts</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Contact Information</h2>
                <div className="space-y-4 text-gray-700">
                  <p>For shipping-related queries:</p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p><strong>INNOVATIVE GROW SOLUTIONS PRIVATE LIMITED</strong></p>
                    <p>Email: support@innovativetaskearn.online</p>
                    <p>Phone: +91-8000-XXX-XXX</p>
                    <p>Address: C/O YOGESH, Kharbla 99, VATS STREET, KHARBLA</p>
                    <p>Hisar, Haryana - 125042</p>
                    <p>GST: 06AAGCI9044P1ZZ</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Policy Updates</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    We reserve the right to update this shipping policy at any time. 
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