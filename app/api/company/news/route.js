import { NextResponse } from 'next/server';
import { getCompanyNews } from '@/src/lib/news';

/**
 * GET /api/company/news
 * Fetch news for a company from multiple sources
 * 
 * Query params:
 * - companyName (required): Company name
 * - companyNumber (optional): Israeli company number (ח.פ)
 * - taseId (optional): TASE company ID for public companies
 * - includeIsraeliMedia (optional): Include Israeli media RSS feeds (default: true)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyName = searchParams.get('companyName');
    const companyNumber = searchParams.get('companyNumber');
    const taseId = searchParams.get('taseId');
    const includeIsraeliMedia = searchParams.get('includeIsraeliMedia') !== 'false';

    if (!companyName) {
      return NextResponse.json(
        { error: 'Missing companyName parameter' },
        { status: 400 }
      );
    }

    console.log(`[News API] Fetching news for: ${companyName}, companyNumber: ${companyNumber}, taseId: ${taseId}`);

    const news = await getCompanyNews({
      companyName,
      companyNumber: companyNumber || undefined,
      taseId: taseId || undefined,
      includeIsraeliMedia,
    });

    console.log(`[News API] Returning ${news.length} news items`);

    return NextResponse.json({
      success: true,
      count: news.length,
      news,
      cached: false, // Could track this in the lib
    });
  } catch (error) {
    console.error('[News API] Error in news API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch company news',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
