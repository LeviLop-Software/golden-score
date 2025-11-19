import { NextResponse } from 'next/server';
import { searchCompanies } from '@/src/services/companyService';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json([]);
    }

    const results = await searchCompanies(query);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in company search API:', error);
    return NextResponse.json(
      { error: 'Failed to search companies', message: error.message },
      { status: 500 }
    );
  }
}
