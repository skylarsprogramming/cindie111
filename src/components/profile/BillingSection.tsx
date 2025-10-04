'use client';

import { useState } from 'react';
import { UserProfile, PaymentMethod, Invoice, SubscriptionInfo } from '@/lib/types';

interface BillingSectionProps {
  profile: UserProfile;
}

export function BillingSection({ profile }: BillingSectionProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'payment-methods' | 'invoices' | 'subscription'>('overview');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Mock data - in a real app, this would come from your billing provider (Stripe, etc.)
  const mockBillingData = {
    subscription: {
      plan: 'premium' as const,
      status: 'active' as const,
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      autoRenew: true
    },
    paymentMethods: [
      {
        id: 'pm_1',
        type: 'card' as const,
        last4: '4242',
        brand: 'Visa',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true,
        createdAt: '2024-01-15'
      }
    ],
    invoices: [
      {
        id: 'inv_1',
        amount: 29.99,
        currency: 'USD',
        status: 'paid' as const,
        date: '2024-01-15',
        description: 'Premium Plan - Monthly',
        downloadUrl: '#'
      },
      {
        id: 'inv_2',
        amount: 29.99,
        currency: 'USD',
        status: 'paid' as const,
        date: '2023-12-15',
        description: 'Premium Plan - Monthly',
        downloadUrl: '#'
      }
    ]
  };

  const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSubscriptionStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'trial': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanColor = (plan: string): string => {
    switch (plan) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'pro': return 'bg-gold-100 text-gold-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Billing & Subscription</h2>
        <p className="text-gray-600">Manage your subscription, payment methods, and view invoices.</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'subscription', label: 'Subscription', icon: '💎' },
            { id: 'payment-methods', label: 'Payment Methods', icon: '💳' },
            { id: 'invoices', label: 'Invoices', icon: '🧾' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subscription Overview */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Subscription</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Plan</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPlanColor(mockBillingData.subscription.plan)}`}>
                    {mockBillingData.subscription.plan.charAt(0).toUpperCase() + mockBillingData.subscription.plan.slice(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSubscriptionStatusColor(mockBillingData.subscription.status)}`}>
                    {mockBillingData.subscription.status.charAt(0).toUpperCase() + mockBillingData.subscription.status.slice(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Next Billing Date</span>
                  <span className="text-sm font-medium text-gray-900">
                    {mockBillingData.subscription.endDate ? formatDate(mockBillingData.subscription.endDate) : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Auto-renewal</span>
                  <span className="text-sm font-medium text-gray-900">
                    {mockBillingData.subscription.autoRenew ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
              <div className="mt-6 flex space-x-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  Manage Subscription
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                  Cancel
                </button>
              </div>
            </div>

            {/* Payment Method Overview */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Payment Method</h3>
              {mockBillingData.paymentMethods.find(pm => pm.isDefault) ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {mockBillingData.paymentMethods[0].brand?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {mockBillingData.paymentMethods[0].brand} •••• {mockBillingData.paymentMethods[0].last4}
                      </p>
                      <p className="text-sm text-gray-600">
                        Expires {mockBillingData.paymentMethods[0].expiryMonth}/{mockBillingData.paymentMethods[0].expiryYear}
                      </p>
                    </div>
                  </div>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                    Update Payment Method
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">💳</div>
                  <p className="text-gray-600 mb-4">No payment method on file</p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    Add Payment Method
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'subscription' && (
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Subscription Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Free Plan</h4>
                <div className="text-3xl font-bold text-gray-900 mb-2">$0</div>
                <div className="text-sm text-gray-600 mb-4">Basic features</div>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  Current Plan
                </button>
              </div>
              
              <div className="text-center p-6 border border-purple-200 rounded-lg bg-purple-50 relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-purple-600 text-white px-3 py-1 text-xs font-medium rounded-full">
                    Current
                  </span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Premium Plan</h4>
                <div className="text-3xl font-bold text-gray-900 mb-2">$29.99</div>
                <div className="text-sm text-gray-600 mb-4">Advanced features</div>
                <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  Active
                </button>
              </div>
              
              <div className="text-center p-6 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Pro Plan</h4>
                <div className="text-3xl font-bold text-gray-900 mb-2">$49.99</div>
                <div className="text-sm text-gray-600 mb-4">All features</div>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Upgrade
                </button>
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="font-medium text-gray-900 mb-4">Subscription Management</h4>
              <div className="flex flex-wrap gap-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  Change Plan
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                  Pause Subscription
                </button>
                <button className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 text-sm">
                  Cancel Subscription
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payment-methods' && (
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                Add Payment Method
              </button>
            </div>
            
            <div className="space-y-4">
              {mockBillingData.paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {method.brand?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {method.brand} •••• {method.last4}
                      </p>
                      <p className="text-sm text-gray-600">
                        Expires {method.expiryMonth}/{method.expiryYear}
                      </p>
                    </div>
                    {method.isDefault && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                      Edit
                    </button>
                    {!method.isDefault && (
                      <button className="px-3 py-1 text-sm border border-red-300 text-red-700 rounded hover:bg-red-50">
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Invoices</h3>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                Download All
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockBillingData.invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{invoice.id}</div>
                          <div className="text-sm text-gray-500">{invoice.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(invoice.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900">
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
