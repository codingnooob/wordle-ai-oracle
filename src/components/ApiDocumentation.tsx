
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ApiOverview from './api-docs/ApiOverview';
import ApiAnalyzeEndpoint from './api-docs/ApiAnalyzeEndpoint';
import ApiStatusEndpoint from './api-docs/ApiStatusEndpoint';
import ApiExamples from './api-docs/ApiExamples';

const ApiDocumentation = () => {
  // Prioritize production domain, fallback to current origin for development
  const getBaseUrl = () => {
    if (typeof window === 'undefined') return 'https://wordlesolver.ai/api';
    
    const currentOrigin = window.location.origin;
    
    // If we're on the production domain or any custom domain (not localhost or lovable project)
    if (currentOrigin.includes('wordlesolver.ai') || 
        (!currentOrigin.includes('localhost') && !currentOrigin.includes('lovableproject.com'))) {
      return 'https://wordlesolver.ai/api';
    }
    
    // For development environments (localhost, lovable project URLs)
    return `${currentOrigin}/api`;
  };

  const baseUrl = getBaseUrl();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-800">Wordle AI Oracle API</h1>
        <p className="text-slate-600">REST API for Wordle puzzle solving with ML-powered predictions</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analyze">Analyze</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ApiOverview baseUrl={baseUrl} />
        </TabsContent>

        <TabsContent value="analyze">
          <ApiAnalyzeEndpoint baseUrl={baseUrl} />
        </TabsContent>

        <TabsContent value="status">
          <ApiStatusEndpoint />
        </TabsContent>

        <TabsContent value="examples">
          <ApiExamples baseUrl={baseUrl} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiDocumentation;
