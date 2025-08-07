import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  CreditCard, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Banknote,
  Shield,
  TrendingUp
} from "lucide-react";

export default function PayoutSchedule() {
  // Calculate next payout date (every Tuesday)
  const getNextTuesday = () => {
    const now = new Date();
    const nextTuesday = new Date(now);
    const dayOfWeek = now.getDay();
    const daysUntilTuesday = dayOfWeek === 2 ? 7 : (2 - dayOfWeek + 7) % 7;
    
    if (daysUntilTuesday === 0) {
      const processingHour = 14;
      if (now.getHours() >= processingHour) {
        nextTuesday.setDate(now.getDate() + 7);
      }
    } else {
      nextTuesday.setDate(now.getDate() + daysUntilTuesday);
    }
    
    return nextTuesday;
  };

  const nextPayoutDate = getNextTuesday();
  const daysUntilPayout = Math.ceil((nextPayoutDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const payoutSchedule = [
    {
      week: "Week 1",
      period: "Jan 1 - Jan 7",
      payoutDate: "Jan 9 (Tuesday)",
      status: "completed",
      amount: "₹2,450"
    },
    {
      week: "Week 2", 
      period: "Jan 8 - Jan 14",
      payoutDate: "Jan 16 (Tuesday)",
      status: "completed",
      amount: "₹2,680"
    },
    {
      week: "Week 3",
      period: "Jan 15 - Jan 21", 
      payoutDate: "Jan 23 (Tuesday)",
      status: "processing",
      amount: "₹2,320"
    },
    {
      week: "Week 4",
      period: "Jan 22 - Jan 28",
      payoutDate: "Jan 30 (Tuesday)", 
      status: "pending",
      amount: "₹1,890"
    }
  ];

  const requirements = [
    {
      title: "KYC Verification",
      description: "Complete KYC verification and pay ₹99 processing fee",
      status: "required",
      icon: <Shield className="w-5 h-5" />
    },
    {
      title: "Minimum Balance",
      description: "No minimum balance requirement - get paid for any amount earned",
      status: "info",
      icon: <Banknote className="w-5 h-5" />
    },
    {
      title: "Active Account",
      description: "Account must not be suspended or under review",
      status: "required",
      icon: <CheckCircle className="w-5 h-5" />
    },
    {
      title: "Valid Bank Details",
      description: "Provide accurate bank account information for transfers",
      status: "required",
      icon: <CreditCard className="w-5 h-5" />
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 safe-area-padding">
      <Header />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Payout Schedule
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Get paid every Tuesday for your video watching earnings. Our automated payout system ensures timely and secure payments directly to your bank account.
          </p>
        </div>

        {/* Next Payout Countdown */}
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Calendar className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-green-800">Next Payout</h2>
              </div>
              
              <div className="mb-4">
                <div className="text-3xl font-bold text-green-700 mb-2">
                  {nextPayoutDate.toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="text-green-600">
                  {daysUntilPayout === 0 ? 'Today!' : `${daysUntilPayout} days remaining`}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-blue-700">₹2,340</div>
                  <div className="text-sm text-blue-600">Pending Earnings</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-purple-700">₹18,450</div>
                  <div className="text-sm text-purple-600">Total Paid Out</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-orange-700">12</div>
                  <div className="text-sm text-orange-600">Successful Payouts</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-red-700">2:00 PM</div>
                  <div className="text-sm text-red-600">Processing Time</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How Payouts Work */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Payout Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Weekly Earnings Calculation</h4>
                    <p className="text-sm text-gray-600">
                      Every Monday, we calculate your total earnings from the previous week (Monday to Sunday).
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Payout Processing</h4>
                    <p className="text-sm text-gray-600">
                      Every Tuesday at 2:00 PM IST, we process all eligible payouts automatically.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Bank Transfer</h4>
                    <p className="text-sm text-gray-600">
                      Funds are transferred directly to your registered bank account within 2-4 hours.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium">Confirmation</h4>
                    <p className="text-sm text-gray-600">
                      You receive an email and in-app notification confirming the successful transfer.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payout Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requirements.map((req, index) => (
                  <div key={index} className="flex gap-3">
                    <div className={`mt-1 ${
                      req.status === 'required' ? 'text-red-600' : 
                      req.status === 'info' ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {req.icon}
                    </div>
                    <div>
                      <h4 className="font-medium">{req.title}</h4>
                      <p className="text-sm text-gray-600">{req.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Payout History */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Recent Payout History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Period</th>
                    <th className="text-left py-3 px-2">Payout Date</th>
                    <th className="text-left py-3 px-2">Amount</th>
                    <th className="text-left py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payoutSchedule.map((payout, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-2">
                        <div>
                          <div className="font-medium">{payout.week}</div>
                          <div className="text-sm text-gray-500">{payout.period}</div>
                        </div>
                      </td>
                      <td className="py-3 px-2">{payout.payoutDate}</td>
                      <td className="py-3 px-2 font-semibold">{payout.amount}</td>
                      <td className="py-3 px-2">
                        <Badge variant={
                          payout.status === 'completed' ? 'default' :
                          payout.status === 'processing' ? 'secondary' :
                          'outline'
                        }>
                          {payout.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {payout.status === 'processing' && <Clock className="w-3 h-3 mr-1" />}
                          {payout.status === 'pending' && <Calendar className="w-3 h-3 mr-1" />}
                          {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Info className="w-5 h-5" />
                Important Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-blue-700">
                <li>• Payouts are processed automatically every Tuesday at 2:00 PM IST</li>
                <li>• No fees or charges are deducted from your earnings</li>
                <li>• Bank transfers typically complete within 2-4 hours</li>
                <li>• You'll receive email and app notifications for all transactions</li>
                <li>• Suspended accounts are not eligible for payouts</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="w-5 h-5" />
                Payout Delays
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-orange-700">
                <div>
                  <h4 className="font-medium">Possible Reasons for Delays:</h4>
                  <ul className="space-y-1 mt-2">
                    <li>• Bank holidays or maintenance windows</li>
                    <li>• Incorrect or invalid bank account details</li>
                    <li>• Account under review or verification</li>
                    <li>• Technical issues with payment gateway</li>
                  </ul>
                </div>
                <p className="font-medium">
                  If your payout is delayed beyond 24 hours, please contact our support team.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">When do I receive my first payout?</h4>
                <p className="text-sm text-gray-600">
                  Your first payout will be processed on the Tuesday following your first complete week of earnings, 
                  provided you have completed KYC verification and met all requirements.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Is there a minimum payout amount?</h4>
                <p className="text-sm text-gray-600">
                  No, there is no minimum payout amount. You will receive payment for any amount you've earned, 
                  regardless of how small.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">What if I don't receive my payout on Tuesday?</h4>
                <p className="text-sm text-gray-600">
                  Check your account status and bank details first. If everything appears correct and you still 
                  haven't received payment within 24 hours, contact our support team immediately.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Can I change my bank account details?</h4>
                <p className="text-sm text-gray-600">
                  Yes, you can update your bank account details in your profile settings. Changes take effect 
                  from the next payout cycle.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}