import { memo, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "../ui/Button.tsx";
import BackButton from "../ui/BackButton.tsx";
import ReportModal from "../ui/ReportModal.tsx";
import SmoothInput from "../ui/SmoothInput.tsx";
import {
  getAnswersForPost,
  type QaAnswer,
  type QaPost,
} from "../../data/qaPosts.ts";
import {
  displayAuthor,
  localizedQaAnswer,
  localizedQaPost,
} from "../../utils/i18nContent.ts";
import { FlagFillIcon } from "../icons/FillIcons.tsx";

const LOCAL_AUTHOR = "나";

function isOwnAnswer(ans: QaAnswer) {
  return ans.author === LOCAL_AUTHOR || ans.id.startsWith("ans-local");
}

type QaDetailProps = {
  post: QaPost;
  onBack: () => void;
};

function QaDetail({ post, onBack }: QaDetailProps) {
  const { t } = useTranslation();
  const [answers, setAnswers] = useState<QaAnswer[]>(() =>
    getAnswersForPost(post.id),
  );
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [reportTarget, setReportTarget] = useState<{ type: "post" | "comment"; id: string } | null>(
    null,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;

    const d = new Date();
    const createdAt = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
    const newAnswer: QaAnswer = {
      id: `ans-local-${Date.now()}`,
      postId: post.id,
      author: LOCAL_AUTHOR,
      createdAt,
      body: text,
    };
    setAnswers((prev) => [...prev, newAnswer]);
    setDraft("");
  };

  const startEdit = useCallback((ans: QaAnswer) => {
    setEditingId(ans.id);
    setEditDraft(ans.body);
  }, []);

  const saveEdit = (id: string) => {
    const text = editDraft.trim();
    if (!text) return;
    setAnswers((prev) =>
      prev.map((a) => (a.id === id ? { ...a, body: text } : a)),
    );
    setEditingId(null);
    setEditDraft("");
  };

  const deleteAnswer = (id: string) => {
    setAnswers((prev) => prev.filter((a) => a.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditDraft("");
    }
  };

  const displayPost = localizedQaPost(t, post);

  return (
    <div className="min-h-screen bg-white pb-16 font-sans text-gray-900">
      <header className="relative z-10 bg-white">
        <div className="page-shell flex items-center py-4">
          <BackButton onClick={onBack} />
        </div>
      </header>

      <article className="page-shell">
        <section className="rounded-xl bg-gray-50 p-6 md:p-8">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-display font-sans font-bold leading-snug text-gray-900">
              {displayPost.title}
            </h1>
            <button
              type="button"
              onClick={() => setReportTarget({ type: "post", id: post.id })}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-sm text-stone-500 hover:text-coral"
            >
              <FlagFillIcon className="h-4 w-4" />
              {t("report.action")}
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 font-sans text-sm font-normal text-gray-500">
            <span>@{displayAuthor(t, post.author)}</span>
            <span>{post.createdAt}</span>
          </div>
          <p className="mt-6 whitespace-pre-wrap font-sans text-base font-normal leading-relaxed text-gray-700">
            {displayPost.body}
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-sans text-lg font-bold text-gray-900">
            {t("community.answersCount", { count: answers.length })}
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {answers.map((ans) => {
              const own = isOwnAnswer(ans);
              const editing = editingId === ans.id;
              const displayAns = localizedQaAnswer(t, ans);

              return (
                <li
                  key={ans.id}
                  className="relative rounded-xl bg-gray-50 p-5 transition-colors hover:bg-gray-100"
                >
                  <div className="absolute right-4 top-4 flex gap-3">
                    {own && !editing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(ans)}
                          className="font-sans text-xs font-normal text-gray-500 transition-colors hover:text-coral"
                        >
                          {t("common.edit")}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteAnswer(ans.id)}
                          className="font-sans text-xs font-normal text-gray-500 transition-colors hover:text-coral"
                        >
                          {t("common.delete")}
                        </button>
                      </>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setReportTarget({ type: "comment", id: ans.id })}
                      className="inline-flex items-center gap-1 font-sans text-xs font-normal text-gray-500 transition-colors hover:text-coral"
                    >
                      <FlagFillIcon className="h-3 w-3" />
                      {t("report.action")}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pr-28 font-sans text-xs font-normal text-gray-500">
                    <span className="font-normal text-gray-700">@{displayAuthor(t, ans.author)}</span>
                    <span>{ans.createdAt}</span>
                  </div>

                  {editing ? (
                    <div className="mt-3">
                      <textarea
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        rows={3}
                        className="w-full rounded-xl bg-white px-4 py-3 font-sans text-sm font-normal leading-normal text-gray-700 outline-none focus:bg-gray-100"
                      />
                      <div className="mt-2 flex gap-2">
                        <Button
                          type="button"
                          variant="primary"
                          className="px-4 py-2 text-sm"
                          onClick={() => saveEdit(ans.id)}
                        >
                          {t("common.save")}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="px-4 py-2 text-sm"
                          onClick={() => {
                            setEditingId(null);
                            setEditDraft("");
                          }}
                        >
                          {t("common.cancel")}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 whitespace-pre-wrap font-sans text-sm font-normal leading-relaxed text-gray-700">
                      {displayAns.body}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>

          <form
            onSubmit={handleSubmit}
            className="mt-8 rounded-xl bg-gray-50 p-5"
          >
            <label className="font-sans text-sm font-normal text-gray-700">
              {t("community.writeAnswer")}
            </label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
              <SmoothInput
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t("community.qaReplyPlaceholder")}
                className="flex-1 border-stone-200"
              />
              <Button type="submit" variant="primary" className="shrink-0 px-4 py-2">
                {t("community.submitComment")}
              </Button>
            </div>
          </form>
        </section>
      </article>
      <ReportModal
        open={Boolean(reportTarget)}
        targetType={reportTarget?.type ?? "post"}
        targetId={reportTarget?.id ?? post.id}
        onClose={() => setReportTarget(null)}
      />
    </div>
  );
}

export default memo(QaDetail);
