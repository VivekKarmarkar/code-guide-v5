"use client";

import { AnimatePresence, motion } from "motion/react";
import type { LayerMeta } from "@/lib/types";

interface ExplanationPanelProps {
  layerMeta: LayerMeta | null;
}

export function ExplanationPanel({ layerMeta }: ExplanationPanelProps) {
  return (
    <div className="py-8 pb-12 flex flex-col items-center justify-center px-8">
      <AnimatePresence mode="wait">
        {layerMeta && (
          <motion.div
            key={layerMeta.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-center max-w-3xl"
          >
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-3">
              {layerMeta.title}
            </h2>
            <p className="text-lg leading-relaxed text-[var(--text-secondary)]">
              {layerMeta.explanation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
