import { NextResponse } from 'next/server';
import { getInsolvencyCases } from '@/src/services/insolvencyService';

/**
 * GET /api/company/[id]/insolvency
 * Fetch company insolvency (חדלות פירעון) data by company ID
 */
export async function GET(request, context) {
  try {
    const { id } = await context.params;

    // Validate company ID
    if (!id || String(id).trim().length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Company ID is required',
          caseCount: 0,
          cases: []
        },
        { status: 400 }
      );
    }

    // Validate company ID is numeric
    if (!/^\d+$/.test(String(id).trim())) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Company ID must be numeric',
          caseCount: 0,
          cases: []
        },
        { status: 400 }
      );
    }

    console.log(`[API] Fetching insolvency data for company: ${id}`);

    // Fetch insolvency data
    const data = await getInsolvencyCases(String(id));

    return NextResponse.json({
      success: true,
      companyId: id,
      caseCount: data.caseCount,
      cases: data.cases,
    });

  } catch (error) {
    console.error('[API] Error fetching insolvency data:', error);
    
    // Return graceful error response
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch insolvency data',
        caseCount: 0,
        cases: []
      },
      { status: error.message?.includes('unavailable') ? 503 : 500 }
    );
  }
}
