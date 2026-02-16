"use client";

import { motion, easeOut } from "framer-motion";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string; 
}

export default function PageLayout({ children, className = "" }: PageLayoutProps) {
  return (
    <motion.main
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: easeOut }}
    >
      {children}
    </motion.main>
  );
}