'use client';

import { useState } from 'react';
import { HelpCircle, Mail, MessageSquare, Clock, Phone, MapPin, Globe, Users, Shield, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { ORG } from '@/lib/site';

const SupportSection = () => {
  const { user, userProfile } = useAuth();
  const [formData, setFormData] = useState({
    fullName: userProfile?.displayName || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send support message to the support messages system
      const response = await fetch('/api/support-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: formData.subject,
          message: formData.message,
          priority: 'normal'
        })
      });

      if (response.ok) {
        toast.success('Support message sent successfully! We\'ll get back to you soon.');
        // Reset form
        setFormData(prev => ({
          ...prev,
          subject: '',
          message: ''
        }));
      } else {
        throw new Error('Failed to send support message');
      }
    } catch (error) {
      console.error('Error sending support message:', error);
      toast.error('Failed to send support message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 mobile:space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-4 mobile:p-6">
        <p className="text-sm mobile:text-base text-gray-600 mb-4 mobile:mb-6">
          Get help and contact our support team. Send us a message and we&apos;ll get back to you as soon as possible.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mobile:gap-8">
          {/* Support Form - Left Side */}
          <div>
            <h4 className="text-sm mobile:text-base font-semibold text-gray-900 mb-3 mobile:mb-4">Send us a Message</h4>
            <form onSubmit={handleSubmit} className="space-y-3 mobile:space-y-4">
              <div>
                <label className="block text-xs mobile:text-sm font-medium text-gray-700 mb-1.5 mobile:mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 mobile:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm mobile:text-base"
                  placeholder="Your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-xs mobile:text-sm font-medium text-gray-700 mb-1.5 mobile:mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 mobile:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm mobile:text-base"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs mobile:text-sm font-medium text-gray-700 mb-1.5 mobile:mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 mobile:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm mobile:text-base"
                  placeholder="What can we help you with?"
                  required
                />
              </div>

              <div>
                <label className="block text-xs mobile:text-sm font-medium text-gray-700 mb-1.5 mobile:mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2.5 mobile:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm mobile:text-base"
                  placeholder="Please describe your issue or question in detail..."
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white py-2.5 mobile:py-3 px-6 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2 text-sm mobile:text-base"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 mobile:h-5 mobile:w-5 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Send Message</span>
                )}
              </button>
            </form>
          </div>

          {/* Contact Information & Support Details - Right Side */}
          <div className="space-y-4 mobile:space-y-6">
            {/* Contact Methods */}
            <div>
              <h4 className="text-sm mobile:text-base font-semibold text-gray-900 mb-3 mobile:mb-4">Get in Touch</h4>
              <div className="space-y-3 mobile:space-y-4">
                <div className="flex items-center space-x-3 p-2.5 mobile:p-3 bg-gray-50 rounded-lg">
                  <div className="w-9 h-9 mobile:w-10 mobile:h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 mobile:w-5 mobile:h-5 text-primary-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm mobile:text-base">Email Support</p>
                    <p className="text-xs mobile:text-sm text-gray-600">{ORG.email}</p>
                    <p className="text-[10px] mobile:text-xs text-gray-500">Response within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-2.5 mobile:p-3 bg-gray-50 rounded-lg">
                  <div className="w-9 h-9 mobile:w-10 mobile:h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4 mobile:w-5 mobile:h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm mobile:text-base">Live Chat</p>
                    <p className="text-xs mobile:text-sm text-gray-600">Available 24/7</p>
                    <p className="text-[10px] mobile:text-xs text-gray-500">Instant response</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-2.5 mobile:p-3 bg-gray-50 rounded-lg">
                  <div className="w-9 h-9 mobile:w-10 mobile:h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 mobile:w-5 mobile:h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm mobile:text-base">Phone Support</p>
                    <p className="text-xs mobile:text-sm text-gray-600">+1 800 555 0199</p>
                    <p className="text-[10px] mobile:text-xs text-gray-500">Mon-Fri 9:00-17:00 GMT</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Office Information */}
            <div>
              <h4 className="text-sm mobile:text-base font-semibold text-gray-900 mb-3 mobile:mb-4">Our Office</h4>
              <div className="space-y-2 mobile:space-y-3">
                <div className="flex items-start space-x-2.5 mobile:space-x-3">
                  <MapPin className="w-4 h-4 mobile:w-5 mobile:h-5 text-gray-400 mt-1 shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm mobile:text-base">Solariem Worldwide</p>
                    <p className="text-xs mobile:text-sm text-gray-600">Global Headquarters</p>
                    <p className="text-xs mobile:text-sm text-gray-600">Digital-first, worldwide</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5 mobile:space-x-3">
                  <Clock className="w-4 h-4 mobile:w-5 mobile:h-5 text-gray-400 mt-1 shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm mobile:text-base">Business Hours</p>
                    <p className="text-xs mobile:text-sm text-gray-600">Monday - Friday: 09:00 – 17:00 GMT</p>
                    <p className="text-xs mobile:text-sm text-gray-600">Saturday - Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Help */}
            <div>
              <h4 className="text-sm mobile:text-base font-semibold text-gray-900 mb-3 mobile:mb-4">Quick Help</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mobile:gap-3">
                <div className="flex flex-col items-center text-center p-3 bg-blue-50 rounded-xl">
                  <HelpCircle className="w-5 h-5 mobile:w-6 mobile:h-6 text-blue-600 mb-1.5 mobile:mb-2" />
                  <div>
                    <p className="font-bold text-gray-900 text-xs mobile:text-sm">Help Center</p>
                    <p className="text-[10px] mobile:text-xs text-gray-500">Knowledge base</p>
                  </div>
                </div>

                <div className="flex flex-col items-center text-center p-3 bg-purple-50 rounded-xl">
                  <Users className="w-5 h-5 mobile:w-6 mobile:h-6 text-purple-600 mb-1.5 mobile:mb-2" />
                  <div>
                    <p className="font-bold text-gray-900 text-xs mobile:text-sm">Community</p>
                    <p className="text-[10px] mobile:text-xs text-gray-500">Connect with others</p>
                  </div>
                </div>

                <div className="flex flex-col items-center text-center p-3 bg-orange-50 rounded-xl">
                  <Shield className="w-5 h-5 mobile:w-6 mobile:h-6 text-orange-600 mb-1.5 mobile:mb-2" />
                  <div>
                    <p className="font-bold text-gray-900 text-xs mobile:text-sm">Security</p>
                    <p className="text-[10px] mobile:text-xs text-gray-500">Report issues</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Times */}
            <div className="bg-gradient-to-r from-red-50 to-blue-50 rounded-lg p-3.5 mobile:p-4">
              <h5 className="font-semibold text-gray-900 mb-1.5 mobile:mb-2 flex items-center text-sm mobile:text-base">
                <Zap className="w-3.5 h-3.5 mobile:w-4 mobile:h-4 mr-1.5 mobile:mr-2 text-primary-500" />
                Response Times
              </h5>
              <div className="space-y-1.5 mobile:space-y-2 text-[10px] mobile:text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">General Inquiries:</span>
                  <span className="font-medium text-gray-900">24 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Technical Issues:</span>
                  <span className="font-medium text-gray-900">12 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Urgent Matters:</span>
                  <span className="font-medium text-gray-900">2 hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportSection;
