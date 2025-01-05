import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const LandingPage: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<number>(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
          >
            Transform Your Care Home Management
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 mb-8"
          >
            Streamline bed allocation, optimize occupancy, and enhance patient care with our intelligent bed management system
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Link 
              href="/signup"
              className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition duration-300"
            >
              Start Free Trial
            </Link>
          </motion.div>
        </div>

        <div className="mb-16">
          <motion.div 
            className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex space-x-4 mb-6">
              {demoTabs.map((tab, index) => (
                <button
                  key={tab.title}
                  onClick={() => setActiveDemo(index)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeDemo === index
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.title}
                </button>
              ))}
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDemo}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative aspect-video rounded-lg overflow-hidden"
              >
                <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-sm flex items-center justify-center">
                  {!isVideoPlaying && (
                    <button
                      onClick={() => setIsVideoPlaying(true)}
                      className="bg-white/90 hover:bg-white px-6 py-3 rounded-full flex items-center space-x-2 transition-colors"
                    >
                      <span className="text-blue-600">▶</span>
                      <span>Watch Demo</span>
                    </button>
                  )}
                </div>
                {demoTabs[activeDemo].content}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * (index + 1) }}
              className="bg-white p-6 rounded-lg shadow-lg"
            >
              <div className="text-blue-600 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="grid md:grid-cols-4 gap-6 mb-16 max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center p-4 bg-white rounded-lg shadow-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-2xl font-bold text-blue-600">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="inline-flex items-center space-x-2 text-gray-600"
          >
            <span>🔒 Secure & Compliant</span>
            <span>•</span>
            <span>📊 Real-time Analytics</span>
            <span>•</span>
            <span>🔄 24/7 Support</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const features = [
  {
    icon: '🎯',
    title: 'Smart Bed Allocation',
    description: 'Optimize bed assignments with AI-powered recommendations based on patient needs and facility capacity.'
  },
  {
    icon: '📈',
    title: 'Real-time Analytics',
    description: 'Make data-driven decisions with comprehensive analytics on occupancy rates and resource utilization.'
  },
  {
    icon: '🔄',
    title: 'Seamless Transfers',
    description: 'Manage bed transfers efficiently with automated workflows and real-time status tracking.'
  }
];

const demoTabs = [
  {
    title: 'Bed Allocation',
    content: <div className="bg-gray-100 w-full h-full flex items-center justify-center">Bed Allocation Demo Content</div>
  },
  {
    title: 'Transfer Management',
    content: <div className="bg-gray-100 w-full h-full flex items-center justify-center">Transfer Management Demo Content</div>
  },
  {
    title: 'Analytics Dashboard',
    content: <div className="bg-gray-100 w-full h-full flex items-center justify-center">Analytics Dashboard Demo Content</div>
  }
];

const stats = [
  { value: '99.9%', label: 'Uptime' },
  { value: '45%', label: 'Efficiency Increase' },
  { value: '2.5x', label: 'Faster Transfers' },
  { value: '24/7', label: 'Support' }
];

export default LandingPage;


