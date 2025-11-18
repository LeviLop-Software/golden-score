/**
 * API Route - Trustee Data
 * 
 * מטרה: Endpoint לטעינת נתוני כונס נכסים/נאמן
 * 
 * Method: GET
 * Path: /api/company/[id]/trustee
 * 
 * Response:
 * - 200: TrusteeData object
 * - 400: Bad Request (חסר company ID)
 * - 500: Server Error
 * 
 * תכונות:
 * - Caching דרך trusteeService
 * - טיפול בשגיאות
 * - תשובה ריקה במקרה של אי-הצלחה
 */

import { NextResponse } from 'next/server';
import { getTrusteeData } from '../../../../../src/services/trusteeService';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET handler
 * @param request - Next.js request object
 * @param params - Route parameters with company ID
 */
export async function GET(
  request: Request,
  { params }: RouteParams
): Promise<NextResponse> {
  const resolvedParams = await params;
  const companyId = resolvedParams.id;

  // בדיקת קלט
  if (!companyId || companyId.trim().length === 0) {
    return NextResponse.json(
      { error: 'מספר ח.פ חסר' },
      { status: 400 }
    );
  }

  console.log(`[API] Fetching trustee data for company ${companyId}`);

  try {
    const data = await getTrusteeData(companyId);
    
    // לוג למעקב
    console.log(`[API] Successfully fetched trustee data for company ${companyId}:`, {
      hasTrustee: data.hasTrustee,
      trusteesCount: data.trustees.length,
      proceduresCount: data.procedures.length,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API] Error fetching trustee data:', error);

    // במקרה של שגיאה, מחזירים תשובה ריקה במקום 500
    // כך הממשק לא יקרוס אלא יציג "אין נתונים"
    return NextResponse.json({
      companyId: companyId,
      companyName: 'לא ידוע',
      hasTrustee: false,
      trustees: [],
      procedures: [],
      relatedCompanies: [],
    });
  }
}
