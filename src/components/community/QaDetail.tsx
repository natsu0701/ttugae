import { useState } from "react";
import Button from "../ui/Button.tsx";
import Input from "../ui/Input.tsx";
import {
  getAnswersForPost,
  type QaAnswer,
  type QaPost,
} from "../../data/qaPosts.ts";

const LOCAL_AUTHOR = "나";

function isOwnAnswer(ans: QaAnswer) {
  return ans.author === LOCAL_AUTHOR || ans.id.startsWith("ans-local");
}

type QaDetailProps = {
  post: QaPost;
  onBack: () => void;
};

export default function QaDetail({ post, onBack }: QaDetailProps) {
  const [answers, setAnswers] = useState<QaAnswer[]>(() =>
    getAnswersForPost(post.id),
  );
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

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

  const startEdit = (ans: QaAnswer) => {
    setEditingId(ans.id);
    setEditDraft(ans.body);
  };

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

  return (
    <div className="min-h-screen bg-white pb-16 font-sans text-gray-900">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center px-5 py-4 md:px-8">
          <button
            type="button"
            onClick={onBack}
            className="font-sans text-sm font-normal text-gray-700 transition-colors hover:text-coral"
          >
            ← Q&A 목록
          </button>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-5 md:px-8">
        <section className="rounded-2xl bg-gray-50 p-6 md:p-8">
          <h1 className="font-sans text-2xl font-bold leading-snug text-gray-900 md:text-3xl">
            {post.title}
          </h1>
          <div className="mt-4 flex flex-wrap gap-3 font-sans text-sm font-normal text-gray-500">
            <span>@{post.author}</span>
            <span>{post.createdAt}</span>
          </div>
          <p className="mt-6 whitespace-pre-wrap font-sans text-base font-normal leading-relaxed text-gray-700">
            {post.body}
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-sans text-lg font-bold text-gray-900">
            답변 {answers.length}개
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {answers.map((ans) => {
              const own = isOwnAnswer(ans);
              const editing = editingId === ans.id;

              return (
                <li
                  key={ans.id}
                  className="relative rounded-2xl bg-gray-50 p-5 transition-colors hover:bg-gray-100"
                >
                  {own && !editing && (
                    <div className="absolute right-4 top-4 flex gap-3">
                      <button
                        type="button"
                        onClick={() => startEdit(ans)}
                        className="font-sans text-xs font-normal text-gray-500 transition-colors hover:text-coral"
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteAnswer(ans.id)}
                        className="font-sans text-xs font-normal text-gray-500 transition-colors hover:text-coral"
                      >
                        삭제
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pr-20 font-sans text-xs font-normal text-gray-500">
                    <span className="font-normal text-gray-700">@{ans.author}</span>
                    <span>{ans.createdAt}</span>
                  </div>

                  {editing ? (
                    <div className="mt-3">
                      <textarea
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        rows={3}
                        className="w-full rounded-2xl bg-white px-4 py-3 font-sans text-sm font-normal text-gray-700 outline-none focus:bg-gray-100"
                      />
                      <div className="mt-2 flex gap-2">
                        <Button
                          type="button"
                          variant="primary"
                          className="px-4 py-2 text-sm"
                          onClick={() => saveEdit(ans.id)}
                        >
                          저장
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
                          취소
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 whitespace-pre-wrap font-sans text-sm font-normal leading-relaxed text-gray-700">
                      {ans.body}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>

          <form
            onSubmit={handleSubmit}
            className="mt-8 rounded-2xl bg-gray-50 p-5"
          >
            <label className="font-sans text-sm font-normal text-gray-700">
              답변 작성
            </label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="도움이 되는 답변을 남겨 주세요"
                className="flex-1"
              />
              <Button type="submit" variant="primary" className="shrink-0 px-4 py-2">
                등록
              </Button>
            </div>
          </form>
        </section>
      </article>
    </div>
  );
}
