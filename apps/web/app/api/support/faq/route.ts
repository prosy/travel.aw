import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';

// Public endpoint - no auth required
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where = {
      isPublished: true,
      ...(category ? { category } : {}),
      ...(search
        ? {
            OR: [
              { question: { contains: search } },
              { answer: { contains: search } },
              { searchKeywords: { contains: search } },
            ],
          }
        : {}),
    };

    const articles = await prisma.faqArticle.findMany({
      where,
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    });

    // Group by category
    const grouped: Record<string, Array<{
      id: string;
      question: string;
      answer: string;
    }>> = {};

    for (const article of articles) {
      if (!grouped[article.category]) {
        grouped[article.category] = [];
      }
      grouped[article.category].push({
        id: article.id,
        question: article.question,
        answer: article.answer,
      });
    }

    return NextResponse.json({
      categories: Object.keys(grouped),
      articles: grouped,
    });
  } catch (error) {
    console.error('GET /api/support/faq error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
