/**
 * WriteCareNotes.com
 * @fileoverview Features Component - Displays enterprise care home management capabilities
 * @version 1.1.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import { CalendarClock, CheckCircle2, Users, Bell, Wallet, LineChart, CircleDollarSign, ClipboardCheck, Stethoscope, Activity, Shield, FileText, Scale, Building2, Bed, Tool, Warehouse, Clipboard, Wrench } from "lucide-react";

export function Features() {
  return (
    <>
      {/* Main Features Section */}
      <section className="py-24 bg-white w-full">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h1 className="text-4xl font-bold mb-4">Enterprise Care Home Management Platform</h1>
            <p className="text-xl text-gray-600">
              A comprehensive solution designed for multi-site care organizations across UK & Ireland,
              empowering caregivers with self-service tools and full offline capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Advanced Scheduling */}
            <div className="p-6 bg-white rounded-lg">
              <div className="mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <CalendarClock className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4">Advanced Scheduling</h3>
              <p className="text-gray-600 mb-4">Intelligent staff rota and scheduling system</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Auto rota generation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Dynamic shift patterns</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Holiday planning</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Gap detection</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Coverage optimization</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Shift swapping</span>
                </li>
              </ul>
            </div>

            {/* Workforce Planning */}
            <div className="p-6 bg-white rounded-lg">
              <div className="mb-6">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-500" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4">Workforce Planning</h3>
              <p className="text-gray-600 mb-4">Strategic staff allocation and planning</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Demand forecasting</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Skill mix optimization</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Agency coordination</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Resource allocation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Capacity planning</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Workload balancing</span>
                </li>
              </ul>
            </div>

            {/* Real-time Alerts */}
            <div className="p-6 bg-white rounded-lg">
              <div className="mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Bell className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4">Real-time Alerts</h3>
              <p className="text-gray-600 mb-4">Instant scheduling notifications</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Shift notifications</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Coverage warnings</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Schedule changes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Mobile reminders</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Urgent requests</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Financial & Accounting Section */}
      <section className="py-24 bg-gray-50 w-full">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl font-bold mb-4">Enterprise Financial Management</h2>
            <p className="text-xl text-gray-600">
              Comprehensive financial, accounting, and payroll management for care organizations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Financial Module */}
            <div className="p-6 bg-white rounded-lg">
              <div className="mb-6">
                <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4">Financial Module</h3>
              <p className="text-gray-600 mb-4">Advanced financial management system</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Multi-currency support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Budgeting & forecasting</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Cost center management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Financial reporting</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Expense tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Revenue management</span>
                </li>
              </ul>
            </div>

            {/* Accounting Module */}
            <div className="p-6 bg-white rounded-lg">
              <div className="mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <LineChart className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4">Accounting Module</h3>
              <p className="text-gray-600 mb-4">Integrated accounting solutions</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>General ledger</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Accounts payable</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Accounts receivable</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Bank reconciliation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Tax management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Audit trails</span>
                </li>
              </ul>
            </div>

            {/* Payroll Module */}
            <div className="p-6 bg-white rounded-lg">
              <div className="mb-6">
                <div className="w-12 h-12 bg-violet-50 rounded-lg flex items-center justify-center">
                  <CircleDollarSign className="w-6 h-6 text-violet-500" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4">Payroll Module</h3>
              <p className="text-gray-600 mb-4">Comprehensive payroll management</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Automated calculations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Tax compliance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Benefits management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Overtime tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Statutory payments</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>HMRC integration</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Care Management Section */}
      <section className="py-24 bg-white w-full">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl font-bold mb-4">Clinical Care Management</h2>
            <p className="text-xl text-gray-600">
              Advanced clinical tools for comprehensive resident care management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Care Planning */}
            <div className="p-6 bg-white rounded-lg">
              <div className="mb-6">
                <div className="w-12 h-12 bg-rose-50 rounded-lg flex items-center justify-center">
                  <ClipboardCheck className="w-6 h-6 text-rose-500" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4">Care Planning</h3>
              <p className="text-gray-600 mb-4">Person-centered care planning</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Personalized care plans</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Risk assessments</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Care reviews</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Family collaboration</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Progress tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Care history</span>
                </li>
              </ul>
            </div>

            {/* Clinical Assessment */}
            <div className="p-6 bg-white rounded-lg">
              <div className="mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4">Clinical Assessment</h3>
              <p className="text-gray-600 mb-4">Comprehensive health monitoring</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Health assessments</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Vital signs tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Wound management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Clinical alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Health trends</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Medical history</span>
                </li>
              </ul>
            </div>

            {/* Wellness Management */}
            <div className="p-6 bg-white rounded-lg">
              <div className="mb-6">
                <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4">Wellness Management</h3>
              <p className="text-gray-600 mb-4">Holistic wellness tracking</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Activity planning</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Nutrition tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Hydration monitoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Sleep patterns</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Mood tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Wellness reports</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance & Quality Section */}
      <section className="py-24 bg-gray-50 w-full">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl font-bold mb-4">Compliance & Quality Assurance</h2>
            <p className="text-xl text-gray-600">
              Comprehensive compliance management and quality monitoring
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Compliance Management */}
            <div className="p-6 bg-white rounded-lg">
              <div className="mb-6">
                <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-amber-500" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4">Compliance Management</h3>
              <p className="text-gray-600 mb-4">Regulatory compliance tracking</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>CQC & Regional Standards</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Policy & Procedure Library</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Regulatory Updates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Inspection Management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Compliance Dashboard</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Risk Register</span>
                </li>
              </ul>
            </div>

            {/* Audit Management */}
            <div className="p-6 bg-white rounded-lg">
              <div className="mb-6">
                <div className="w-12 h-12 bg-violet-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-violet-500" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4">Audit Management</h3>
              <p className="text-gray-600 mb-4">Quality assurance & auditing</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Audit Calendar</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Custom Audit Templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Action Plans</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Evidence Repository</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Improvement Tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Audit Analytics</span>
                </li>
              </ul>
            </div>

            {/* Quality Assurance */}
            <div className="p-6 bg-white rounded-lg">
              <div className="mb-6">
                <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <Scale className="w-6 h-6 text-indigo-500" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4">Quality Assurance</h3>
              <p className="text-gray-600 mb-4">Quality monitoring system</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Quality metrics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Performance KPIs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Feedback management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Incident analysis</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Quality reporting</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Best practice sharing</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Asset & Facility Management Section */}
      <section className="py-24 bg-white w-full">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl font-bold mb-4">Asset & Facility Management</h2>
            <p className="text-xl text-gray-600">
              Comprehensive facility and asset management tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Bed Management */}
            <div className="p-6 bg-white rounded-lg">
              <div className="mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Bed className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4">Bed Management</h3>
              <p className="text-gray-600 mb-4">Advanced bed allocation system</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Occupancy tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Bed allocation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Room planning</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Admission management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Capacity forecasting</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Occupancy reports</span>
                </li>
              </ul>
            </div>

            {/* Maintenance Management */}
            <div className="p-6 bg-white rounded-lg">
              <div className="mb-6">
                <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-orange-500" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4">Maintenance Management</h3>
              <p className="text-gray-600 mb-4">Facility & equipment maintenance</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Preventive Maintenance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Work Order System</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Contractor Directory</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Safety Compliance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Service History</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Maintenance KPIs</span>
                </li>
              </ul>
            </div>

            {/* Asset Management */}
            <div className="p-6 bg-white rounded-lg">
              <div className="mb-6">
                <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center">
                  <Warehouse className="w-6 h-6 text-teal-500" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4">Asset Management</h3>
              <p className="text-gray-600 mb-4">Equipment & inventory control</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Asset Registry</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Stock Management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Equipment Tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Supplier Management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Procurement Tools</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Asset Reports</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
