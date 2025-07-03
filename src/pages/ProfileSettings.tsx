
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { User, Mail, Phone, MapPin, Calendar, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import Header from '../components/Header';

const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    dateOfBirth: '',
    emergencyContact: '',
    emergencyPhone: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 p-2"
            aria-label="Go back to previous page"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage your personal information and preferences</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Overview Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center p-4 sm:p-6">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 mx-auto mb-4">
                <AvatarFallback className="bg-careviah-green text-white text-xl sm:text-2xl">
                  {user?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-lg sm:text-xl">{user?.name}</CardTitle>
              <CardDescription className="text-sm break-all">{user?.email}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3 text-sm">
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>Verified Email</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <User className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>Active Caregiver</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>Member since 2024</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information Form */}
          <Card className="lg:col-span-2">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Personal Information</CardTitle>
              <CardDescription className="text-sm">
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-4 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="h-11"
                    aria-describedby="name-description"
                  />
                  <p id="name-description" className="sr-only">
                    Enter your legal full name as it appears on official documents
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="h-11"
                    aria-describedby="email-description"
                  />
                  <p id="email-description" className="sr-only">
                    This email will be used for account notifications and login
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                    className="h-11"
                    aria-describedby="phone-description"
                  />
                  <p id="phone-description" className="sr-only">
                    Your primary contact phone number
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-sm font-medium">
                    Date of Birth
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="h-11"
                    aria-describedby="dob-description"
                  />
                  <p id="dob-description" className="sr-only">
                    Your date of birth for age verification purposes
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium">
                  Home Address
                </Label>
                <Input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 Main Street, City, State, ZIP"
                  className="h-11"
                  aria-describedby="address-description"
                />
                <p id="address-description" className="sr-only">
                  Your primary residential address
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-semibold flex items-center">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Emergency Contact
                </h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact" className="text-sm font-medium">
                      Emergency Contact Name
                    </Label>
                    <Input
                      id="emergencyContact"
                      type="text"
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                      placeholder="Contact person's name"
                      className="h-11"
                      aria-describedby="emergency-contact-description"
                    />
                    <p id="emergency-contact-description" className="sr-only">
                      Name of person to contact in case of emergency
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone" className="text-sm font-medium">
                      Emergency Contact Phone
                    </Label>
                    <Input
                      id="emergencyPhone"
                      type="tel"
                      value={formData.emergencyPhone}
                      onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                      placeholder="(555) 123-4567"
                      className="h-11"
                      aria-describedby="emergency-phone-description"
                    />
                    <p id="emergency-phone-description" className="sr-only">
                      Phone number of your emergency contact
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-careviah-green hover:bg-careviah-green/90 text-white px-6 h-11"
                  aria-describedby="save-button-description"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
                <p id="save-button-description" className="sr-only">
                  Click to save all changes made to your profile
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ProfileSettings;
