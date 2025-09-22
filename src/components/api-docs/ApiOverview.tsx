
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ApiOverviewProps {
  baseUrl: string;
}

const ApiOverview = ({ baseUrl }: ApiOverviewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Overview</CardTitle>
        <CardDescription>
          The Wordle AI Oracle API provides ML-powered Wordle puzzle solving capabilities
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
          <h3 className="text-lg font-semibold mb-2">Base URL</h3>
          <code className="bg-slate-100 px-2 py-1 rounded text-sm">{baseUrl}</code>
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
            <div><Badge variant="outline" className="mr-2">immediate</Badge>Forces synchronous processing. Returns results immediately or fails with timeout error.</div>
            <div><Badge variant="outline" className="mr-2">async</Badge>Always processes in background and returns job ID for status polling.</div>
            <div><Badge variant="outline" className="mr-2">auto</Badge>Default mode. Tries immediate processing, falls back to async if needed.</div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Complete Workflow</h3>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 p-4 rounded space-y-3">
            <h4 className="font-medium text-blue-800">Async Processing Workflow:</h4>
            <div className="text-sm text-blue-700 space-y-2">
              <div className="flex items-start gap-2">
                <Badge variant="secondary" className="shrink-0 mt-0.5">1</Badge>
                <div>
                  <strong>Send Analysis Request</strong> with <code>responseMode: "async"</code><br/>
                  <span className="text-xs text-blue-600">Receive <code>job_id</code> and <code>session_token</code> immediately</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="secondary" className="shrink-0 mt-0.5">2</Badge>
                <div>
                  <strong>Poll Status Endpoint</strong> using both tokens<br/>
                  <span className="text-xs text-blue-600">GET <code>/status/{`{job_id}/{session_token}`}</code> every 3-5 seconds</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="secondary" className="shrink-0 mt-0.5">3</Badge>
                <div>
                  <strong>Receive Results</strong> when status becomes <code>complete</code><br/>
                  <span className="text-xs text-blue-600">Stop polling and process the solutions array</span>
                </div>
              </div>
            </div>
            
            <div className="border-t border-blue-200 pt-3">
              <h4 className="font-medium text-blue-800 mb-2">Best Practices:</h4>
              <ul className="text-xs text-blue-600 space-y-1 list-disc list-inside">
                <li>Poll every 3-5 seconds to balance responsiveness and server load</li>
                <li>Set a maximum poll count (e.g., 30 attempts = ~2.5 minutes)</li>
                <li>Always use both <code>job_id</code> and <code>session_token</code> for security</li>
                <li>Handle <code>partial</code> status as a successful result with limited data</li>
                <li>Use <code>immediate</code> mode for simple analyses, <code>auto</code> for flexibility</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Timing & Performance</h3>
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm">
            <div className="space-y-1 text-yellow-800">
              <div><strong>Immediate mode:</strong> 1-5 seconds (or timeout error)</div>
              <div><strong>Async mode:</strong> 5-30 seconds typical processing time</div>
              <div><strong>Auto mode:</strong> Tries immediate first, falls back if needed</div>
              <div><strong>Rate limits:</strong> 100 requests/hour per API key or IP</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiOverview;
