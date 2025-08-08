import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  MapPin,
  Building2,
  CreditCard,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Eye,
  EyeOff,
  Shield,
  Award,
  Star,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showFullAccountNumber, setShowFullAccountNumber] = useState(false);
  const [showFullIdNumber, setShowFullIdNumber] = useState(false);

  const { data: kycData } = useQuery({
    queryKey: ["/api/kyc/status"],
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view your profile.</p>
          <Link href="/login">
            <Button className="mt-4">Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  const kycUser = (kycData as any) || (user as any);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Verified</Badge>;
      case 'pending':
      case 'submitted':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  const getKycStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Submitted</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(num || 0);
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (!accountNumber) return 'Not provided';
    return showFullAccountNumber ? accountNumber : `****${accountNumber.slice(-4)}`;
  };

  const maskIdNumber = (idNumber: string) => {
    if (!idNumber) return 'Not provided';
    return showFullIdNumber ? idNumber : `****${idNumber.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="hover:bg-blue-50">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">Professional Profile</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <Card className="border border-gray-100 shadow-lg bg-gradient-to-br from-white to-gray-50/50">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-black text-gray-900 tracking-tight">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mr-3">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <div className="flex items-center mt-1">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">{kycUser.firstName} {kycUser.lastName}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <div className="flex items-center mt-1">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">{kycUser.email}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <div className="flex items-center mt-1">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">{kycUser.phoneNumber || 'Not provided'}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                  <div className="flex items-center mt-1">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">
                      {kycUser.dateOfBirth ? new Date(kycUser.dateOfBirth).toLocaleDateString('en-IN') : 'Not provided'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    {getStatusBadge(kycUser.verificationStatus)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Balance</label>
                  <div className="mt-1 text-lg font-semibold text-green-600">
                    {formatCurrency(kycUser.balance || 0)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Address</label>
                <p className="mt-1 text-gray-900">{kycUser.address || 'Not provided'}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">City</label>
                  <p className="mt-1 text-gray-900">{kycUser.city || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">State</label>
                  <p className="mt-1 text-gray-900">{kycUser.state || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">PIN Code</label>
                  <p className="mt-1 text-gray-900">{kycUser.pinCode || 'Not provided'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Bank Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Account Holder</label>
                  <p className="mt-1 text-gray-900">{kycUser.accountHolderName || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Account Number</label>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="text-gray-900">{maskAccountNumber(kycUser.accountNumber)}</span>
                    {kycUser.accountNumber && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFullAccountNumber(!showFullAccountNumber)}
                      >
                        {showFullAccountNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">IFSC Code</label>
                  <p className="mt-1 text-gray-900">{kycUser.ifscCode || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Bank Name</label>
                  <p className="mt-1 text-gray-900">{kycUser.bankName || 'Not provided'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KYC Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                KYC Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">KYC Status</label>
                  <div className="mt-1">
                    {getKycStatusBadge(kycUser.kycStatus)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Processing Fee</label>
                  <div className="mt-1 flex items-center">
                    {kycUser.kycFeePaid ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                        <span className="text-green-600 font-medium">Paid ₹99</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-600 mr-1" />
                        <span className="text-red-600">Not Paid</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {(kycUser.governmentIdType || kycUser.governmentIdNumber) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <label className="text-sm font-medium text-gray-500">ID Type</label>
                    <p className="mt-1 text-gray-900 capitalize">{kycUser.governmentIdType || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">ID Number</label>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className="text-gray-900">{maskIdNumber(kycUser.governmentIdNumber)}</span>
                      {kycUser.governmentIdNumber && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowFullIdNumber(!showFullIdNumber)}
                        >
                          {showFullIdNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* KYC Documents */}
              {(kycUser.govIdFrontUrl || kycUser.govIdBackUrl || kycUser.selfieWithIdUrl) && (
                <div className="pt-4 border-t">
                  <label className="text-sm font-medium text-gray-500 mb-3 block">KYC Documents</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Front ID */}
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-2">ID Front</p>
                      {kycUser.govIdFrontUrl ? (
                        <div className="relative">
                          <img 
                            src={kycUser.govIdFrontUrl} 
                            alt="Government ID Front"
                            className="w-full h-20 object-cover rounded border"
                          />
                          <a 
                            href={kycUser.govIdFrontUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all rounded"
                          >
                            <Eye className="w-4 h-4 text-white opacity-0 hover:opacity-100" />
                          </a>
                        </div>
                      ) : (
                        <div className="w-full h-20 bg-gray-100 rounded border flex items-center justify-center">
                          <span className="text-gray-500 text-xs">Not uploaded</span>
                        </div>
                      )}
                    </div>

                    {/* Back ID */}
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-2">ID Back</p>
                      {kycUser.govIdBackUrl ? (
                        <div className="relative">
                          <img 
                            src={kycUser.govIdBackUrl} 
                            alt="Government ID Back"
                            className="w-full h-20 object-cover rounded border"
                          />
                          <a 
                            href={kycUser.govIdBackUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all rounded"
                          >
                            <Eye className="w-4 h-4 text-white opacity-0 hover:opacity-100" />
                          </a>
                        </div>
                      ) : (
                        <div className="w-full h-20 bg-gray-100 rounded border flex items-center justify-center">
                          <span className="text-gray-500 text-xs">Not uploaded</span>
                        </div>
                      )}
                    </div>

                    {/* Selfie with ID */}
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-2">Selfie with ID</p>
                      {kycUser.selfieWithIdUrl ? (
                        <div className="relative">
                          <img 
                            src={kycUser.selfieWithIdUrl} 
                            alt="Selfie with ID"
                            className="w-full h-20 object-cover rounded border"
                          />
                          <a 
                            href={kycUser.selfieWithIdUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all rounded"
                          >
                            <Eye className="w-4 h-4 text-white opacity-0 hover:opacity-100" />
                          </a>
                        </div>
                      ) : (
                        <div className="w-full h-20 bg-gray-100 rounded border flex items-center justify-center">
                          <span className="text-gray-500 text-xs">Not uploaded</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/kyc">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Update KYC
            </Button>
          </Link>
          <Link href="/earnings">
            <Button variant="outline">
              <CreditCard className="w-4 h-4 mr-2" />
              View Earnings
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}