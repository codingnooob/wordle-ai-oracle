
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ApiOverviewProps {
  baseUrl: string;
}

const ApiOverview = ({ baseUrl }: ApiOverviewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Overview</CardTitle>
        <CardDescription>
          The Wordle AI Oracle API provides ML-powered Wordle puzzle solving capabilities via a single reliable endpoint
        </CardDescription>
      </CardHeader>
      
      {/* Work In Progress Warning */}
      <div className="mx-6 mb-6 p-4 border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950/20 rounded-r-lg">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <span className="text-2xl">⚠️</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-2">
              Work In Progress
            </h3>
            <p className="text-orange-700 dark:text-orange-300 text-sm leading-relaxed">
              This API is currently under active development. While the service is operational, 
              results may be incorrect or incomplete. Do not use in production environments. 
              Check back regularly for updates as we continue improving the accuracy and reliability.
            </p>
          </div>
        </div>
      </div>
      
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">API Endpoint</h3>
          <code className="bg-slate-100 px-2 py-1 rounded text-sm break-all">{baseUrl}</code>
          <p className="text-sm text-slate-600 mt-1">
            Single reliable endpoint that works for all environments and use cases
          </p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Authentication</h3>
          <p className="text-slate-600 mb-2">Optional API key can be provided in headers:</p>
          <code className="bg-slate-100 px-2 py-1 rounded text-sm">X-API-Key: your-api-key</code>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Input Requirements</h3>
          <div className="bg-blue-50 border border-blue-200 p-3 rounded space-y-1">
            <p className="font-medium text-blue-800">⚠️ Strict Validation Applied:</p>
            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
              <li>All letters must have complete analysis (no <code>unknown</code> states)</li>
              <li>Only <code>correct</code>, <code>present</code>, and <code>absent</code> states accepted</li>
              <li>Guess data length must exactly match specified word length</li>
              <li>Requests with incomplete analysis will be rejected with 400 error</li>
            </ul>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Rate Limits</h3>
          <p className="text-slate-600">100 requests per hour per API key/IP address</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Features</h3>
          <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
            <li>AI-powered word predictions based on guess patterns</li>
            <li>Support for different word lengths (3-8 letters)</li>
            <li>Advanced constraint handling (position exclusions, excluded letters)</li>
            <li>Configurable response modes (immediate, async, auto)</li>
            <li>Rate limiting and usage tracking</li>
            <li>Asynchronous processing for complex analyses</li>
            <li>RESTful API with JSON responses</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Response Modes</h3>
          <div className="text-sm space-y-2 text-muted-foreground">
            <div><span className="bg-slate-100 px-2 py-1 rounded mr-2 font-mono text-xs">immediate</span>Forces synchronous processing. Returns results immediately or fails with timeout error.</div>
            <div><span className="bg-slate-100 px-2 py-1 rounded mr-2 font-mono text-xs">async</span>Always processes in background and returns job ID for status polling.</div>
            <div><span className="bg-slate-100 px-2 py-1 rounded mr-2 font-mono text-xs">auto</span>Default mode. Tries immediate processing, falls back to async if needed.</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiOverview;
