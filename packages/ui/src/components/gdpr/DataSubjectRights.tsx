import React, { useState } from 'react';
import { Button } from '../button/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card/card';
import { Label } from '../label/label';
import { Textarea } from '../form/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../form/form';
import { Badge } from '../badge/badge';
import { Separator } from '../separator/separator';
import { 
  Download, 
  Trash2, 
  Edit, 
  Shield, 
  FileText, 
  Mail, 
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DataSubjectRequest {
  id: string;
  type: 'access' | 'rectification' | 'erasure' | 'restriction' | 'portability' | 'objection';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  submittedAt: string;
  completedAt?: string;
  description: string;
  response?: string;
  downloadUrl?: string;
}

export interface DataSubjectRightsProps {
  onSubmitRequest: (request: Omit<DataSubjectRequest, 'id' | 'submittedAt' | 'status'>) => void;
  existingRequests?: DataSubjectRequest[];
  className?: string;
}

/**
 * Data Subject Rights Component
 * 
 * Provides interface for GDPR data subject rights
 */
export function DataSubjectRights({ 
  onSubmitRequest, 
  existingRequests = [],
  className 
}: DataSubjectRightsProps) {
  const [selectedRequestType, setSelectedRequestType] = useState<string>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestTypes = [
    {
      value: 'access',
      label: 'Access My Data',
      description: 'Request a copy of all personal data we hold about you',
      icon: Download,
      article: 'Article 15'
    },
    {
      value: 'rectification',
      label: 'Correct My Data',
      description: 'Request correction of inaccurate or incomplete personal data',
      icon: Edit,
      article: 'Article 16'
    },
    {
      value: 'erasure',
      label: 'Delete My Data',
      description: 'Request deletion of your personal data (right to be forgotten)',
      icon: Trash2,
      article: 'Article 17'
    },
    {
      value: 'restriction',
      label: 'Restrict Processing',
      description: 'Request limitation of processing of your personal data',
      icon: Shield,
      article: 'Article 18'
    },
    {
      value: 'portability',
      label: 'Data Portability',
      description: 'Request your data in a portable format for transfer',
      icon: FileText,
      article: 'Article 20'
    },
    {
      value: 'objection',
      label: 'Object to Processing',
      description: 'Object to processing of your personal data',
      icon: AlertCircle,
      article: 'Article 21'
    }
  ];

  const handleSubmitRequest = async () => {
    if (!selectedRequestType || !description.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmitRequest({
        type: selectedRequestType as DataSubjectRequest['type'],
        description: description.trim()
      });
      
      // Reset form
      setSelectedRequestType('');
      setDescription('');
    } catch (error) {
      console.error('Error submitting request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: DataSubjectRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: DataSubjectRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'processing':
        return 'default';
      case 'completed':
        return 'success';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Your Data Rights</h2>
        <p className="text-muted-foreground">
          Under GDPR, you have several rights regarding your personal data. 
          Use the options below to exercise these rights.
        </p>
      </div>

      {/* Submit New Request */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Submit a Data Subject Request
          </CardTitle>
          <CardDescription>
            Choose the type of request you'd like to make and provide details about your request.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Request Type Selection */}
          <div className="space-y-4">
            <Label htmlFor="request-type">Request Type</Label>
            <Select value={selectedRequestType} onValueChange={setSelectedRequestType}>
              <SelectTrigger id="request-type">
                <SelectValue placeholder="Select a request type" />
              </SelectTrigger>
              <SelectContent>
                {requestTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {type.article}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Request Type Details */}
            {selectedRequestType && (
              <div className="bg-muted/50 p-4 rounded-lg">
                {(() => {
                  const selectedType = requestTypes.find(t => t.value === selectedRequestType);
                  if (!selectedType) return null;
                  
                  const Icon = selectedType.icon;
                  return (
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium mb-1">
                          {selectedType.label} ({selectedType.article})
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedType.description}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Request Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Please provide details about your request. Be as specific as possible to help us process your request quickly."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground">
              Provide specific details about what data you're requesting or what changes you want made.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitRequest}
              disabled={!selectedRequestType || !description.trim() || isSubmitting}
              className="min-w-32"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>

          {/* Legal Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Important Information
                </p>
                <p className="text-blue-800 dark:text-blue-200">
                  We have 30 days to respond to your request. We may request additional 
                  information to verify your identity before processing your request. 
                  Some requests may be denied if they conflict with legal obligations 
                  or legitimate interests.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Requests */}
      {existingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Previous Requests</CardTitle>
            <CardDescription>
              Track the status of your data subject requests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {existingRequests.map((request, index) => {
                const requestType = requestTypes.find(t => t.value === request.type);
                const Icon = requestType?.icon || FileText;
                
                return (
                  <div key={request.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">
                              {requestType?.label || request.type}
                            </h4>
                            <Badge variant={getStatusVariant(request.status) as any}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(request.status)}
                                <span className="capitalize">{request.status}</span>
                              </div>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {request.description}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            Submitted: {new Date(request.submittedAt).toLocaleDateString()}
                            {request.completedAt && (
                              <span>
                                {' • '}Completed: {new Date(request.completedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          {request.response && (
                            <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                              <span className="font-medium">Response:</span> {request.response}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {request.downloadUrl && request.status === 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <a
                            href={request.downloadUrl}
                            download
                            className="flex items-center gap-1"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </a>
                        </Button>
                      )}
                    </div>
                    
                    {index < existingRequests.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rights Information */}
      <Card>
        <CardHeader>
          <CardTitle>Understanding Your Rights</CardTitle>
          <CardDescription>
            Learn more about your data protection rights under GDPR.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {requestTypes.map((type, index) => {
            const Icon = type.icon;
            return (
              <div key={type.value}>
                <div className="flex items-start gap-3">
                  <Icon className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium mb-1">
                      {type.label} ({type.article})
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {type.description}
                    </p>
                  </div>
                </div>
                {index < requestTypes.length - 1 && <Separator className="mt-4" />}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>
            Contact our Data Protection Officer for assistance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Email: <a href="mailto:privacy@zoptal.com" className="text-primary hover:underline">
                  privacy@zoptal.com
                </a>
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>
                If you have questions about your data rights or need assistance with 
                a request, please don't hesitate to contact us. We're here to help 
                ensure your privacy rights are respected.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}