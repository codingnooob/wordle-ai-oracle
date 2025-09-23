import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink } from 'lucide-react';

interface ApiSdkProps {
  baseUrl: string;
}

const ApiSdk = ({ baseUrl }: ApiSdkProps) => {
  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Client SDKs</CardTitle>
        <CardDescription>
          Ready-to-use client libraries with smart fallback logic and automatic error handling.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="javascript" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="javascript">JavaScript/Node.js</TabsTrigger>
            <TabsTrigger value="python">Python</TabsTrigger>
            <TabsTrigger value="usage">Usage Examples</TabsTrigger>
          </TabsList>

          <TabsContent value="javascript" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">JavaScript/Node.js SDK</h3>
              <Button
                onClick={() => handleDownload('wordleai-client.js', `// Wordle AI Oracle JavaScript SDK
class WordleAIClient {
  constructor(options = {}) {
    this.customDomainUrl = options.customDomainUrl || '${baseUrl}';
    this.fallbackUrl = options.fallbackUrl || 'https://tctpfuqvpvkcdidyiowu.supabase.co/functions/v1/wordle-solver-api';
    this.apiKey = options.apiKey;
    this.timeout = options.timeout || 10000;
  }

  async makeRequest(endpoint = '', data = null, options = {}) {
    const requestOptions = {
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'X-API-Key': this.apiKey }),
        ...options.headers
      },
      ...(data && { body: JSON.stringify(data) })
    };

    // Try custom domain first
    try {
      const customUrl = \`\${this.customDomainUrl}\${endpoint}\`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(customUrl, {
        ...requestOptions,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        }
      }
    } catch (error) {
      console.warn('Custom domain failed, trying fallback:', error.message);
    }

    // Fallback to Supabase
    try {
      const fallbackUrl = \`\${this.fallbackUrl}\${endpoint}\`;
      const response = await fetch(fallbackUrl, requestOptions);
      
      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(\`API request failed: \${error.message}\`);
    }
  }

  async analyze(guessData, options = {}) {
    const payload = {
      guessData,
      wordLength: options.wordLength || 5,
      excludedLetters: options.excludedLetters || [],
      responseMode: options.responseMode || 'immediate',
      ...(this.apiKey && { apiKey: this.apiKey })
    };

    const result = await this.makeRequest('', payload);
    
    // Handle async processing
    if (result.job_id && result.status !== 'complete') {
      return options.pollForResult !== false ? 
        await this.pollJobStatus(result.job_id, result.session_token) : result;
    }
    
    return result;
  }

  async pollJobStatus(jobId, sessionToken, maxAttempts = 30) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      try {
        const result = await this.makeRequest(\`/status/\${jobId}\`, null, {
          headers: { 'X-Session-Token': sessionToken }
        });
        
        if (result.status === 'complete' || result.status === 'failed') {
          return result;
        }
      } catch (error) {
        console.warn(\`Polling attempt \${attempt + 1} failed:, error.message\`);
      }
    }
    
    throw new Error('Polling timeout: Analysis did not complete within expected time');
  }

  async getStatus(jobId, sessionToken) {
    return await this.makeRequest(\`/status/\${jobId}\`, null, {
      headers: { 'X-Session-Token': sessionToken }
    });
  }
}

// Export for both CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WordleAIClient;
} else if (typeof window !== 'undefined') {
  window.WordleAIClient = WordleAIClient;
}
`)}
                size="sm"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Download SDK
              </Button>
            </div>

            <ScrollArea className="h-64 w-full rounded border">
              <pre className="p-4 text-sm">
{`// Installation
npm install wordleai-client

// Usage
const WordleAIClient = require('./wordleai-client');

const client = new WordleAIClient({
  apiKey: 'your-api-key' // optional
});

// Analyze guess
const result = await client.analyze([
  { letter: 'C', state: 'absent' },
  { letter: 'R', state: 'present' },
  { letter: 'A', state: 'present' },
  { letter: 'N', state: 'absent' },
  { letter: 'E', state: 'correct' }
]);

console.log('Solutions:', result.solutions);`}
              </pre>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="python" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Python SDK</h3>
              <Button
                onClick={() => handleDownload('wordleai_client.py', `"""
Wordle AI Oracle Python SDK
A client library for the Wordle AI Oracle API with smart fallback logic.
"""

import requests
import time
import json
from typing import List, Dict, Optional, Any

class WordleAIClient:
    def __init__(self, 
                 custom_domain_url: str = "${baseUrl}",
                 fallback_url: str = "https://tctpfuqvpvkcdidyiowu.supabase.co/functions/v1/wordle-solver-api",
                 api_key: Optional[str] = None,
                 timeout: int = 10):
        self.custom_domain_url = custom_domain_url.rstrip('/')
        self.fallback_url = fallback_url.rstrip('/')
        self.api_key = api_key
        self.timeout = timeout
        self.session = requests.Session()
        
        if api_key:
            self.session.headers.update({'X-API-Key': api_key})

    def _make_request(self, endpoint: str = "", data: Optional[Dict] = None, 
                     headers: Optional[Dict] = None) -> Dict[str, Any]:
        """Make HTTP request with smart fallback logic."""
        request_headers = {'Content-Type': 'application/json'}
        if headers:
            request_headers.update(headers)
            
        # Try custom domain first
        try:
            custom_url = f"{self.custom_domain_url}{endpoint}"
            response = self.session.post(custom_url, 
                                       json=data, 
                                       headers=request_headers,
                                       timeout=self.timeout) if data else \
                      self.session.get(custom_url, 
                                     headers=request_headers,
                                     timeout=self.timeout)
            
            if response.ok and 'application/json' in response.headers.get('content-type', ''):
                return response.json()
                
        except (requests.RequestException, json.JSONDecodeError) as e:
            print(f"Custom domain failed, trying fallback: {e}")
        
        # Fallback to Supabase
        try:
            fallback_url = f"{self.fallback_url}{endpoint}"
            response = self.session.post(fallback_url, 
                                       json=data, 
                                       headers=request_headers,
                                       timeout=self.timeout) if data else \
                      self.session.get(fallback_url, 
                                     headers=request_headers,
                                     timeout=self.timeout)
            
            response.raise_for_status()
            return response.json()
            
        except requests.RequestException as e:
            raise Exception(f"API request failed: {e}")

    def analyze(self, guess_data: List[Dict[str, str]], 
                word_length: int = 5,
                excluded_letters: Optional[List[str]] = None,
                response_mode: str = "immediate",
                poll_for_result: bool = True) -> Dict[str, Any]:
        """
        Analyze Wordle guess data and get word predictions.
        
        Args:
            guess_data: List of letter objects with 'letter' and 'state' keys
            word_length: Target word length (default: 5)
            excluded_letters: List of excluded letters
            response_mode: 'immediate' or 'async'
            poll_for_result: Whether to automatically poll for async results
            
        Returns:
            Dictionary containing analysis results
        """
        payload = {
            'guessData': guess_data,
            'wordLength': word_length,
            'excludedLetters': excluded_letters or [],
            'responseMode': response_mode
        }
        
        if self.api_key:
            payload['apiKey'] = self.api_key
            
        result = self._make_request('', payload)
        
        # Handle async processing
        if result.get('job_id') and result.get('status') != 'complete' and poll_for_result:
            return self.poll_job_status(result['job_id'], result['session_token'])
            
        return result

    def poll_job_status(self, job_id: str, session_token: str, 
                       max_attempts: int = 30) -> Dict[str, Any]:
        """
        Poll for job completion status.
        
        Args:
            job_id: Job identifier
            session_token: Session token for authentication
            max_attempts: Maximum polling attempts
            
        Returns:
            Final job result
        """
        for attempt in range(max_attempts):
            time.sleep(2)
            
            try:
                result = self._make_request(f'/status/{job_id}', 
                                         headers={'X-Session-Token': session_token})
                
                if result.get('status') in ['complete', 'failed']:
                    return result
                    
            except Exception as e:
                print(f"Polling attempt {attempt + 1} failed: {e}")
        
        raise Exception('Polling timeout: Analysis did not complete within expected time')

    def get_status(self, job_id: str, session_token: str) -> Dict[str, Any]:
        """Get current status of an analysis job."""
        return self._make_request(f'/status/{job_id}', 
                                headers={'X-Session-Token': session_token})
`)}
                size="sm"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Download SDK
              </Button>
            </div>

            <ScrollArea className="h-64 w-full rounded border">
              <pre className="p-4 text-sm">
{`# Installation
pip install wordleai-client

# Usage
from wordleai_client import WordleAIClient

client = WordleAIClient(api_key="your-api-key")  # optional

# Analyze guess
result = client.analyze([
    {"letter": "C", "state": "absent"},
    {"letter": "R", "state": "present"},
    {"letter": "A", "state": "present"},
    {"letter": "N", "state": "absent"},
    {"letter": "E", "state": "correct"}
])

print("Solutions:", result["solutions"])`}
              </pre>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="usage" className="space-y-4">
            <h3 className="text-lg font-semibold">Usage Examples</h3>
            
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Basic Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-32 w-full">
                    <pre className="text-sm">
{`// JavaScript
const result = await client.analyze([
  { letter: 'A', state: 'correct' },
  { letter: 'B', state: 'present' },
  { letter: 'C', state: 'absent' }
]);

# Python
result = client.analyze([
  {"letter": "A", "state": "correct"},
  {"letter": "B", "state": "present"},
  {"letter": "C", "state": "absent"}
])`}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Advanced Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-32 w-full">
                    <pre className="text-sm">
{`// JavaScript
const result = await client.analyze(guessData, {
  wordLength: 6,
  excludedLetters: ['X', 'Y', 'Z'],
  responseMode: 'async'
});

# Python  
result = client.analyze(
  guess_data,
  word_length=6,
  excluded_letters=['X', 'Y', 'Z'],
  response_mode='async'
)`}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ApiSdk;