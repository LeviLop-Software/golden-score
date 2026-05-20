import fs from 'fs';
import path from 'path';

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Gemini Model Selection:
 * - Using 'gemini-2.5-flash-lite' for Free Tier compatibility
 * - This is the smallest/cheapest model with generous free quota
 * - gemini-2.0-flash has stricter rate limits on Free Tier
 */
const GEMINI_MODEL = 'gemini-2.5-flash-lite';

/**
 * Environment flags:
 * - USE_AI=false: Disable AI calls entirely (use keyword fallback)
 * - USE_MOCK_AI=true: Return mock responses without calling API
 */
const USE_AI = process.env.USE_AI !== 'false';
const USE_MOCK_AI = process.env.USE_MOCK_AI === 'true';
const USE_ENHANCED_CLASSIFICATION = process.env.USE_ENHANCED_CLASSIFICATION === 'true';

/**
 * In-memory cache to prevent repeated API calls during development
 * Key: companyId, Value: { result, timestamp }
 */
const inMemoryCache = new Map();
const MEMORY_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Load configuration files
const industriesPath = path.join(process.cwd(), 'src/data/industries.json');
const keywordsPath = path.join(process.cwd(), 'src/data/keywords.json');
const cachePath = path.join(process.cwd(), 'src/data/classification-cache.json');

const industries = JSON.parse(fs.readFileSync(industriesPath, 'utf8'));
const keywords = JSON.parse(fs.readFileSync(keywordsPath, 'utf8'));

/**
 * Main classification function
 */
export async function classifyCompany(companyData, options = {}) {
  try {
    // 1. Check cache first (unless skipCache is true)
    if (!options.skipCache) {
      const cached = getFromCache(companyData.id);
      if (cached) {
        return cached;
      }
    }

    // 2. Primary classification: Focus on company name
    const nameBasedResult = classifyByName(companyData);
    
    // 3. If name-based classification is confident enough, use it
    if (nameBasedResult.confidence >= 0.7) {
      const result = finalizeResult(nameBasedResult, 'name_based');
      saveToCache(companyData.id, result, companyData);
      return result;
    }

    // 4. If name is not clear, try AI with enhanced information (if enabled)
    if (USE_AI && !USE_MOCK_AI) {
      // Try to fetch additional information for better context (if enhanced classification is enabled)
      if (USE_ENHANCED_CLASSIFICATION && (!companyData.news || companyData.news.length === 0)) {
        try {
          // Import news service if available
          const { searchNews } = await import('../lib/news.js').catch(() => ({}));
          if (searchNews && companyData.name) {
            console.log('📰 Fetching news for enhanced classification...');
            const newsResults = await searchNews(companyData.name, companyData.id);
            if (newsResults && Array.isArray(newsResults) && newsResults.length > 0) {
              companyData.news = newsResults.slice(0, 3).map(item => 
                item.title || item.headline || item.description || ''
              ).filter(Boolean);
              console.log(`📰 Found ${companyData.news.length} news items for classification`);
            }
          }
        } catch (newsError) {
          console.log('⚠️ Could not fetch news for classification:', newsError.message);
        }
      }

      const aiResult = await classifyWithAI(companyData);
      
      // If quota exceeded, return immediately with that result
      if (aiResult.quotaExceeded) {
        const result = finalizeResult(aiResult, 'api_quota_exceeded');
        saveToCache(companyData.id, result, companyData);
        return result;
      }
      
      // Accept AI result if confidence >= 0.5 OR if it's a deliberate "general" classification
      if (aiResult.confidence >= 0.5 || (aiResult.industry === 'general' && aiResult.confidence >= 0.3)) {
        const result = finalizeResult(aiResult, 'ai_classification');
        saveToCache(companyData.id, result, companyData);
        return result;
      }
    }

    // 5. Try keyword matching only if name-based was very low confidence
    if (nameBasedResult.confidence <= 0.4) {
      const keywordResult = classifyByKeywords(companyData.name);
      if (keywordResult.industry && keywordResult.confidence >= 0.6) {
        const result = finalizeResult(keywordResult, 'keyword_matching');
        saveToCache(companyData.id, result, companyData);
        return result;
      }
    }

    // 6. Default to general if nothing clear
    const fallbackResult = {
      industry: 'general',
      confidence: 0.3,
      reasoning: 'לא ניתן לקבוע ענף ספציפי מהשם'
    };
    
    const result = finalizeResult(fallbackResult, 'general_fallback');
    saveToCache(companyData.id, result, companyData);
    return result;

  } catch (error) {
    console.error('======================================');
    console.error('❌ CLASSIFICATION ERROR (outer catch)');
    console.error('======================================');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('======================================');
    
    return finalizeResult({
      industry: 'general',
      confidence: 0.1,
      reasoning: 'שגיאה בסיווג'
    }, 'error');
  }
}

