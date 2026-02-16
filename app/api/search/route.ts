import { NextRequest, NextResponse } from 'next/server';
import { advancedSearch } from '@/lib/searchHelpers';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const tagsParam = searchParams.get('tags');
    const type = searchParams.get('type') || 'all';
    const sortBy = searchParams.get('sortBy') || 'relevance';

    const tags = tagsParam ? tagsParam.split(',') : [];

    const results = advancedSearch({
      query,
      tags,
      type: type as 'chapters' | 'characters' | 'world' | 'scenes' | 'all',
      sortBy: sortBy as 'relevance' | 'date' | 'alphabetical',
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Failed to perform search' }, { status: 500 });
  }
}
