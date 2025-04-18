'use client';

import { useState } from 'react';
import { 
  ArrowDownTrayIcon, 
  GlobeAltIcon, 
  BellIcon, 
  ShieldCheckIcon, 
  EnvelopeIcon, 
  UserIcon 
} from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  
  // Mock settings data
  const [settings, setSettings] = useState({
    general: {
      blogTitle: 'Chiller Blog',
      blogDescription: 'Official blog for Chiller Transport',
      baseUrl: 'https://blog.chillertransport.com',
      postsPerPage: 10,
      logoUrl: '/logo.jpg',
    },
    appearance: {
      theme: 'light',
      accentColor: '#1e40af', // Blue
      enableDarkMode: true,
      showAuthorBio: true,
      defaultThumbnail: '/default-thumbnail.jpg',
    },
    notifications: {
      emailOnNewComment: true,
      emailOnNewSubscriber: true,
      emailOnNewPost: false,
      digestFrequency: 'weekly',
    },
    security: {
      enableTwoFactor: false,
      requireApprovalForComments: true,
      autoModerateComments: true,
      allowUserRegistration: false,
    }
  });

  const handleInputChange = (section, field, value) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value
      }
    });
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    
    // Mock API request
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would normally send the settings to your API
      console.log('Settings saved:', settings);
      
      // Show success message
      alert('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <button 
          onClick={handleSaveSettings}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center transition-colors disabled:opacity-50"
        >
          <ArrowDownTrayIcon className="h-4 w-4 mr-2" /> 
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('general')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'general'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <GlobeAltIcon className="h-4 w-4 mr-2" /> General
            </div>
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'appearance'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <UserIcon className="h-4 w-4 mr-2" /> Appearance
            </div>
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'notifications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <BellIcon className="h-4 w-4 mr-2" /> Notifications
            </div>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'security'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <ShieldCheckIcon className="h-4 w-4 mr-2" /> Security
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-md">
        {activeTab === 'general' && (
          <div className="p-6 space-y-6">
            <h2 className="text-lg font-medium text-gray-800">General Settings</h2>
            <p className="text-sm text-gray-500 mb-6">Configure your blog&apos;s basic information.</p>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="blogTitle" className="block text-sm font-medium text-gray-700">
                  Blog Title
                </label>
                <input
                  type="text"
                  id="blogTitle"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={settings.general.blogTitle}
                  onChange={(e) => handleInputChange('general', 'blogTitle', e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="blogDescription" className="block text-sm font-medium text-gray-700">
                  Blog Description
                </label>
                <textarea
                  id="blogDescription"
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={settings.general.blogDescription}
                  onChange={(e) => handleInputChange('general', 'blogDescription', e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="baseUrl" className="block text-sm font-medium text-gray-700">
                  Base URL
                </label>
                <input
                  type="text"
                  id="baseUrl"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={settings.general.baseUrl}
                  onChange={(e) => handleInputChange('general', 'baseUrl', e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="postsPerPage" className="block text-sm font-medium text-gray-700">
                  Posts Per Page
                </label>
                <input
                  type="number"
                  id="postsPerPage"
                  min={1}
                  max={50}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={settings.general.postsPerPage}
                  onChange={(e) => handleInputChange('general', 'postsPerPage', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="p-6 space-y-6">
            <h2 className="text-lg font-medium text-gray-800">Appearance Settings</h2>
            <p className="text-sm text-gray-500 mb-6">Customize how your blog looks.</p>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                  Theme
                </label>
                <select
                  id="theme"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={settings.appearance.theme}
                  onChange={(e) => handleInputChange('appearance', 'theme', e.target.value)}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="accentColor" className="block text-sm font-medium text-gray-700">
                  Accent Color
                </label>
                <div className="flex mt-1">
                  <input
                    type="color"
                    id="accentColor"
                    className="h-9 w-16 border border-gray-300 rounded-md shadow-sm p-1 mr-2"
                    value={settings.appearance.accentColor}
                    onChange={(e) => handleInputChange('appearance', 'accentColor', e.target.value)}
                  />
                  <input
                    type="text"
                    className="flex-1 border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    value={settings.appearance.accentColor}
                    onChange={(e) => handleInputChange('appearance', 'accentColor', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableDarkMode"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.appearance.enableDarkMode}
                  onChange={(e) => handleInputChange('appearance', 'enableDarkMode', e.target.checked)}
                />
                <label htmlFor="enableDarkMode" className="ml-2 block text-sm text-gray-700">
                  Enable dark mode toggle for visitors
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showAuthorBio"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.appearance.showAuthorBio}
                  onChange={(e) => handleInputChange('appearance', 'showAuthorBio', e.target.checked)}
                />
                <label htmlFor="showAuthorBio" className="ml-2 block text-sm text-gray-700">
                  Show author bio on posts
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="p-6 space-y-6">
            <h2 className="text-lg font-medium text-gray-800">Notification Settings</h2>
            <p className="text-sm text-gray-500 mb-6">Manage email and system notifications.</p>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailOnNewComment"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.notifications.emailOnNewComment}
                  onChange={(e) => handleInputChange('notifications', 'emailOnNewComment', e.target.checked)}
                />
                <label htmlFor="emailOnNewComment" className="ml-2 block text-sm text-gray-700">
                  Email me when a new comment is posted
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailOnNewSubscriber"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.notifications.emailOnNewSubscriber}
                  onChange={(e) => handleInputChange('notifications', 'emailOnNewSubscriber', e.target.checked)}
                />
                <label htmlFor="emailOnNewSubscriber" className="ml-2 block text-sm text-gray-700">
                  Email me when someone subscribes to the blog
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailOnNewPost"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.notifications.emailOnNewPost}
                  onChange={(e) => handleInputChange('notifications', 'emailOnNewPost', e.target.checked)}
                />
                <label htmlFor="emailOnNewPost" className="ml-2 block text-sm text-gray-700">
                  Email authors when their post is published
                </label>
              </div>
              
              <div>
                <label htmlFor="digestFrequency" className="block text-sm font-medium text-gray-700">
                  Activity Digest Frequency
                </label>
                <select
                  id="digestFrequency"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={settings.notifications.digestFrequency}
                  onChange={(e) => handleInputChange('notifications', 'digestFrequency', e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="never">Never</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="p-6 space-y-6">
            <h2 className="text-lg font-medium text-gray-800">Security Settings</h2>
            <p className="text-sm text-gray-500 mb-6">Configure security options for your blog.</p>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableTwoFactor"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.security.enableTwoFactor}
                  onChange={(e) => handleInputChange('security', 'enableTwoFactor', e.target.checked)}
                />
                <label htmlFor="enableTwoFactor" className="ml-2 block text-sm text-gray-700">
                  Enable two-factor authentication
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireApprovalForComments"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.security.requireApprovalForComments}
                  onChange={(e) => handleInputChange('security', 'requireApprovalForComments', e.target.checked)}
                />
                <label htmlFor="requireApprovalForComments" className="ml-2 block text-sm text-gray-700">
                  Require approval for comments
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoModerateComments"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.security.autoModerateComments}
                  onChange={(e) => handleInputChange('security', 'autoModerateComments', e.target.checked)}
                />
                <label htmlFor="autoModerateComments" className="ml-2 block text-sm text-gray-700">
                  Auto-moderate comments with AI
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowUserRegistration"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.security.allowUserRegistration}
                  onChange={(e) => handleInputChange('security', 'allowUserRegistration', e.target.checked)}
                />
                <label htmlFor="allowUserRegistration" className="ml-2 block text-sm text-gray-700">
                  Allow public user registration
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