/**
 * Name-based classification - Primary method focusing on company name
 * Follows strict rules: classify based on company name primarily
 */
function classifyByName(companyData) {
  const name = (companyData.name || '').toLowerCase().trim();
  const purpose = (companyData.purpose || '').toLowerCase();
  const englishName = (companyData.englishName || '').toLowerCase();
  
  if (!name) {
    return { industry: 'general', confidence: 0.1, reasoning: 'No company name provided' };
  }

  // High confidence patterns - explicit business type in name
  const patterns = {
    technology: [
      /טכנולוג/,
      /תוכנ/,
      /מחשב/,
      /דיגיטל/,
      /סייבר/,
      /היי\s*טק/,
      /הייטק/,
      /\btech\b/,
      /software/,
      /digital/,
      /cyber/,
      /\bit\b/,
      /computer/,
      /systems/
    ],
    banking_finance: [
      /בנק/,
      /ביטוח/,
      /פיננס/,
      /השקע/,
      /קרן/,
      /אשראי/,
      /\bbank\b/,
      /insurance/,
      /finance/,
      /capital/,
      /fund/,
      /credit/,
      /investment/
    ],
    real_estate: [
      /נדל.{0,2}ן/,
      /בנ[יי]ה/,
      /קבלן/,
      /יזם/,
      /פיתוח/,
      /real\s*estate/,
      /construction/,
      /building/,
      /developer/,
      /contractor/
    ],
    healthcare: [
      /רפוא/,
      /בריאות/,
      /רופא/,
      /קליני/,
      /פארמ/,
      /תרופ/,
      /בית.{0,3}חול/,
      /medical/,
      /health/,
      /pharma/,
      /clinic/,
      /hospital/,
      /doctor/,
      /drug/
    ],
    manufacturing: [
      /תעשיי/,
      /מפעל/,
      /ייצור/,
      /מכונ/,
      /כלי.{0,3}עבוד/,
      /industrial/,
      /factory/,
      /manufacturing/,
      /production/,
      /machinery/
    ],
    retail: [
      /קמעונ/,
      /חנות/,
      /מכיר/,
      /סופר/,
      /קניו/,
      /שופינג/,
      /retail/,
      /store/,
      /shop/,
      /market/,
      /mall/,
      /shopping/
    ],
    food_beverage: [
      /מזון/,
      /אוכל/,
      /מסעד/,
      /בית.{0,3}קפה/,
      /קפה/,
      /פיצרי/,
      /מאפ/,
      /משקא/,
      /food/,
      /restaurant/,
      /cafe/,
      /coffee/,
      /pizza/,
      /bakery/,
      /beverage/,
      /drink/
    ],
    construction: [
      /בני[יה]/,
      /קבלן/,
      /הנדס/,
      /אדריכל/,
      /תשתית/,
      /construction/,
      /building/,
      /contractor/,
      /engineer/,
      /architect/,
      /infrastructure/
    ],
    transportation: [
      /תחבור/,
      /הובל/,
      /משאית/,
      /רכב/,
      /לוגיסטי/,
      /שילוח/,
      /transport/,
      /logistics/,
      /shipping/,
      /delivery/,
      /truck/,
      /vehicle/
    ],
    energy: [
      /אנרגי/,
      /חשמל/,
      /גז/,
      /דלק/,
      /סולר/,
      /נפט/,
      /energy/,
      /electric/,
      /gas/,
      /fuel/,
      /oil/,
      /power/,
      /solar/
    ],
    education: [
      /חינוך/,
      /לימוד/,
      /בית.{0,3}ספר/,
      /אוניברסיט/,
      /מכללה/,
      /הוראה/,
      /education/,
      /school/,
      /university/,
      /college/,
      /learning/,
      /teaching/
    ],
    legal_services: [
      /עו.{0,2}ד/,
      /משפט/,
      /חוק/,
      /נוטרי/,
      /יועץ.{0,3}משפט/,
      /law/,
      /legal/,
      /attorney/,
      /lawyer/,
      /notary/,
      /counsel/
    ],
    consulting: [
      /ייעוץ/,
      /יועצ/,
      /ניהול/,
      /אסטרטגי/,
      /consulting/,
      /consultant/,
      /advisory/,
      /management/,
      /strategy/
    ],
    media_marketing: [
      /תקשור/,
      /פרסום/,
      /שיווק/,
      /מדיה/,
      /עיתונ/,
      /רדיו/,
      /טלוויזי/,
      /media/,
      /marketing/,
      /advertising/,
      /newspaper/,
      /radio/,
      /television/,
      /tv/
    ],
    tourism: [
      /תיירות/,
      /נופש/,
      /מלון/,
      /נסיע/,
      /טיול/,
      /tourism/,
      /travel/,
      /hotel/,
      /resort/,
      /vacation/,
      /trip/
    ]
  };

  // Check name against patterns
  for (const [industry, regexList] of Object.entries(patterns)) {
    for (const regex of regexList) {
      if (regex.test(name) || regex.test(englishName)) {
        return {
          industry,
          confidence: 0.9,
          reasoning: `Company name clearly indicates ${industry} business: "${name}"`
        };
      }
    }
  }

  // Medium confidence - check purpose if name is unclear
  if (purpose && purpose !== 'לעסוק בכל עיסוק חוקי' && purpose !== 'לעסוק בסוגי עיסוק שפורטו בתקנון') {
    for (const [industry, regexList] of Object.entries(patterns)) {
      for (const regex of regexList) {
        if (regex.test(purpose)) {
          return {
            industry,
            confidence: 0.7,
            reasoning: `Business purpose indicates ${industry}: "${purpose}"`
          };
        }
      }
    }
  }

  // Low confidence - generic name
  return {
    industry: 'general',
    confidence: 0.3,
    reasoning: `Company name "${name}" does not clearly indicate specific industry`
  };
}

