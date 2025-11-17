import { NextResponse } from 'next/server';
import { getCompanyChanges } from '@/src/services/companyChangesService';

/**
 * GET /api/company/[id]/changes
 * Fetch company changes history by company ID
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
          changes: [] 
        },
        { status: 400 }
      );
    }

    console.log(`[API] Fetching changes for company: ${id}`);

    // Fetch company changes
    const changes = await getCompanyChanges(id);

    return NextResponse.json({
      success: true,
      companyId: id,
      count: changes.length,
      changes,
    });

  } catch (error) {
    console.error('[API] Error fetching company changes:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch company changes',
        changes: [] 
      },
      { status: 500 }
    );
  }
}
