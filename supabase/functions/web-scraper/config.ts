
import { ScrapingTarget } from './types.ts';

export const SCRAPING_TARGETS: ScrapingTarget[] = [
  {
    url: 'https://en.wikipedia.org/wiki/Most_common_words_in_English',
    name: 'Wikipedia Common Words',
  },
  {
    url: 'https://simple.wikipedia.org/wiki/List_of_common_English_words',
    name: 'Simple Wikipedia Words',
  },
  {
    url: 'https://en.wikipedia.org/wiki/English_language',
    name: 'Wikipedia English Language',
  }
];

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
