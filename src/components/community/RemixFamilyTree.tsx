import { memo } from "react";
import { useTranslation } from "react-i18next";
import type { RemixLineageNode } from "../../data/patternRemixLineage.ts";
import { loc } from "../../utils/i18nContent.ts";

function CurvedArrow() {
  return (
    <svg
      className="mx-1 h-8 w-10 shrink-0 text-coral"
      viewBox="0 0 40 32"
      fill="none"
      aria-hidden
    >
      <path
        d="M2 16 C12 4, 28 28, 38 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M32 12 L38 16 L32 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RemixNodeCard({ node }: { node: RemixLineageNode }) {
  const { t } = useTranslation();
  const initial = node.author.slice(0, 1);
  const title = loc(t, `content.patterns.${node.patternId}.title`, node.title);

  return (
    <div
      className={`flex w-[11.5rem] shrink-0 flex-col gap-2 rounded-2xl p-3 ${
        node.isCurrent ? "bg-coral text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-sans text-sm font-bold ${
            node.isCurrent ? "bg-white/20 text-white" : "bg-gray-100 text-coral"
          }`}
        >
          {initial}
        </span>
        <div className="min-w-0">
          <p
            className={`truncate font-sans text-sm font-bold ${
              node.isCurrent ? "text-white" : "text-gray-900"
            }`}
          >
            {title}
          </p>
          <p
            className={`truncate font-sans text-xs font-normal ${
              node.isCurrent ? "text-white/80" : "text-gray-500"
            }`}
          >
            @{node.author}
          </p>
        </div>
      </div>
      <span
        className={`inline-flex w-fit rounded-full px-2.5 py-0.5 font-sans text-[11px] font-normal ${
          node.isCurrent ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700"
        }`}
      >
        {node.changeLabel}
      </span>
    </div>
  );
}

type RemixFamilyTreeProps = {
  nodes: RemixLineageNode[];
};

function RemixFamilyTree({ nodes }: RemixFamilyTreeProps) {
  const { t } = useTranslation();
  if (nodes.length === 0) return null;

  return (
    <section className="mt-14 rounded-2xl bg-gray-50 p-6 md:p-8">
      <h2 className="font-sans text-xl font-bold text-gray-900">{t("community.remixTitle")}</h2>
      <p className="mt-2 font-seoyun text-sm font-normal text-gray-600">
        {t("community.remixHint")}
      </p>

      <div className="mt-6 -mx-2 overflow-x-auto px-2 pb-2">
        <div className="flex min-w-min items-center">
          {nodes.map((node, index) => (
            <div key={node.id} className="flex items-center">
              <RemixNodeCard node={node} />
              {index < nodes.length - 1 && <CurvedArrow />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(RemixFamilyTree);
