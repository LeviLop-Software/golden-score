import { NextResponse } from 'next/server';
import { classifyCompany } from '@/src/services/classificationService';

/**
 * GET /api/classify/[companyId]
 * Classify a company by its ID
 * 
 * Query params:
 * - name: Company name (Hebrew)
 * - englishName: Company name (English)
 * - purpose: Business purpose
 * - city: City
 * - news: JSON array of news headlines
 * - skipCache: Skip cache lookup
 */
export async function GET(request, { params }) {
  try {
    const { companyId } = await params;
    const { searchParams } = new URL(request.url);
    
    // Build company data from query params
    const companyData = {
      id: companyId,
      name: searchParams.get('name') || '',
      englishName: searchParams.get('englishName') || '',
      purpose: searchParams.get('purpose') || '',
      city: searchParams.get('city') || '',
      news: []
    };
    
    // Parse news if provided
    const newsParam = searchParams.get('news');
    if (newsParam) {
      try {
        companyData.news = JSON.parse(newsParam);
      } catch (e) {
        // If not valid JSON, treat as single headline
        companyData.news = [newsParam];
      }
    }
    
    const options = {
      skipCache: searchParams.get('skipCache') === 'true'
    };
    
    const result = await classifyCompany(companyData, options);
    
    return NextResponse.json({
      success: true,
      companyId,
      classification: result
    });
    
  } catch (error) {
    console.error('Classification API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

/**
 * POST /api/classify/[companyId]
 * Classify a company with full data in body
 */
export async function POST(request, { params }) {
  try {
    const { companyId } = await params;
    const body = await request.json();
    
    const companyData = {
      id: companyId,
      name: body.name || '',
      englishName: body.englishName || '',
      purpose: body.purpose || '',
      city: body.city || '',
      news: body.news || []
    };
    
    const options = {
      skipCache: body.skipCache || false
    };
    
    const result = await classifyCompany(companyData, options);
    
    return NextResponse.json({
      success: true,
      companyId,
      classification: result
    });
    
  } catch (error) {
    console.error('Classification API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
