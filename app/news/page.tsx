"use client";

import { useEffect, useState } from "react";
import Image, { type ImageLoaderProps } from "next/image";
import PageLayout from "@/components/PageLayout";
import { getNews, NewsArticle } from "@/lib/fetchStock";

function imageLoader({ src }: ImageLoaderProps) {
  return src;
}

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const data = await getNews(20);
        setArticles(data);
      } catch (err) {
        console.error("Failed to load news:", err);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <PageLayout className="mx-auto max-w-6xl px-4 py-10 text-white sm:px-6 sm:py-14">
      <h1 className="mb-6 text-center text-3xl font-bold text-blue-500 sm:mb-8 sm:text-4xl md:text-left">
        Trending News
      </h1>

      {loading ? (
        <p className="text-center text-gray-400">Loading latest news…</p>
      ) : articles.length === 0 ? (
        <p className="text-center text-gray-400">No news available</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article, idx) => (
            <a
              key={article.link + idx}
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-[#0e111a] rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <Image
                loader={imageLoader}
                src={article.image || "/globe.svg"}
                alt={article.title}
                width={400}
                height={200}
                unoptimized
                className="h-48 w-full object-cover"
              />
              <div className="p-5 space-y-2">
                <h2 className="text-xl font-bold text-blue-400">{article.title}</h2>
                <p className="text-gray-400 text-sm">
                  {article.site} • {new Date(article.publishedDate).toLocaleDateString()}
                </p>
                <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                  {(article.text || "").replace(/<[^>]+>/g, "")}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
