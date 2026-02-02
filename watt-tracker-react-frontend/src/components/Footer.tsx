import { Github, Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white relative">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="py-6 md:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {/* Brand Section */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start mb-3 md:mb-4">
                <img src="./logo.png" className="w-8 h-8 md:w-10 md:h-10 mr-2" alt=""/>
                <span className="text-lg md:text-xl font-bold">Watt Tracker</span>
              </div>
              <p className="text-gray-300 mb-4 text-sm md:text-base max-w-md mx-auto sm:mx-0">
                Your comprehensive energy monitoring solution for smart homes. Track, analyze, and optimize your energy consumption with real-time insights and intelligent alerts.
              </p>
              <div className="flex justify-center sm:justify-start space-x-3 md:space-x-4">
                <a
                  href="https://github.com/abchatterjee7"
                  className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-gray-800"
                  aria-label="GitHub"
                >
                  <Github className="w-4 h-4 md:w-5 md:h-5" />
                </a>
                <a
                  href="https://www.x.com/AadityaRaj8"
                  className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-gray-800"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4 md:w-5 md:h-5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/abchatterjee7/"
                  className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-gray-800"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4 md:w-5 md:h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="text-center sm:text-left">
              <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Quick Links</h3>
              <ul className="space-y-1.5 md:space-y-2">
                <li>
                  <a href="/" className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="/devices" className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
                    Devices
                  </a>
                </li>
                <li>
                  <a href="/usage" className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
                    Usage Analytics
                  </a>
                </li>
                <li>
                  <a href="/alerts" className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
                    Alerts
                  </a>
                </li>
                <li>
                  <a href="/insights" className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
                    AI Tips
                  </a>
                </li>
                <li>
                  <a href="/settings" className="text-gray-300 hover:text-white transition-colors text-sm md:text-base">
                    Settings
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="text-center sm:text-left">
              <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Contact</h3>
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center justify-center sm:justify-start text-gray-300">
                  <Mail className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2 text-blue-400 flex-shrink-0" />
                  <span className="text-xs md:text-sm truncate">support@watttracker.com</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start text-gray-300">
                  <Phone className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2 text-blue-400 flex-shrink-0" />
                  <span className="text-xs md:text-sm">+91 9999999999</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start text-gray-300">
                  <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2 text-blue-400 flex-shrink-0" />
                  <span className="text-xs md:text-sm">Hyderabad, India</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
              <div className="text-gray-400 text-xs md:text-sm text-center md:text-left">
                © {currentYear} Watt Tracker. All rights reserved.
              </div>
              <div className="flex flex-wrap justify-center md:justify-end space-x-4 md:space-x-6 text-xs md:text-sm">
                <a href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </a>
                <a href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </a>
                <a href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
