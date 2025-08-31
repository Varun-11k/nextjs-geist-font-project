"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface QuizProps {
  questions: QuizQuestion[];
  onComplete?: (score: number, totalQuestions: number) => void;
  title?: string;
}

export default function InteractiveQuiz({ 
  questions, 
  onComplete, 
  title = "Interactive Quiz" 
}: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);

  if (!questions || questions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-600">No quiz questions available.</p>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer !== null) {
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = selectedAnswer;
      setAnswers(newAnswers);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(answers[currentQuestionIndex + 1]);
        setShowResult(false);
      } else {
        // Quiz completed
        completeQuiz(newAnswers);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(answers[currentQuestionIndex - 1]);
      setShowResult(false);
    }
  };

  const handleSubmitAnswer = () => {
    setShowResult(true);
  };

  const completeQuiz = (finalAnswers: (number | null)[]) => {
    let correctCount = 0;
    finalAnswers.forEach((answer, index) => {
      if (answer === questions[index].correctAnswer) {
        correctCount++;
      }
    });
    
    setScore(correctCount);
    setQuizCompleted(true);
    
    if (onComplete) {
      onComplete(correctCount, questions.length);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers(new Array(questions.length).fill(null));
    setShowResult(false);
    setQuizCompleted(false);
    setScore(0);
  };

  const getScoreColor = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 80) return "default";
    if (percentage >= 60) return "secondary";
    return "destructive";
  };

  if (quizCompleted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Quiz Completed!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="text-6xl">🎉</div>
            <div>
              <h3 className={`text-2xl font-bold ${getScoreColor()}`}>
                {score} out of {questions.length}
              </h3>
              <p className="text-gray-600">
                {((score / questions.length) * 100).toFixed(0)}% Correct
              </p>
            </div>
            <Badge variant={getScoreBadgeVariant()} className="text-lg px-4 py-2">
              {score / questions.length >= 0.8 ? "Excellent!" : 
               score / questions.length >= 0.6 ? "Good Job!" : "Keep Practicing!"}
            </Badge>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Review:</h4>
            {questions.map((question, index) => (
              <div key={question.id} className="p-3 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{question.question}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Your answer: {question.options[answers[index] || 0]}
                    </p>
                    <p className="text-sm text-green-600">
                      Correct answer: {question.options[question.correctAnswer]}
                    </p>
                  </div>
                  <Badge variant={answers[index] === question.correctAnswer ? "default" : "destructive"}>
                    {answers[index] === question.correctAnswer ? "✓" : "✗"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={restartQuiz} className="w-full">
            Take Quiz Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <Badge variant="outline">
            {currentQuestionIndex + 1} of {questions.length}
          </Badge>
        </CardTitle>
        <Progress value={progress} className="w-full" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <label
                key={index}
                className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedAnswer === index 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-200 hover:border-gray-300"
                } ${
                  showResult && index === currentQuestion.correctAnswer
                    ? "border-green-500 bg-green-50"
                    : ""
                } ${
                  showResult && selectedAnswer === index && index !== currentQuestion.correctAnswer
                    ? "border-red-500 bg-red-50"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={index}
                  checked={selectedAnswer === index}
                  onChange={() => handleAnswerSelect(index)}
                  disabled={showResult}
                  className="text-blue-600"
                />
                <span className="flex-1">{option}</span>
                {showResult && index === currentQuestion.correctAnswer && (
                  <Badge variant="default" className="bg-green-600">
                    Correct
                  </Badge>
                )}
                {showResult && selectedAnswer === index && index !== currentQuestion.correctAnswer && (
                  <Badge variant="destructive">
                    Wrong
                  </Badge>
                )}
              </label>
            ))}
          </div>

          {showResult && currentQuestion.explanation && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-1">Explanation:</h4>
              <p className="text-blue-700 text-sm">{currentQuestion.explanation}</p>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="outline"
          >
            Previous
          </Button>

          <div className="flex gap-2">
            {!showResult ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
              >
                Submit Answer
              </Button>
            ) : (
              <Button onClick={handleNext}>
                {currentQuestionIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
