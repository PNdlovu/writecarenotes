import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button/Button";
import { Progress } from "@/components/ui/progress";
import {
  Region,
  CQCRequirements,
  CIWRequirements,
  CareInspectorateRequirements,
  RQIARequirements,
  HIQARequirements
} from '@/types/regulatory';
import { CareType } from '@/types/care';

interface RegulatoryComplianceProps {
  region: Region;
  careType: CareType;
  cqc?: CQCRequirements;
  ciw?: CIWRequirements;
  careInspectorate?: CareInspectorateRequirements;
  rqia?: RQIARequirements;
  hiqa?: HIQARequirements;
}

export const RegulatoryCompliance: React.FC<RegulatoryComplianceProps> = ({
  region,
  careType,
  cqc,
  ciw,
  careInspectorate,
  rqia,
  hiqa
}) => {
  const renderCQCCompliance = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>CQC Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          {cqc && (
            <div className="space-y-4">
              {Object.entries(cqc.ratings).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">{key}</span>
                    <span className={`text-sm font-medium ${
                      value === 'Outstanding' ? 'text-green-600' :
                      value === 'Good' ? 'text-blue-600' :
                      value === 'Requires Improvement' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {value}
                    </span>
                  </div>
                  <Progress 
                    value={
                      value === 'Outstanding' ? 100 :
                      value === 'Good' ? 75 :
                      value === 'Requires Improvement' ? 50 :
                      25
                    } 
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key Lines of Enquiry (KLOEs)</CardTitle>
        </CardHeader>
        <CardContent>
          {cqc && (
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(cqc.kloes).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    value ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm capitalize">{key}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderCIWCompliance = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Welsh Language Standards</CardTitle>
        </CardHeader>
        <CardContent>
          {ciw && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Active Offer Status</span>
                <span className={`text-sm font-medium ${
                  ciw.welshActiveOffer.status === 'FULL' ? 'text-green-600' :
                  ciw.welshActiveOffer.status === 'PARTIAL' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {ciw.welshActiveOffer.status}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Staff Language Capabilities</h4>
                <div className="space-y-2">
                  {Object.entries(ciw.welshActiveOffer.staffLanguageCapabilities).map(([language, staff]) => (
                    <div key={language} className="flex justify-between">
                      <span className="text-sm">{language}</span>
                      <span className="text-sm text-muted-foreground">{staff.length} staff</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inspection History</CardTitle>
        </CardHeader>
        <CardContent>
          {ciw?.inspectionHistory.map((inspection, index) => (
            <div key={index} className="mb-4 last:mb-0">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">
                  {new Date(inspection.date).toLocaleDateString()}
                </span>
                <span className="text-sm">{inspection.outcome}</span>
              </div>
              {inspection.actionPlan && (
                <p className="text-sm text-muted-foreground">{inspection.actionPlan}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderCareInspectorateCompliance = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Health and Social Care Standards</CardTitle>
        </CardHeader>
        <CardContent>
          {careInspectorate && (
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(careInspectorate.healthAndSocialCareStandards).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    value ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm capitalize">{key}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hub Integration</CardTitle>
        </CardHeader>
        <CardContent>
          {careInspectorate?.hubIntegration.submissions.map((submission, index) => (
            <div key={index} className="mb-4 last:mb-0">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">{submission.type}</span>
                <span className={`text-sm ${
                  submission.status === 'completed' ? 'text-green-600' :
                  submission.status === 'pending' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {submission.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(submission.date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderRQIACompliance = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Quality Framework</CardTitle>
        </CardHeader>
        <CardContent>
          {rqia && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium">Registration Number</span>
                  <p className="text-sm text-muted-foreground">{rqia.qualityFramework.registrationNumber}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Service Type</span>
                  <p className="text-sm text-muted-foreground">{rqia.qualityFramework.serviceType}</p>
                </div>
              </div>
              <div>
                <span className="text-sm font-medium">Standards Compliance</span>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {Object.entries(rqia.qualityFramework.standards).map(([standard, met]) => (
                    <div key={standard} className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        met ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm">{standard}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>HSC Trust Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          {rqia?.hscTrust && (
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium">Trust Name</span>
                <p className="text-sm text-muted-foreground">{rqia.hscTrust.trustName}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Requirements</span>
                <ul className="mt-2 space-y-2">
                  {rqia.hscTrust.requirements.map((req, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderHIQACompliance = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>National Standards Compliance</CardTitle>
        </CardHeader>
        <CardContent>
          {hiqa && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(hiqa.nationalStandards.residentialCare).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      value ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className="text-sm capitalize">{key}</span>
                  </div>
                ))}
              </div>
              <div>
                <span className="text-sm font-medium">Quality Framework Assessment</span>
                <p className="text-sm text-muted-foreground">
                  Last assessed: {new Date(hiqa.nationalStandards.qualityFramework.lastAssessment).toLocaleDateString()}
                </p>
                <div className="mt-2">
                  <span className="text-sm font-medium">Improvements Required</span>
                  <ul className="mt-1 space-y-1">
                    {hiqa.nationalStandards.qualityFramework.improvements.map((improvement, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inspection History</CardTitle>
        </CardHeader>
        <CardContent>
          {hiqa?.inspections.map((inspection, index) => (
            <div key={index} className="mb-4 last:mb-0">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">
                  {new Date(inspection.date).toLocaleDateString()}
                </span>
                <span className="text-sm">{inspection.type}</span>
              </div>
              <div className="space-y-2">
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {inspection.findings.map((finding, fIndex) => (
                    <li key={fIndex}>{finding}</li>
                  ))}
                </ul>
                {inspection.actionPlan && (
                  <div>
                    <span className="text-sm font-medium">Action Plan</span>
                    <p className="text-sm text-muted-foreground">{inspection.actionPlan}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Regulatory Compliance</h2>
          <p className="text-muted-foreground">
            Manage compliance for {region.replace('_', ' ')} regulations
          </p>
        </div>
        <Button>Generate Report</Button>
      </div>

      {region === 'ENGLAND' && renderCQCCompliance()}
      {region === 'WALES' && renderCIWCompliance()}
      {region === 'SCOTLAND' && renderCareInspectorateCompliance()}
      {region === 'NORTHERN_IRELAND' && renderRQIACompliance()}
      {region === 'IRELAND' && renderHIQACompliance()}
    </div>
  );
};
