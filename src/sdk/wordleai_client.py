"""
Wordle AI Oracle Python SDK
A client library for the Wordle AI Oracle API with smart fallback logic.
"""

import requests
import time
import json
from typing import List, Dict, Optional, Any

class WordleAIClient:
    """
    Client for the Wordle AI Oracle API with automatic fallback logic.
    
    This client tries the custom domain endpoint first and automatically
    falls back to the direct Supabase endpoint if the custom domain fails
    or returns non-JSON responses.
    """
    
    def __init__(self, 
                 custom_domain_url: str = "https://wordlesolver.ai/api",
                 fallback_url: str = "https://tctpfuqvpvkcdidyiowu.supabase.co/functions/v1/wordle-solver-api",
                 api_key: Optional[str] = None,
                 timeout: int = 10):
        """
        Initialize the Wordle AI client.
        
        Args:
            custom_domain_url: Primary endpoint URL (custom domain)
            fallback_url: Fallback endpoint URL (direct Supabase)
            api_key: Optional API key for authentication
            timeout: Request timeout in seconds
        """
        self.custom_domain_url = custom_domain_url.rstrip('/')
        self.fallback_url = fallback_url.rstrip('/')
        self.api_key = api_key
        self.timeout = timeout
        self.session = requests.Session()
        
        if api_key:
            self.session.headers.update({'X-API-Key': api_key})

    def _make_request(self, endpoint: str = "", data: Optional[Dict] = None, 
                     headers: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Make HTTP request with smart fallback logic.
        
        Args:
            endpoint: API endpoint path
            data: Request data for POST requests
            headers: Additional headers
            
        Returns:
            API response as dictionary
            
        Raises:
            Exception: If both endpoints fail
        """
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
            guess_data: List of letter objects with 'letter' and 'state' keys.
                       State can be 'correct', 'present', or 'absent'
            word_length: Target word length (default: 5)
            excluded_letters: List of excluded letters
            response_mode: 'immediate' or 'async' processing
            poll_for_result: Whether to automatically poll for async results
            
        Returns:
            Dictionary containing analysis results with solutions and confidence
            
        Example:
            >>> client = WordleAIClient()
            >>> result = client.analyze([
            ...     {"letter": "A", "state": "correct"},
            ...     {"letter": "B", "state": "present"},
            ...     {"letter": "C", "state": "absent"}
            ... ])
            >>> print(result["solutions"])
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
            job_id: Job identifier from async analysis request
            session_token: Session token for authentication
            max_attempts: Maximum polling attempts before timeout
            
        Returns:
            Final job result when complete
            
        Raises:
            Exception: If polling times out or job fails
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
        """
        Get current status of an analysis job.
        
        Args:
            job_id: Job identifier
            session_token: Session token for authentication
            
        Returns:
            Current job status and results if available
        """
        return self._make_request(f'/status/{job_id}', 
                                headers={'X-Session-Token': session_token})

    def get_working_endpoint(self) -> str:
        """Get the primary endpoint URL."""
        return self.custom_domain_url

    def is_using_fallback(self) -> bool:
        """Check if currently using fallback endpoint (for future implementation)."""
        return False  # This would need more sophisticated tracking

    def reset(self) -> None:
        """Reset internal state (useful for testing different endpoints)."""
        # Reset any cached endpoint state if implemented
        pass


# Example usage
if __name__ == "__main__":
    # Example usage of the client
    client = WordleAIClient()
    
    # Example guess data
    guess_data = [
        {"letter": "C", "state": "absent"},
        {"letter": "R", "state": "present"},
        {"letter": "A", "state": "present"},
        {"letter": "N", "state": "absent"},
        {"letter": "E", "state": "correct"}
    ]
    
    try:
        result = client.analyze(guess_data)
        print("Analysis Results:")
        print(f"Status: {result.get('status')}")
        print(f"Solutions: {result.get('solutions', [])}")
        print(f"Confidence: {result.get('confidence_score', 'N/A')}")
    except Exception as e:
        print(f"Error: {e}")