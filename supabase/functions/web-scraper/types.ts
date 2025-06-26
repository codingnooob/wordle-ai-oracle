
export interface ScrapingTarget {
  url: string;
  name: string;
  selector?: string;
}

export interface ScrapeResult {
  source: string;
  wordCount: number;
  success: boolean;
}

export interface ScrapingResponse {
  words: string[];
  totalWords: number;
  scrapeResults: ScrapeResult[];
  timestamp: string;
  error?: string;
  fallback?: boolean;
}
