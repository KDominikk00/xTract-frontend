"use client";

import { motion, easeOut } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
};

export default function NewsPage() {
  const articles = [
    {
      title: "Market rallies as tech stocks climb",
      source: "Reuters",
      image: "https://via.placeholder.com/400x200",
      description:
        "Technology giants led a late surge in markets today as investors reacted to fresh inflation data.",
    },
    {
      title: "Federal Reserve announces new policy shift",
      source: "Bloomberg",
      image: "https://via.placeholder.com/400x200",
      description:
        "The Federal Reserve unveiled a surprising move that could reshape monetary strategy in 2026.",
    },
    {
      title: "Tesla reveals plans for next-gen electric truck",
      source: "The Verge",
      image: "https://via.placeholder.com/400x200",
      description:
        "Elon Musk confirms the long-rumored electric semi truck is entering production later this year.",
    },
  ];

  return (
    <motion.main
      className="max-w-6xl mx-auto px-6 py-16 text-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: easeOut }}
    >
      <h1 className="text-4xl font-bold text-blue-500 mb-8 text-center md:text-left">
        Trending News
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((article, i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            className="bg-[#0e111a] rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
          >
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-48 object-cover opacity-80 hover:opacity-100 transition-opacity"
            />
            <div className="p-5 space-y-2">
              <h2 className="text-xl font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">
                {article.title}
              </h2>
              <p className="text-gray-400 text-sm">{article.source}</p>
              <p className="text-gray-300 text-sm leading-relaxed">{article.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.main>
  );
}