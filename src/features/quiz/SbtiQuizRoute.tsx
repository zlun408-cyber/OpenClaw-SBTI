import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAppStore } from "../../state/appStore";
import { questions } from "./questions";
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
    <section>
      <h1>SBTI Quiz</h1>
      <p>
        第 {currentQuestionIndex + 1} / {questions.length} 题
      </p>
      <h2>{currentQuestion.prompt}</h2>
      <div>
        {currentQuestion.options.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={isWarping}
            onClick={() => submitAnswer(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
      {isWarping && (
        <div className="warp-overlay" role="status" aria-live="polite">
          跃迁中...
        </div>
      )}
    </section>
  );
}
