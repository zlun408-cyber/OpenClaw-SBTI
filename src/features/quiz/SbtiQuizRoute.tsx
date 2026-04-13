import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAppStore } from "../../state/appStore";
import { questions } from "./questions";
import { type QuizAnswer, scoreQuiz } from "./scoring";

export function SbtiQuizRoute() {
  const completeQuiz = useAppStore((state) => state.completeQuiz);
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);

  const currentQuestion = questions[currentQuestionIndex];

  const submitAnswer = (optionId: string) => {
    const collectedAnswers = [
      ...answers,
      { questionId: currentQuestion.id, value: optionId }
    ];

    if (currentQuestionIndex === questions.length - 1) {
      completeQuiz(scoreQuiz(collectedAnswers));
      navigate("/avatar");
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
          <button key={option.id} type="button" onClick={() => submitAnswer(option.id)}>
            {option.label}
          </button>
        ))}
      </div>
    </section>
  );
}
