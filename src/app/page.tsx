'use client';

import { useState } from 'react';
import { Gift, Users, Search, Sparkles, Check, X } from 'lucide-react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setSubmitError('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setEmail('');

        // Track signup event with PostHog
        if (typeof window !== 'undefined' && (window as any).posthog) {
          (window as any).posthog.capture('beta_signup', { email });
        }
      } else {
        setSubmitError('Something went wrong. Please try again.');
      }
    } catch (error) {
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-32 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full text-purple-700 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Beta launching Spring 2026
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            One Dashboard.<br />
            Master Lists.<br />
            Group Gifting.<br />
            <span className="text-purple-600">Zero Chaos.</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Stop juggling Amazon wishlists, group texts, and payment requests.
            Elowish brings all your family's gift-giving into one beautiful dashboard.
          </p>

          {/* Email Capture Form */}
          {submitSuccess ? (
            <div className="max-w-md mx-auto bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center gap-3 text-green-800">
                <Check className="w-6 h-6" />
                <p className="text-lg font-medium">You're on the list! We'll be in touch soon.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-4 bg-purple-600 text-white rounded-lg font-semibold text-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Joining...' : 'Join the Beta'}
                </button>
              </div>
              {submitError && (
                <p className="mt-3 text-red-600 text-sm">{submitError}</p>
              )}
            </form>
          )}
        </div>
      </section>

      {/* The Problem Section */}
      <section className="container w-full max-w-none mx-auto px-4 py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 text-center">
            Gift-giving shouldn't feel like herding cats
          </h2>

          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 mb-8">
            <p className="text-lg text-gray-700 leading-relaxed">
              You've been there: Your nephew's birthday is next week. Half the family bought
              the same toy. Aunt Susan never got reimbursed for the group gift. Someone
              bought something from the wishlist without marking it. Your sister-in-law keeps
              texting "Did anyone get the...?" And you're managing this chaos across texts,
              emails, and three different wishlist platforms.
            </p>
          </div>

          <p className="text-xl text-gray-600 text-center">
            There has to be a better way. <span className="font-semibold text-purple-600">There is.</span>
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container w-full max-w-none mx-auto px-4 py-20 bg-purple-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-16 text-center">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Create Master Lists</h3>
              <p className="text-gray-600">
                Build wishlists for anyone in your family. Add items from any store,
                set priorities, and share with your circle.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Coordinate Group Gifts</h3>
              <p className="text-gray-600">
                Split the cost of big gifts. We hold payment until everyone chips in—no
                more awkward Venmo requests.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Track Everything</h3>
              <p className="text-gray-600">
                See who's buying what, get notifications for price drops, and never
                double-gift again.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="container w-full max-w-none mx-auto px-4 py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-16 text-center">
            Everything You Need
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Gift className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Master Lists</h3>
                <p className="text-gray-600">
                  Universal wishlists that work with any store. Add from Amazon, Target,
                  local shops—anywhere. One place for everything.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Group Gifting</h3>
                <p className="text-gray-600">
                  Coordinate big purchases with family. We hold payments until everyone
                  contributes—no one gets stuck footing the bill alone.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Search className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Deal Finder</h3>
                <p className="text-gray-600">
                  Get alerts when prices drop on wishlist items. Save money without
                  checking prices manually.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank You Generator</h3>
                <p className="text-gray-600">
                  Never forget who gave what. Automated reminders and templates make
                  thank-you notes actually happen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table - Why Elowish */}
      <section className="container mw-full max-w-none x-auto px-4 py-20 bg-purple-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-16 text-center">
            Why Elowish?
          </h2>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-6 text-gray-900 font-semibold">Feature</th>
                    <th className="text-center p-6 text-purple-600 font-semibold bg-purple-50">Elowish</th>
                    <th className="text-center p-6 text-gray-600 font-semibold">Amazon Wishlist</th>
                    <th className="text-center p-6 text-gray-600 font-semibold">BabyList</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="p-6 text-gray-900">Works with any store</td>
                    <td className="text-center p-6 bg-purple-50">
                      <Check className="w-6 h-6 text-green-600 mx-auto" />
                    </td>
                    <td className="text-center p-6">
                      <X className="w-6 h-6 text-red-400 mx-auto" />
                    </td>
                    <td className="text-center p-6">
                      <Check className="w-6 h-6 text-green-600 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="p-6 text-gray-900">Group gift coordination</td>
                    <td className="text-center p-6 bg-purple-50">
                      <Check className="w-6 h-6 text-green-600 mx-auto" />
                    </td>
                    <td className="text-center p-6">
                      <X className="w-6 h-6 text-red-400 mx-auto" />
                    </td>
                    <td className="text-center p-6">
                      <X className="w-6 h-6 text-red-400 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="p-6 text-gray-900">Smart payment holds</td>
                    <td className="text-center p-6 bg-purple-50">
                      <Check className="w-6 h-6 text-green-600 mx-auto" />
                    </td>
                    <td className="text-center p-6">
                      <X className="w-6 h-6 text-red-400 mx-auto" />
                    </td>
                    <td className="text-center p-6">
                      <X className="w-6 h-6 text-red-400 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="p-6 text-gray-900">Price drop alerts</td>
                    <td className="text-center p-6 bg-purple-50">
                      <Check className="w-6 h-6 text-green-600 mx-auto" />
                    </td>
                    <td className="text-center p-6">
                      <X className="w-6 h-6 text-red-400 mx-auto" />
                    </td>
                    <td className="text-center p-6">
                      <X className="w-6 h-6 text-red-400 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="p-6 text-gray-900">Family dashboard</td>
                    <td className="text-center p-6 bg-purple-50">
                      <Check className="w-6 h-6 text-green-600 mx-auto" />
                    </td>
                    <td className="text-center p-6">
                      <X className="w-6 h-6 text-red-400 mx-auto" />
                    </td>
                    <td className="text-center p-6">
                      <X className="w-6 h-6 text-red-400 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="p-6 text-gray-900">Thank you tracking</td>
                    <td className="text-center p-6 bg-purple-50">
                      <Check className="w-6 h-6 text-green-600 mx-auto" />
                    </td>
                    <td className="text-center p-6">
                      <X className="w-6 h-6 text-red-400 mx-auto" />
                    </td>
                    <td className="text-center p-6">
                      <X className="w-6 h-6 text-red-400 mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="container w-full max-w-none mx-auto px-4 py-20 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
            Coming Soon
          </h2>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12">
            <div className="flex-1 bg-purple-50 rounded-2xl p-8">
              <div className="text-purple-600 font-semibold text-sm uppercase tracking-wide mb-2">
                Beta Launch
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">Spring 2026</div>
              <p className="text-gray-600">
                Limited beta access for early adopters
              </p>
            </div>

            <div className="flex-1 bg-gray-50 rounded-2xl p-8">
              <div className="text-gray-600 font-semibold text-sm uppercase tracking-wide mb-2">
                Public Launch
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">Summer 2026</div>
              <p className="text-gray-600">
                Full platform available to everyone
              </p>
            </div>
          </div>

          <p className="text-lg text-gray-600 mb-8">
            Join the beta to get early access and help shape the future of family gifting.
          </p>

          <a
            href="#hero"
            className="inline-block px-8 py-4 bg-purple-600 text-white rounded-lg font-semibold text-lg hover:bg-purple-700 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Join the Beta
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold text-purple-600 mb-2">Elowish</h3>
              <p className="text-gray-600">Making family gifting effortless</p>
            </div>

            <div className="flex flex-col items-center md:items-end gap-2">
              <p className="text-gray-600">Questions?</p>
              <a
                href="mailto:hello@elowish.com"
                className="text-purple-600 font-semibold hover:text-purple-700 transition-colors"
              >
                hello@elowish.com
              </a>
            </div>
          </div>

          <div className="max-w-5xl mx-auto mt-8 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Elowish. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
