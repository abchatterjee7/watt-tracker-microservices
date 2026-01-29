import { useState, useEffect } from 'react';

const CookiePolicy = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Cookie Policy</h1>
          
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">What Are Cookies</h2>
              <p className="text-gray-700 leading-relaxed">
                Cookies are small text files that are placed on your device when you visit our website. 
                They help us provide you with a better experience by remembering your preferences, 
                analyzing traffic, and personalizing content.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Cookies</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Essential Cookies</h3>
                  <p className="text-gray-700">
                    These cookies are necessary for the website to function and cannot be switched off 
                    in our systems. They are usually only set in response to actions made by you.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Performance Cookies</h3>
                  <p className="text-gray-700">
                    These cookies allow us to count visits and traffic sources so we can measure and 
                    improve the performance of our site. They help us to know which pages are the 
                    most and least popular and see how visitors move around the site.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Functional Cookies</h3>
                  <p className="text-gray-700">
                    These cookies enable the website to provide enhanced functionality and personalization. 
                    They may be set by us or by third-party providers whose services we have added to our pages.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Targeting Cookies</h3>
                  <p className="text-gray-700">
                    These cookies may be set through our site by our advertising partners to build a 
                    profile of your interests and show you relevant adverts on other sites.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Types of Cookies We Use</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Cookie Name</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Purpose</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-700">session_id</td>
                      <td className="px-4 py-2 text-sm text-gray-700">Maintains user session</td>
                      <td className="px-4 py-2 text-sm text-gray-700">Session</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-700">auth_token</td>
                      <td className="px-4 py-2 text-sm text-gray-700">Authentication</td>
                      <td className="px-4 py-2 text-sm text-gray-700">30 days</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-700">preferences</td>
                      <td className="px-4 py-2 text-sm text-gray-700">User preferences</td>
                      <td className="px-4 py-2 text-sm text-gray-700">1 year</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-700">analytics_id</td>
                      <td className="px-4 py-2 text-sm text-gray-700">Website analytics</td>
                      <td className="px-4 py-2 text-sm text-gray-700">2 years</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Managing Your Cookie Preferences</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You have several options to manage cookies:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Browser settings to block or delete cookies</li>
                <li>Cookie consent banner on our website</li>
                <li>Privacy settings in your account dashboard</li>
                <li>Opt-out links in marketing communications</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Cookies</h2>
              <p className="text-gray-700 leading-relaxed">
                We use third-party services that may place cookies on your device. These include:
              </p>
              <div className="mt-4 space-y-2">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">
                    <strong>Google Analytics:</strong> For website traffic analysis and user behavior insights
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">
                    <strong>Cloudflare:</strong> For security and performance optimization
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">
                    <strong>Payment Processors:</strong> For secure payment processing
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookie Consent</h2>
              <p className="text-gray-700 leading-relaxed">
                When you first visit our website, you'll see a cookie consent banner where you can:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mt-4">
                <li>Accept all cookies</li>
                <li>Reject non-essential cookies</li>
                <li>Customize your cookie preferences</li>
                <li>Change preferences at any time</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
              <p className="text-gray-700 leading-relaxed">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mt-4">
                <li>Know what cookies are being used</li>
                <li>Accept or reject cookies</li>
                <li>Withdraw consent at any time</li>
                <li>Access information about cookies on your device</li>
                <li>Request deletion of your data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Updates to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Cookie Policy from time to time to reflect changes in our 
                practices or for other operational, legal, or regulatory reasons. We will notify 
                you of any material changes by posting the new policy on this page.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about our use of cookies, please contact us:
              </p>
              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@watttracker.com<br />
                  <strong>Phone:</strong> +91 9999999999<br />
                  <strong>Address:</strong> CS Street, HiTech City, Hyderabad, Telangana 500001
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
