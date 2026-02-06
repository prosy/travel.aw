import Link from 'next/link';
import { prisma } from '@/app/_lib/prisma';
import { FaqContent } from './FaqContent';

export default async function FAQPage() {
  const articles = await prisma.faqArticle.findMany({
    where: { isPublished: true },
    orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
  });

  // Group by category
  const grouped: Record<string, Array<{ id: string; question: string; answer: string }>> = {};
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

  const categories = Object.keys(grouped);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/help"
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          &larr; Help Center
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          Frequently Asked Questions
        </h1>
      </div>

      {categories.length === 0 ? (
        <p className="py-12 text-center text-zinc-500">
          No FAQs available at the moment.
        </p>
      ) : (
        <FaqContent categories={categories} articles={grouped} />
      )}
    </div>
  );
}
