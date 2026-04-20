import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAppStore } from "../../state/appStore";
import { QUIZ_DIMENSION_LABELS, questions } from "./questions";
import { type QuizAnswer, scoreQuiz } from "./scoring";

type WarpTransitionOptions = {
  durationMs?: number;
};

export function useWarpOverlaySequence({ durationMs = 320 }: WarpTransitionOptions = {}) {
  const [isWarping, setWarping] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const runWarpSequence = useCallback(
    (onComplete: () => void) => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }

      setWarping(true);
      timerRef.current = window.setTimeout(() => {
        onComplete();
      }, durationMs);
    },
    [durationMs]
  );

  return { isWarping, runWarpSequence };
}

export function SbtiQuizRoute() {
  const startQuiz = useAppStore((state) => state.startQuiz);
  const completeQuiz = useAppStore((state) => state.completeQuiz);
  const enterAvatarPreview = useAppStore((state) => state.enterAvatarPreview);
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const { isWarping, runWarpSequence } = useWarpOverlaySequence();

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercent = Math.floor(((currentQuestionIndex + 1) / questions.length) * 100);
  const answeredCount = answers.length;

  useEffect(() => {
    startQuiz();
  }, [startQuiz]);

  const submitAnswer = (optionId: string) => {
    if (isWarping) {
      return;
    }

    const collectedAnswers = [
      ...answers,
      { questionId: currentQuestion.id, value: optionId }
    ];

    if (currentQuestionIndex === questions.length - 1) {
      completeQuiz(scoreQuiz(collectedAnswers));
      runWarpSequence(() => {
        enterAvatarPreview();
        navigate("/avatar");
      });
      return;
    }

    setAnswers(collectedAnswers);
    setCurrentQuestionIndex((index) => index + 1);
  };

  return (
    <section
      data-testid="sbti-quiz-shell"
      data-quiz-theme="sbti-ritual"
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "32px 20px",
        background:
          "radial-gradient(circle at 50% 16%, rgba(122, 228, 255, 0.18), transparent 24%), linear-gradient(180deg, #05070d 0%, #0b1020 44%, #05070c 100%)",
        color: "#F6EEDC"
      }}
    >
      <div
        style={{
          width: "min(1120px, 100%)",
          display: "grid",
          gridTemplateColumns: "minmax(240px, 280px) minmax(0, 1fr)",
          gap: "24px"
        }}
      >
        <aside
          style={{
            borderRadius: "28px",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "linear-gradient(180deg, rgba(10,16,28,0.94) 0%, rgba(6,10,18,0.92) 100%)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.38)",
            padding: "24px",
            display: "grid",
            gap: "18px"
          }}
        >
          <div style={{ display: "grid", gap: "8px" }}>
            <div style={{ fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#C9B48A" }}>
              SBTI Ritual Console
            </div>
            <h1 style={{ margin: 0, fontSize: "clamp(28px, 4vw, 42px)", lineHeight: 1.04 }}>SBTI Quiz</h1>
            <p style={{ margin: 0, color: "#9FB2C7", lineHeight: 1.6 }}>
              这不是普通问卷，而是一次人格侧写仪式。请选择最像你“真实默认反应”的选项。
            </p>
          </div>

          <div
            style={{
              padding: "16px 18px",
              borderRadius: "20px",
              border: "1px solid rgba(125,243,255,0.18)",
              background: "linear-gradient(180deg, rgba(18,30,47,0.88) 0%, rgba(8,14,22,0.82) 100%)"
            }}
          >
            <div style={{ fontSize: "12px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#8AE7FF" }}>
              人格维度校准
            </div>
            <div style={{ marginTop: "10px", fontSize: "18px", fontWeight: 700 }}>
              第 {currentQuestionIndex + 1} / {questions.length} 题
            </div>
            <div
              aria-label="quiz progress"
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={progressPercent}
              role="progressbar"
              style={{ marginTop: "16px" }}
            >
              <div
                style={{
                  height: "10px",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.08)",
                  overflow: "hidden"
                }}
              >
                <div
                  style={{
                    width: `${progressPercent}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #7AF0FF 0%, #F1D18D 100%)",
                    boxShadow: "0 0 18px rgba(122,240,255,0.32)"
                  }}
                />
              </div>
              <div style={{ marginTop: "10px", color: "#AFC1D2", fontSize: "13px" }}>
                当前进度 {progressPercent}% · 已完成 {answeredCount} 题
              </div>
            </div>
          </div>

          <div
            style={{
              padding: "16px 18px",
              borderRadius: "20px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)"
            }}
          >
            <div style={{ fontSize: "12px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#C9B48A" }}>
              当前校准维度
            </div>
            <div style={{ marginTop: "10px", fontSize: "22px", fontWeight: 700 }}>
              {QUIZ_DIMENSION_LABELS[currentQuestion.dimension]}
            </div>
            <div style={{ marginTop: "8px", color: "#AFC1D2", fontSize: "14px" }}>{currentQuestion.chapter}</div>
          </div>
        </aside>

        <section
          aria-label="sbti-question-card"
          style={{
            borderRadius: "32px",
            border: "1px solid rgba(255,255,255,0.12)",
            background:
              "radial-gradient(circle at 14% 18%, rgba(125,243,255,0.12), transparent 24%), linear-gradient(180deg, rgba(12,18,30,0.96) 0%, rgba(7,12,21,0.96) 100%)",
            boxShadow: "0 30px 96px rgba(0,0,0,0.42)",
            padding: "28px",
            display: "grid",
            gap: "22px"
          }}
        >
          <div style={{ display: "grid", gap: "12px" }}>
            <div style={{ fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#8AE7FF" }}>
              Calibration Node {currentQuestion.id.toUpperCase()}
            </div>
            <h2 style={{ margin: 0, fontSize: "clamp(28px, 4vw, 42px)", lineHeight: 1.3 }}>{currentQuestion.prompt}</h2>
            <p style={{ margin: 0, color: "#9DB0C3", fontSize: "15px", lineHeight: 1.7 }}>
              选择最符合你默认反应的一项，不要选“理想中的自己”。
            </p>
          </div>

          <div style={{ display: "grid", gap: "14px" }}>
            {currentQuestion.options.map((option, index) => (
              <button
                key={option.id}
                type="button"
                aria-label={option.label}
                disabled={isWarping}
                onClick={() => submitAnswer(option.id)}
                style={{
                  display: "grid",
                  gap: "8px",
                  textAlign: "left",
                  padding: "18px 20px",
                  borderRadius: "22px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background:
                    "linear-gradient(180deg, rgba(18,29,45,0.92) 0%, rgba(10,16,26,0.94) 100%)",
                  color: "#F7F0E3",
                  cursor: isWarping ? "default" : "pointer",
                  boxShadow: "0 18px 36px rgba(0,0,0,0.22)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span
                    aria-hidden="true"
                    style={{
                      width: "34px",
                      height: "34px",
                      display: "grid",
                      placeItems: "center",
                      borderRadius: "999px",
                      background: "rgba(125,243,255,0.12)",
                      border: "1px solid rgba(125,243,255,0.2)",
                      color: "#8AE7FF",
                      fontWeight: 700
                    }}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span aria-hidden="true" style={{ fontSize: "18px", fontWeight: 700 }}>
                    {option.label}
                  </span>
                </div>
                <span aria-hidden="true" style={{ color: "#9FB3C5", fontSize: "13px", letterSpacing: "0.08em" }}>
                  {option.tone}
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>

      {isWarping && (
        <div
          className="warp-overlay"
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            inset: 0,
            display: "grid",
            placeItems: "center",
            background: "radial-gradient(circle, rgba(125,243,255,0.26) 0%, rgba(4,8,14,0.94) 62%)",
            color: "#F4FBFF",
            fontSize: "32px",
            fontWeight: 800,
            letterSpacing: "0.18em",
            textTransform: "uppercase"
          }}
        >
          跃迁中...
        </div>
      )}
    </section>
  );
}
