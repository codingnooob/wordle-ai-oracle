
import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { proxyToSupabase } from '../utils/apiProxy';

const ApiProxy = () => {
  const location = useLocation();
  const params = useParams();
  
  useEffect(() => {
    const handleApiRequest = async () => {
      try {
        const path = location.pathname;
        
        // Create a new request object
        const request = new Request(window.location.href, {
          method: 'GET',
          headers: new Headers(),
        });
        
        let response: Response;
        
        if (path.startsWith('/api/wordle-solver/status/')) {
          // Handle status endpoint with session token
          const pathSegments = path.split('/status/')[1].split('/');
          const jobId = pathSegments[0];
          const sessionToken = pathSegments[1];
          
          if (!sessionToken) {
            response = new Response(JSON.stringify({ error: 'Session token required' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            });
          } else {
            response = await proxyToSupabase('wordle-solver-api', request, `/status/${jobId}/${sessionToken}`);
          }
        } else if (path.startsWith('/api/wordle-solver')) {
          // Handle main endpoint
          response = await proxyToSupabase('wordle-solver-api', request);
        } else {
          // Unknown API endpoint
          response = new Response(JSON.stringify({ error: 'API endpoint not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        
        // Handle the response
        const data = await response.text();
        
        // For API requests, we need to return JSON directly
        if (response.ok) {
          document.body.innerHTML = `<pre>${data}</pre>`;
        } else {
          document.body.innerHTML = `<pre>Error: ${data}</pre>`;
        }
      } catch (error) {
        console.error('API request failed:', error);
        document.body.innerHTML = `<pre>Error: ${error.message}</pre>`;
      }
    };
    
    handleApiRequest();
  }, [location.pathname]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Processing API request...</p>
      </div>
    </div>
  );
};

export default ApiProxy;
