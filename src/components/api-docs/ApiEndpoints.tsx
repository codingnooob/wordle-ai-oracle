import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Server } from 'lucide-react';

interface ApiEndpointsProps {
  baseUrl: string;
}

const ApiEndpoints = ({ baseUrl }: ApiEndpointsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Endpoints</CardTitle>
        <CardDescription>
          Reliable API endpoints for all environments and use cases
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <Alert>
          <Server className="h-4 w-4" />
          <AlertDescription>
            <strong>Single Endpoint:</strong> One reliable URL that works for all environments - web applications, servers, terminals, and cURL commands.
          </AlertDescription>
        </Alert>

        {/* Main API Endpoint */}
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">Wordle Solver API</CardTitle>
              <Badge variant="secondary">Universal Endpoint</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="font-mono text-sm bg-white p-3 rounded border break-all">
              {baseUrl}
            </div>
            
            <div className="bg-green-100 p-3 rounded text-sm">
              <strong>Works for:</strong> Web applications, server integrations, terminal usage, cURL commands, and all programming languages
            </div>

            <div className="text-sm space-y-1 text-green-700">
              <div>✓ Always returns JSON responses</div>
              <div>✓ Reliable across all environments</div>
              <div>✓ No environment-specific configuration needed</div>
              <div>✓ Direct connection to Supabase Edge Functions</div>
            </div>
          </CardContent>
        </Card>

        {/* Status Endpoint */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Status Check Endpoint</CardTitle>
            <CardDescription>For checking analysis job status (async processing)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="font-mono text-sm bg-gray-100 p-2 rounded break-all">
              {baseUrl}/status/&#123;job_id&#125;/&#123;session_token&#125;
            </div>
            <p className="text-sm text-gray-600">
              Use both <code>job_id</code> and <code>session_token</code> from the initial analysis response to check job status.
            </p>
          </CardContent>
        </Card>

      </CardContent>
    </Card>
  );
};

export default ApiEndpoints;