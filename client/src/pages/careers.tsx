import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, Briefcase, Heart, Code, TrendingUp, Globe } from "lucide-react";

export default function Careers() {
  const jobOpenings = [
    {
      title: "Senior Full Stack Developer",
      department: "Engineering",
      location: "Mumbai / Remote",
      type: "Full-time",
      experience: "4+ years",
      skills: ["React", "Node.js", "PostgreSQL", "TypeScript"],
      description: "Lead development of our video monetization platform, working with modern technologies and scaling to 200k+ users."
    },
    {
      title: "Product Manager",
      department: "Product",
      location: "Mumbai",
      type: "Full-time",
      experience: "3+ years",
      skills: ["Product Strategy", "User Research", "Analytics", "Agile"],
      description: "Drive product strategy and roadmap for our platform, focusing on user experience and business growth."
    },
    {
      title: "DevOps Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      experience: "3+ years",
      skills: ["AWS", "Docker", "Kubernetes", "CI/CD"],
      description: "Build and maintain scalable infrastructure to support our growing user base and video streaming platform."
    },
    {
      title: "UX/UI Designer",
      department: "Design",
      location: "Mumbai / Remote",
      type: "Full-time",
      experience: "2+ years",
      skills: ["Figma", "User Research", "Prototyping", "Design Systems"],
      description: "Create intuitive and engaging user experiences for our video monetization platform across web and mobile."
    },
    {
      title: "Customer Success Manager",
      department: "Support",
      location: "Mumbai",
      type: "Full-time",
      experience: "2+ years",
      skills: ["Customer Support", "CRM", "Communication", "Problem Solving"],
      description: "Ensure user satisfaction and success on our platform, handling support requests and improving user experience."
    },
    {
      title: "Marketing Specialist",
      department: "Marketing",
      location: "Mumbai / Remote",
      type: "Full-time",
      experience: "2+ years",
      skills: ["Digital Marketing", "Content Creation", "SEO", "Social Media"],
      description: "Drive user acquisition and engagement through digital marketing campaigns and content strategies."
    }
  ];

  const benefits = [
    {
      icon: <Heart className="w-6 h-6 text-red-500" />,
      title: "Health & Wellness",
      description: "Comprehensive health insurance, mental health support, and wellness programs."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-green-500" />,
      title: "Growth & Learning",
      description: "Professional development budget, conference attendance, and skill-building opportunities."
    },
    {
      icon: <Globe className="w-6 h-6 text-blue-500" />,
      title: "Flexible Work",
      description: "Remote-first culture with flexible hours and work-life balance."
    },
    {
      icon: <Users className="w-6 h-6 text-purple-500" />,
      title: "Great Team",
      description: "Work with talented individuals who are passionate about technology and innovation."
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 safe-area-padding">
      <Header />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Join Our Team
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Build the future of video monetization with us. We're looking for passionate individuals who want to make a real impact in the digital economy.
          </p>
        </div>

        {/* Company Culture */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center">Why Work at Innovative Task Earn?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mission & Values */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                We're revolutionizing how people earn money online by creating a transparent, fair, and sustainable video monetization platform.
              </p>
              <p className="text-gray-600">
                Join us in building technology that empowers millions of users to generate real income through genuine engagement with quality content.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Our Values</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">Innovation First</h4>
                  <p className="text-sm text-gray-600">We embrace new technologies and creative solutions.</p>
                </div>
                <div>
                  <h4 className="font-medium">User-Centric</h4>
                  <p className="text-sm text-gray-600">Every decision we make puts our users at the center.</p>
                </div>
                <div>
                  <h4 className="font-medium">Transparency</h4>
                  <p className="text-sm text-gray-600">Open communication and honest business practices.</p>
                </div>
                <div>
                  <h4 className="font-medium">Excellence</h4>
                  <p className="text-sm text-gray-600">We strive for the highest quality in everything we do.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Open Positions */}
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">
            Open Positions
          </h2>
          
          <div className="space-y-6">
            {jobOpenings.map((job, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold">{job.title}</h3>
                        <Badge variant="secondary">{job.department}</Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{job.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {job.type}
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {job.experience}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill, skillIndex) => (
                          <Badge key={skillIndex} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="lg:ml-6">
                      <Button>Apply Now</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Application Process */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center">Application Process</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                  1
                </div>
                <h3 className="font-semibold mb-2">Apply</h3>
                <p className="text-sm text-gray-600">Submit your application with resume and portfolio</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                  2
                </div>
                <h3 className="font-semibold mb-2">Screen</h3>
                <p className="text-sm text-gray-600">Initial phone/video call to discuss your background</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                  3
                </div>
                <h3 className="font-semibold mb-2">Interview</h3>
                <p className="text-sm text-gray-600">Technical and cultural fit interviews with team</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                  4
                </div>
                <h3 className="font-semibold mb-2">Offer</h3>
                <p className="text-sm text-gray-600">Reference check and job offer with competitive package</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact for Careers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Don't See a Perfect Fit?</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              We're always looking for talented individuals to join our team. If you're passionate about technology and want to be part of our mission, we'd love to hear from you.
            </p>
            <Button size="lg">
              Send Us Your Resume
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              Email: careers@earnpay.com
            </p>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}