/**
 * News aggregation service for companies
 * Supports: RSS feeds (Google News, Israeli media)
 */

import Parser from 'rss-parser';

const rssParser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media'],
      ['content:encoded', 'contentEncoded'],
    ],
  },
});

// Cache storage
const newsCache = new Map();
const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours

/**
 * Fetch news from Google News RSS
 * @param {string} companyName - Company name for search
 * @returns {Promise<Array>}
 */
async function fetchGoogleNews(companyName) {
  try {
    const encodedName = encodeURIComponent(companyName);
    const rssUrl = `https://news.google.com/rss/search?q=${encodedName}&hl=he&gl=IL&ceid=IL:he`;
    
    const feed = await rssParser.parseURL(rssUrl);
    
    return feed.items.slice(0, 15).map((item) => ({
      title: item.title,
      source: item.source?.name || extractSourceFromTitle(item.title),
      date: new Date(item.pubDate || item.isoDate),
      snippet: cleanHtml(item.contentSnippet || item.content || ''),
      link: item.link,
      type: 'news',
    }));
  } catch (error) {
    console.error('Error fetching Google News:', error);
    return [];
  }
}

/**
 * Fetch news from Israeli media RSS feeds
 * @param {string} companyName - Company name for search
 * @returns {Promise<Array>}
 */
async function fetchIsraeliNews(companyName) {
  const feeds = [
    {
      name: 'Ynet',
      url: `https://www.ynet.co.il/Integration/StoryRss2.xml`,
    },
    {
      name: 'Globes',
      url: `https://www.globes.co.il/webservice/rss/rssfeeder.asmx/FeederNode?iid=1725`,
    },
    {
      name: 'Calcalist',
      url: `https://www.calcalist.co.il/GeneralRSS/0,16335,,00.xml`,
    },
  ];

  const allNews = [];

  for (const feed of feeds) {
    try {
      const feedData = await rssParser.parseURL(feed.url);
      
      // Filter items that mention the company name
      const relevantItems = feedData.items.filter((item) => {
        const content = `${item.title} ${item.contentSnippet || ''}`.toLowerCase();
        return content.includes(companyName.toLowerCase());
      });

      const newsItems = relevantItems.slice(0, 5).map((item) => ({
        title: item.title,
        source: feed.name,
        date: new Date(item.pubDate || item.isoDate),
        snippet: cleanHtml(item.contentSnippet || item.content || '').substring(0, 200),
        link: item.link,
        type: 'news',
      }));

      allNews.push(...newsItems);
    } catch (error) {
      console.error(`Error fetching ${feed.name}:`, error);
    }
  }

  return allNews;
}

/**
 * Get all news for a company from RSS sources
 * @param {Object} params
 * @param {string} params.companyName - Company name
 * @param {string} params.companyNumber - Israeli company number (ח.פ) - optional
 * @param {string} params.taseId - TASE company ID (optional, for public companies)
 * @param {boolean} params.includeIsraeliMedia - Whether to include Israeli media feeds
 * @returns {Promise<Array>}
 */
export async function getCompanyNews({ companyName, companyNumber, taseId, includeIsraeliMedia = true }) {
  // Check cache
  const cacheKey = `${companyName}-${companyNumber || ''}-${taseId || 'none'}`;
  const cached = newsCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`[News] Using cached results for ${companyName}`);
    return cached.data;
  }

  try {
    const newsPromises = [];

    // Fetch Google News
    console.log(`[News] Fetching Google News for ${companyName}`);
    newsPromises.push(fetchGoogleNews(companyName));

    // Fetch Israeli media if requested
    if (includeIsraeliMedia) {
      console.log(`[News] Fetching Israeli media for ${companyName}`);
      newsPromises.push(fetchIsraeliNews(companyName));
    }

    const results = await Promise.allSettled(newsPromises);
    
    // Merge all results
    const allNews = results
      .filter((result) => result.status === 'fulfilled')
      .flatMap((result) => result.value);

    console.log(`[News] Total news items collected: ${allNews.length}`);

    // Sort by date (newest first)
    allNews.sort((a, b) => b.date - a.date);

    // Remove duplicates based on title similarity
    const uniqueNews = removeDuplicates(allNews);

    console.log(`[News] After deduplication: ${uniqueNews.length} items`);

    // Limit to top 30 items
    const finalNews = uniqueNews.slice(0, 30);

    // Cache results
    newsCache.set(cacheKey, {
      data: finalNews,
      timestamp: Date.now(),
    });

    return finalNews;
  } catch (error) {
    console.error('[News] Error fetching company news:', error);
    return [];
  }
}

/**
 * Remove duplicate news items based on title similarity
 */
function removeDuplicates(newsItems) {
  const seen = new Set();
  return newsItems.filter((item) => {
    const normalizedTitle = normalizeTitle(item.title);
    if (seen.has(normalizedTitle)) {
      return false;
    }
    seen.add(normalizedTitle);
    return true;
  });
}

/**
 * Normalize title for duplicate detection
 */
function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^\u0590-\u05FFa-z0-9\s]/g, '') // Keep Hebrew, English, numbers
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 50); // Compare first 50 chars
}

/**
 * Extract source name from Google News title format
 */
function extractSourceFromTitle(title) {
  const match = title.match(/- ([^-]+)$/);
  return match ? match[1].trim() : 'Google News';
}

/**
 * Clean HTML tags and entities
 */
function cleanHtml(html) {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * Clear news cache (useful for testing or manual refresh)
 */
export function clearNewsCache() {
  newsCache.clear();
}