/**
 * Keyword-based classification
 */
export function classifyByKeywords(companyName) {
  if (!companyName) {
    return { industry: null, confidence: 0.0, matches: [] };
  }

  // Tokenize company name
  const tokens = tokenize(companyName);
  const matches = {};

  // Check matches for each industry
  for (const [industry, keywordList] of Object.entries(keywords)) {
    const hebrewMatches = findMatches(tokens, keywordList.he);
    const englishMatches = findMatches(tokens, keywordList.en);
    const totalMatches = hebrewMatches.length + englishMatches.length;
    
    if (totalMatches > 0) {
      matches[industry] = {
        count: totalMatches,
        keywords: [...hebrewMatches, ...englishMatches],
        // Boost confidence for highly specific keywords
        specificity: calculateSpecificity(hebrewMatches.concat(englishMatches))
      };
    }
  }

  // Find best match
  if (Object.keys(matches).length === 0) {
    return { industry: null, confidence: 0.0, matches: [] };
  }

  // Sort by count first, then by specificity
  const bestIndustry = Object.entries(matches)
    .sort(([,a], [,b]) => {
      if (b.count !== a.count) return b.count - a.count;
      return b.specificity - a.specificity;
    })[0];
    
  const [industry, matchData] = bestIndustry;
  
  // Calculate confidence based on matches and specificity
  let confidence;
  if (matchData.count >= 3) confidence = 0.95;
  else if (matchData.count === 2) confidence = 0.8;
  else if (matchData.count === 1 && matchData.specificity > 0.7) confidence = 0.75;
  else if (matchData.count === 1) confidence = 0.6;
  else confidence = 0.3;

  // Reduce confidence for ambiguous cases
  const competingIndustries = Object.entries(matches).filter(([_, data]) => data.count === matchData.count);
  if (competingIndustries.length > 1) {
    confidence *= 0.8; // Reduce confidence for ambiguous cases
  }

  return {
    industry,
    confidence,
    matches: matchData.keywords,
    reasoning: `Found ${matchData.count} keyword matches: ${matchData.keywords.join(', ')}`
  };
}

/**
 * Calculate keyword specificity (more specific keywords get higher scores)
 */
