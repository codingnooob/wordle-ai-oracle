import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Globe, Server, Smartphone } from 'lucide-react';

interface ApiEndpointsProps {
  baseUrl: string;
}

const ApiEndpoints = ({ baseUrl }: ApiEndpointsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Endpoints Guide</CardTitle>
        <CardDescription>
          Choose the right endpoint for your use case. Each endpoint serves different purposes and environments.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <Alert>
          <Globe className="h-4 w-4" />
          <AlertDescription>
            <strong>Quick Guide:</strong> Use the custom domain for web apps, direct Supabase URL for terminal/server usage, 
            or our SDK for automatic smart fallback handling.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4">
          
          {/* Web Application Endpoint */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Web Application Usage</CardTitle>
                <Badge variant="secondary">Recommended for Browsers</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="font-mono text-sm bg-white p-3 rounded border">
                {baseUrl}/wordle-solver
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-700 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Pros
                  </h4>
                  <ul className="space-y-1 text-green-600">
                    <li>• Clean, branded URL</li>
                    <li>• Smart fallback logic</li>
                    <li>• Perfect for web apps</li>
                    <li>• Works in browsers</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-700 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    Limitations
                  </h4>
                  <ul className="space-y-1 text-red-600">
                    <li>• May return HTML in terminal</li>
                    <li>• Not reliable for curl/server</li>
                    <li>• Depends on DNS routing</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-100 p-3 rounded text-sm">
                <strong>Best for:</strong> Frontend applications, web-based integrations, browser usage
              </div>
            </CardContent>
          </Card>

          {/* Direct Supabase Endpoint */}
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Direct Server Usage</CardTitle>
                <Badge variant="secondary">Reliable for Terminal/API</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="font-mono text-sm bg-white p-3 rounded border break-all">
                https://tctpfuqvpvkcdidyiowu.supabase.co/functions/v1/wordle-solver-api
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-700 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Pros
                  </h4>
                  <ul className="space-y-1 text-green-600">
                    <li>• Always returns JSON</li>
                    <li>• Works in terminal/curl</li>
                    <li>• Reliable for servers</li>
                    <li>• Direct connection</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-700 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    Limitations
                  </h4>
                  <ul className="space-y-1 text-red-600">
                    <li>• Long, technical URL</li>
                    <li>• Not branded</li>
                    <li>• No custom domain benefits</li>
                  </ul>
                </div>
              </div>

              <div className="bg-green-100 p-3 rounded text-sm">
                <strong>Best for:</strong> Terminal usage, server-to-server, curl commands, external integrations
              </div>
            </CardContent>
          </Card>

          {/* SDK Usage */}
          <Card className="border-purple-200 bg-purple-50/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg">SDK Usage</CardTitle>
                <Badge variant="secondary">Best of Both Worlds</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="font-mono text-sm bg-white p-3 rounded border">
                WordleAIClient() // Handles endpoints automatically
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-700 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Pros
                  </h4>
                  <ul className="space-y-1 text-green-600">
                    <li>• Automatic fallback</li>
                    <li>• Works everywhere</li>
                    <li>• Error handling included</li>
                    <li>• Easy to use</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-700 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    Limitations
                  </h4>
                  <ul className="space-y-1 text-red-600">
                    <li>• Additional dependency</li>
                    <li>• Slightly larger payload</li>
                  </ul>
                </div>
              </div>

              <div className="bg-purple-100 p-3 rounded text-sm">
                <strong>Best for:</strong> Production applications, reliable integrations, when you want convenience
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Recommendation Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted p-3 font-semibold">Usage Recommendations</div>
          <div className="divide-y">
            <div className="p-3 flex justify-between items-center">
              <span className="font-medium">Browser Web Application</span>
              <Badge className="bg-blue-100 text-blue-800">Custom Domain</Badge>
            </div>
            <div className="p-3 flex justify-between items-center">
              <span className="font-medium">Terminal / cURL Commands</span>
              <Badge className="bg-green-100 text-green-800">Direct Supabase</Badge>
            </div>
            <div className="p-3 flex justify-between items-center">
              <span className="font-medium">Server-to-Server Integration</span>
              <Badge className="bg-green-100 text-green-800">Direct Supabase</Badge>
            </div>
            <div className="p-3 flex justify-between items-center">
              <span className="font-medium">Production Application</span>
              <Badge className="bg-purple-100 text-purple-800">SDK Client</Badge>
            </div>
            <div className="p-3 flex justify-between items-center">
              <span className="font-medium">Quick Testing</span>
              <Badge className="bg-blue-100 text-blue-800">Custom Domain</Badge>
            </div>
          </div>
        </div>

        {/* Status Endpoint */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Status Check Endpoint</CardTitle>
            <CardDescription>For checking analysis job status (async processing)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="font-semibold">Custom Domain:</div>
              <div className="font-mono text-sm bg-gray-100 p-2 rounded">
                {baseUrl}/status/&#123;job_id&#125;
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-semibold">Direct Supabase:</div>
              <div className="font-mono text-sm bg-gray-100 p-2 rounded break-all">
                https://tctpfuqvpvkcdidyiowu.supabase.co/functions/v1/wordle-solver-api/status/&#123;job_id&#125;
              </div>
            </div>
          </CardContent>
        </Card>

      </CardContent>
    </Card>
  );
};

export default ApiEndpoints;