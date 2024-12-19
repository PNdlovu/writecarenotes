'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/form/input';
import { Label } from '@/components/ui/form/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { StarIcon } from '@/icons/heroicons/solid';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`performance-tabpanel-${index}`}
      aria-labelledby={`performance-tab-${index}`}
      className="py-6"
      {...other}
    >
      {value === index && children}
    </div>
  );
}

interface PerformancePanelProps {
  careHomeId: string;
}

export function PerformancePanel({ careHomeId }: PerformancePanelProps) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [rating, setRating] = useState(0);

  const handleTabChange = (index: number) => {
    setSelectedTab(index);
  };

  const tabs = [
    { label: 'Reviews', id: 0 },
    { label: 'Goals', id: 1 },
    { label: 'Metrics', id: 2 },
  ];

  const renderStarRating = (value: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={cn(
              'h-5 w-5',
              star <= value ? 'text-yellow-400' : 'text-gray-300'
            )}
            onClick={() => setRating(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold mb-2">Performance Management</h2>
          <p className="text-gray-600">Track and manage staff performance metrics</p>
        </div>
        <Button onClick={() => setOpenDialog(true)}>
          Add Review
        </Button>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                selectedTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <TabPanel value={selectedTab} index={0}>
        <div className="grid gap-6">
          {/* Sample Reviews */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-medium">Annual Performance Review</h3>
                <p className="text-sm text-gray-500">Sarah Johnson - Nurse</p>
              </div>
              {renderStarRating(4)}
            </div>
            <p className="text-gray-600">Consistently demonstrates excellent patient care and leadership qualities.</p>
          </div>
        </div>
      </TabPanel>

      <TabPanel value={selectedTab} index={1}>
        <div className="grid gap-6">
          {/* Sample Goals */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-medium mb-2">Complete Advanced Certification</h3>
            <div className="flex items-center mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: '70%' }}></div>
              </div>
              <span className="ml-4 text-sm text-gray-600">70%</span>
            </div>
            <p className="text-sm text-gray-600">Target completion: December 2024</p>
          </div>
        </div>
      </TabPanel>

      <TabPanel value={selectedTab} index={2}>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Sample Metrics */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium mb-2">Attendance Rate</h3>
            <p className="text-3xl font-bold text-primary">98%</p>
            <p className="text-sm text-gray-600 mt-2">Last 30 days</p>
          </div>
        </div>
      </TabPanel>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Performance Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Staff Member</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Sarah Johnson</SelectItem>
                  <SelectItem value="2">Michael Smith</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Rating</Label>
              {renderStarRating(rating)}
            </div>

            <div className="space-y-2">
              <Label>Comments</Label>
              <Input className="h-32" placeholder="Enter review comments..." />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpenDialog(false)}>
                Submit Review
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