function calculateSpecificity(matchedKeywords) {
  const specificityMap = {
    // High specificity keywords
    'בנק': 0.95, 'ביטוח': 0.9, 'תרופות': 0.9, 'פארמה': 0.9,
    'בית חולים': 0.95, 'קליניקה': 0.8, 'רופא': 0.8,
    'נדלן': 0.95, 'בנייה': 0.7, 'קבלן': 0.7,
    'תוכנה': 0.9, 'סייבר': 0.9, 'טכנולוגי': 0.8,
    'bank': 0.95, 'insurance': 0.9, 'pharma': 0.9, 'hospital': 0.95,
    'software': 0.9, 'cyber': 0.9, 'tech': 0.8,
    // Medium specificity
    'מסעדה': 0.7, 'קפה': 0.6, 'אוכל': 0.5,
    'חנות': 0.5, 'מכירות': 0.5, 'קניות': 0.6,
    // Low specificity (generic terms)
    'שירותים': 0.3, 'חברה': 0.1, 'עסק': 0.2
  };

  if (matchedKeywords.length === 0) return 0;

  const scores = matchedKeywords.map(keyword => 
    specificityMap[keyword.toLowerCase()] || 0.5 // Default specificity
  );

  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

/**
 * AI classification using Gemini
 */
export async function classifyWithAI(companyData) {
  try {
    console.log('=== AI Classification Start ===');
    console.log('Company data received:', JSON.stringify(companyData, null, 2));
    console.log('Config: USE_AI=%s, USE_MOCK_AI=%s, MODEL=%s', USE_AI, USE_MOCK_AI, GEMINI_MODEL);
    
    // Check if AI is disabled via environment
    if (!USE_AI) {
      console.log('⚠️ AI disabled via USE_AI=false, using keyword fallback');
      return classifyByKeywords(companyData.name);
    }
    
    // Check if mock mode is enabled
    if (USE_MOCK_AI) {
      console.log('🎭 Mock mode enabled, returning mock response');
      return getMockClassification(companyData);
    }
    
    // Check in-memory cache first (prevents repeated calls during dev)
    const memoryCached = inMemoryCache.get(companyData.id);
    if (memoryCached && (Date.now() - memoryCached.timestamp) < MEMORY_CACHE_TTL) {
      console.log('💾 Using in-memory cached result for:', companyData.id);
      return memoryCached.result;
    }
    
    if (!process.env.GEMINI_API_KEY) {
      console.log('ERROR: GEMINI_API_KEY not set');
      return {
        industry: 'general',
        confidence: 0.3,
        reasoning: 'מפתח API לא מוגדר'
      };
    }
    
    console.log('GEMINI_API_KEY is set, calling API...');
    const result = await callRealGeminiAPI(companyData);
    
    // Store in memory cache
    inMemoryCache.set(companyData.id, { result, timestamp: Date.now() });
    
    return result;

  } catch (error) {
    console.error('AI classification error:', error.message);
    console.error('Full error:', error);
    
    // Check if this is a quota exceeded error
    if (error.message.includes('429') || 
        error.message.includes('quota') || 
        error.message.includes('limit') ||
        error.message.includes('מכסת') ||
        error.message.includes('API error: 429')) {
      return {
        industry: 'general',
        confidence: 0,
        reasoning: 'אין סיווג AI – מכסת ה-API נגמרה',
        quotaExceeded: true
      };
    }
    
    return {
      industry: 'general',
      confidence: 0.2,
      reasoning: 'שגיאה'
    };
  }
}

/**
 * Search for additional company information online
 */
async function searchCompanyInfo(companyData) {
  // Only search for additional info if enhanced classification is enabled
  if (!USE_ENHANCED_CLASSIFICATION) {
    return ['פיצ'ר חיפוש מידע נוסף כבוי'];
  }

  try {
    console.log('🔍 Searching for additional company information online...');
    
    const searchQueries = [
      `"${companyData.name}"`,
      companyData.englishName ? `"${companyData.englishName}"` : null,
      companyData.id ? `חברה ${companyData.id}` : null
    ].filter(Boolean);

    let additionalInfo = [];
    
    for (const query of searchQueries.slice(0, 2)) { // Limit to 2 searches to avoid quota issues
      try {
        console.log(`🔍 Searching: ${query}`);
        
        // Use Google search via fetch (simple approach)
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query + ' site:linkedin.com OR site:facebook.com OR site:wikipedia.org OR site:duns100.co.il')}`;
        
        // For now, we'll use the company's existing news as additional context
        // In a production environment, you could integrate with search APIs
        if (companyData.news && companyData.news.length > 0) {
          additionalInfo.push(...companyData.news.slice(0, 3));
          break; // If we have news, that's good additional context
        }
        
        // Alternative: Check if company name contains industry indicators
        const industryHints = extractIndustryHints(companyData.name, companyData.englishName);
        if (industryHints.length > 0) {
          additionalInfo.push(`מילות מפתח שנמצאו בשם החברה: ${industryHints.join(', ')}`);
        }
        
      } catch (searchError) {
        console.log(`⚠️ Search failed for "${query}":`, searchError.message);
      }
    }
    
    return additionalInfo.length > 0 ? additionalInfo : ['אין מידע נוסף זמין'];
    
  } catch (error) {
    console.error('Error searching for company info:', error);
    return ['שגיאה בחיפוש מידע נוסף'];
  }
}

/**
 * Extract industry hints from company names
 */
function extractIndustryHints(hebrewName, englishName) {
  const hints = [];
  const text = `${hebrewName || ''} ${englishName || ''}`.toLowerCase();
  
  const industryKeywords = {
    'טכנולוגיה': ['tech', 'software', 'cyber', 'data', 'digital', 'טכנולוג', 'תוכנה', 'סייבר', 'דיגיטל'],
    'בנקאות': ['bank', 'finance', 'invest', 'capital', 'בנק', 'פיננס', 'השקעות', 'הון'],
    'נדלן': ['real estate', 'property', 'construction', 'נדלן', 'נכסים', 'בנייה', 'קבלן'],
    'בריאות': ['health', 'medical', 'pharma', 'clinic', 'בריאות', 'רפואה', 'פארמה', 'קליניקה'],
    'קמעונאות': ['retail', 'store', 'market', 'shop', 'קמעונאות', 'חנות', 'שוק'],
    'מזון': ['food', 'restaurant', 'catering', 'מזון', 'מסעדה', 'קייטרינג', 'אוכל'],
    'תחבורה': ['transport', 'logistics', 'shipping', 'תחבורה', 'לוגיסטיקה', 'משלוחים'],
    'אנרגיה': ['energy', 'electric', 'solar', 'power', 'אנרגיה', 'חשמל', 'סולארי', 'כוח'],
    'ייעוץ': ['consulting', 'advisory', 'ייעוץ', 'יועצים', 'ייעוצי'],
    'תקשורת': ['media', 'marketing', 'advertising', 'תקשורת', 'שיווק', 'פרסום']
  };
  
  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        hints.push(`${industry} (${keyword})`);
        break; // Only add each industry once
      }
    }
  }
  
  return hints;
}

/**
 * Real Gemini API call
 */
async function callRealGeminiAPI(companyData) {
  const startTime = Date.now();
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  // Search for additional company information
  const additionalInfo = await searchCompanyInfo(companyData);

  // Format news headlines if available
  const newsSection = companyData.news && companyData.news.length > 0
    ? `Recent News Headlines:\n${companyData.news.map(n => `- ${n}`).join('\n')}`
    : 'Recent News Headlines: No news available';

  // Format additional information
  const additionalInfoSection = additionalInfo.length > 0
    ? `Additional Information Found:\n${additionalInfo.map(info => `- ${info}`).join('\n')}`
    : 'Additional Information: None found';

  const prompt = `
You are an expert business analyst specializing in Israeli companies.
Classify this company into ONE industry sector using ALL available information.

ENHANCED CLASSIFICATION RULES:
1. Analyze the company NAME first - look for clear industry indicators
2. Use additional information found online to understand the company's actual business
3. Consider news headlines and industry hints from the company name
4. If multiple sources suggest the same industry, classify with high confidence
5. Use "general" ONLY if no clear industry emerges from all sources
6. Do NOT guess - base classification on evidence provided

Company Details:
- Name (Hebrew): ${companyData.name}
- Name (English): ${companyData.englishName || 'N/A'}
- Company ID: ${companyData.id || 'N/A'}
- City: ${companyData.city || 'N/A'}
- Business Purpose: ${companyData.purpose || 'N/A'}

${additionalInfoSection}

${newsSection}

Available Industries:
1. technology - טכנולוגיה
2. banking_finance - בנקאות ופיננסים
3. real_estate - נדל"ן
4. healthcare - בריאות
5. manufacturing - תעשייה
6. retail - קמעונאות
7. food_beverage - מזון ומשקאות
8. construction - בנייה
9. transportation - תחבורה
10. energy - אנרגיה
11. education - חינוך
12. legal_services - שירותים משפטיים
13. consulting - ייעוץ
14. media_marketing - תקשורת ושיווק
15. tourism - תיירות
16. general - כללי (לחברות ללא סיווג ספציפי)

Enhanced Classification Rules:
1. Start with the company name - does it clearly indicate an industry?
2. Cross-reference with additional information found online
3. Look for patterns in news headlines that suggest business activity
4. Consider industry hints extracted from company names
5. If multiple sources point to the same industry, use high confidence (0.8+)
6. If sources conflict or are unclear, use medium confidence (0.5-0.7)
7. Use "general" with low confidence (0.3-0.5) only when no clear industry emerges
8. Always provide specific reasoning explaining your classification choice

Respond in JSON format only:
{
  "industry": "industry_key",
  "confidence": 0.85,
  "reasoning": "הסבר מפורט בעברית מדוע נבחר סיווג זה, כולל התבססות על המידע הנוסף שנמצא"
}
`;

  // Using gemini-2.5-flash-lite for better Free Tier compatibility
  // This is the smallest/cheapest model with generous free quota
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  
  console.log('======================================');
  console.log('📤 GEMINI API REQUEST');
  console.log('======================================');
  console.log('Model:', GEMINI_MODEL);
  console.log('URL:', url.replace(apiKey, 'API_KEY_HIDDEN'));
  console.log('Company:', companyData.name);
  console.log('======================================');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    
    console.log('======================================');
    console.log('📥 GEMINI API RESPONSE');
    console.log('======================================');
    console.log('Status:', response.status, response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    console.log('Body:', JSON.stringify(data, null, 2));
    console.log('======================================');

    // Check for errors
    if (!response.ok || data.error) {
      console.error('❌ API returned error:', data.error?.message || response.statusText);
      
      if (response.status === 429 || data.error?.code === 429 || 
          (data.error?.message && data.error.message.toLowerCase().includes('quota'))) {
        return {
          industry: 'general',
          confidence: 0,
          reasoning: 'אין סיווג AI – מכסת ה-API נגמרה',
          quotaExceeded: true
        };
      }
      
      throw new Error(data.error?.message || `API error: ${response.status}`);
    }

    // Extract text from response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('No text in Gemini response');
    }

    console.log('✅ Gemini response text:', text);

    // Parse JSON response
    const cleanText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsedResult = JSON.parse(cleanText);
    
    if (!parsedResult.industry || parsedResult.confidence === undefined) {
      throw new Error('Invalid response format from Gemini');
    }

    return {
      ...parsedResult,
      realAPI: true,
      rawResponse: text,
      processingTimeMs: Date.now() - startTime
    };

  } catch (error) {
    console.error('======================================');
    console.error('❌ GEMINI API ERROR');
    console.error('======================================');
    console.error('Error:', error.message);
    console.error('======================================');
    throw error;
  }
}

/**
 * Mock classification for testing without API calls
 * Uses keyword matching as fallback
 */
function getMockClassification(companyData) {
  // Try keyword-based classification first
  const keywordResult = classifyByKeywords(companyData.name);
  
  if (keywordResult.industry && keywordResult.confidence > 0.5) {
    return {
      ...keywordResult,
      reasoning: `סיווג מבוסס מילות מפתח (מצב בדיקה): ${keywordResult.matches?.join(', ') || 'N/A'}`,
      mock: true
    };
  }
  
  // Fallback: use simple heuristics based on name
  const name = (companyData.name || '').toLowerCase();
  
  if (name.includes('טכנולוג') || name.includes('tech') || name.includes('סופט')) {
    return { industry: 'technology', confidence: 0.7, reasoning: 'סיווג מבוסס שם (מצב בדיקה)', mock: true };
  }
  if (name.includes('בנק') || name.includes('פיננס') || name.includes('ביטוח')) {
    return { industry: 'banking_finance', confidence: 0.7, reasoning: 'סיווג מבוסס שם (מצב בדיקה)', mock: true };
  }
  if (name.includes('נדל') || name.includes('בניה') || name.includes('קבלן')) {
    return { industry: 'real_estate', confidence: 0.7, reasoning: 'סיווג מבוסס שם (מצב בדיקה)', mock: true };
  }
  if (name.includes('מזון') || name.includes('אוכל') || name.includes('מסעד') || name.includes('שופרסל') || name.includes('סופר')) {
    return { industry: 'food_beverage', confidence: 0.7, reasoning: 'סיווג מבוסס שם (מצב בדיקה)', mock: true };
  }
  if (name.includes('רפואה') || name.includes('בריאות') || name.includes('קליני') || name.includes('פארמ')) {
    return { industry: 'healthcare', confidence: 0.7, reasoning: 'סיווג מבוסס שם (מצב בדיקה)', mock: true };
  }
  
  return {
    industry: 'general',
    confidence: 0.5,
    reasoning: 'לא נמצא סיווג ספציפי (מצב בדיקה)',
    mock: true
  };
}

/**
 * Finalize result with display information
 */
function finalizeResult(result, source) {
  const industry = result.industry || 'general';
  
  const finalResult = {
    industry,
    confidence: result.confidence,
    source,
    reasoning: result.reasoning,
    display: industries[industry] || industries.general,
    matches: result.matches || [],
    alternative_sectors: result.alternative_sectors || [],
    timestamp: new Date().toISOString()
  };
  
  // Add quota exceeded indicator if present
  if (result.quotaExceeded) {
    finalResult.quotaExceeded = true;
    finalResult.source = 'api_quota_exceeded';
  }
  
  return finalResult;
}

/**
 * Cache management functions
 */
function getFromCache(companyId) {
  try {
    const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    const cached = cache.classifications[companyId];
    
    if (cached) {
      // Check if cache is still valid (6 months)
      const cacheAge = Date.now() - new Date(cached.timestamp).getTime();
      const sixMonths = 6 * 30 * 24 * 60 * 60 * 1000;
      
      if (cacheAge < sixMonths) {
        return cached.classification;
      }
    }
  } catch (error) {
    console.error('Cache read error:', error);
  }
  
  return null;
}

function saveToCache(companyId, classification, companyData) {
  try {
    const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    
    cache.classifications[companyId] = {
      classification,
      metadata: {
        classified_at: new Date().toISOString(),
        version: '1.0',
        method: classification.source
      },
      company_snapshot: {
        name: companyData.name,
        city: companyData.city
      }
    };
    
    cache.metadata.total_entries = Object.keys(cache.classifications).length;
    
    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
  } catch (error) {
    console.error('Cache write error:', error);
  }
}

/**
 * Helper functions
 */
function tokenize(text) {
  if (!text) return [];
  
  return text
    .toLowerCase()
    .replace(/[״״"'`]/g, '"') // Normalize quotes
    .replace(/בע["״]?מ/g, '') // Remove "בע"מ" variations
    .replace(/ltd\.?|limited|inc\.?|corp\.?/gi, '') // Remove English company suffixes
    .replace(/[^\u0590-\u05FFa-zA-Z0-9\s]/g, ' ') // Keep Hebrew, English, numbers
    .split(/\s+/)
    .filter(token => token.length > 1) // Remove single characters
    .filter(token => !['של', 'את', 'עם', 'לכל', 'כל', 'and', 'the', 'of', 'for'].includes(token)); // Remove common stop words
}

function findMatches(tokens, keywordList) {
  const matches = [];
  
  for (const keyword of keywordList) {
    const keywordLower = keyword.toLowerCase();
    const keywordTokens = tokenize(keyword);
    
    // For multi-word keywords, all words must be present
    if (keywordTokens.length > 1) {
      const allWordsFound = keywordTokens.every(keywordToken => 
        tokens.some(token => token === keywordToken)
      );
      if (allWordsFound) {
        matches.push(keyword);
      }
    } else {
      // For single-word keywords, check for exact token match or partial match
      const singleKeywordToken = keywordTokens[0];
      const isMatch = tokens.some(token => {
        // Exact match gets priority
        if (token === singleKeywordToken) return true;
        
        // Allow partial match if both are long enough (3+ chars) and one contains the other
        if (token.length >= 3 && singleKeywordToken.length >= 3) {
          return token.includes(singleKeywordToken) || singleKeywordToken.includes(token);
        }
        
        return false;
      });
      
      if (isMatch) {
        matches.push(keyword);
      }
    }
  }
  
  return matches;
}