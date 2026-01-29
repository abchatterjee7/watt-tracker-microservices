import { useState } from 'react';
import { MessageCircle, Phone, Mail, Book, HelpCircle, Search } from 'lucide-react';

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      id: 1,
      question: "How do I add a new device?",
      answer: "Navigate to the Devices page and click the 'Add Device' button. Fill in the device details including name, type, and location, then save to start tracking its energy consumption."
    },
    {
      id: 2,
      question: "What is an energy alert?",
      answer: "Energy alerts notify you when a device's energy consumption exceeds a predefined threshold. You can set custom thresholds for each device in your profile settings."
    },
    {
      id: 3,
      question: "How can I view my energy usage history?",
      answer: "Go to the Usage page where you can view detailed analytics of your energy consumption. You can filter by date range, device, or view overall household usage."
    },
    {
      id: 4,
      question: "How do I reset my password?",
      answer: "Click on 'Forgot Password' on the login page. Enter your email address and we'll send you instructions to reset your password."
    },
    {
      id: 5,
      question: "Can I export my energy data?",
      answer: "Yes, you can export your energy usage data from the Usage page. Click the 'Export' button to download data in CSV format for further analysis."
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Help & Support</h1>
        <p className="text-gray-600">Find answers to common questions or get in touch with our support team.</p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <MessageCircle className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
          <p className="text-gray-600 text-sm mb-3">Chat with our support team in real-time</p>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">Start Chat →</button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <Mail className="w-8 h-8 text-green-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
          <p className="text-gray-600 text-sm mb-3">Get help via email within 24 hours</p>
          <button className="text-green-600 hover:text-green-700 font-medium text-sm">Send Email →</button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <Phone className="w-8 h-8 text-purple-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Phone Support</h3>
          <p className="text-gray-600 text-sm mb-3">Call us Monday-Friday, 9AM-6PM</p>
          <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">Call Now →</button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <HelpCircle className="w-6 h-6 text-gray-400 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredFaqs.map((faq) => (
            <div key={faq.id} className="p-6">
              <button
                onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                className="w-full text-left flex items-center justify-between hover:bg-gray-50 p-2 rounded-md transition-colors"
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-gray-500 transform transition-transform ${
                    expandedFaq === faq.id ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {expandedFaq === faq.id && (
                <div className="mt-3 pl-2 pr-2">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredFaqs.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-gray-500">No results found for "{searchQuery}"</p>
          </div>
        )}
      </div>

      {/* Resources */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Book className="w-6 h-6 text-gray-400 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Resources</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="#" className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <Book className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">User Guide</h3>
              <p className="text-sm text-gray-600">Complete guide to using Watt Tracker</p>
            </div>
          </a>

          <a href="#" className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <HelpCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Video Tutorials</h3>
              <p className="text-sm text-gray-600">Step-by-step video guides</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Help;
