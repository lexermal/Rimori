'use client';

import { useState } from 'react';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';

interface Question {
  id: number;
  questionText: string;
  options: string[];
  type: 'single' | 'multi';
  correctAnswers: string[];
}

interface MockExamData {
  sessionId: string;
  questions: Question[];
}

const mockExamData: MockExamData = {
  sessionId: '12345',
  questions: [
    {
      id: 1,
      questionText: 'What is the purpose of the Singleton design pattern?',
      options: [
        'To restrict instantiation of a class to one object',
        'To create a family of related objects without specifying their concrete classes',
        'To allow a class to change its behavior when its internal state changes',
        'To provide a way to create objects without exposing the creation logic to the client',
      ],
      type: 'single',
      correctAnswers: ['To restrict instantiation of a class to one object'],
    },
    {
      id: 2,
      questionText: 'In which scenario would you use a Mutex over a Semaphore?',
      options: [
        'When you need to allow multiple threads to access a resource',
        'When you want to enforce mutual exclusion on a shared resource',
        'When managing thread pools',
        'When implementing message queues',
      ],
      type: 'single',
      correctAnswers: ['When you want to enforce mutual exclusion on a shared resource'],
    },
    {
      id: 3,
      questionText: 'Which of the following best describes the concept of immutability?',
      options: [
        'An object whose state can be modified after it is created',
        'An object whose state cannot be modified after it is created',
        'An object that can change its type at runtime',
        'An object that does not retain its state between instances',
      ],
      type: 'single',
      correctAnswers: ['An object whose state cannot be modified after it is created'],
    },
    {
      id: 4,
      questionText: 'What is the main difference between a stack and a queue?',
      options: [
        'A stack uses FIFO, while a queue uses LIFO',
        'A stack uses LIFO, while a queue uses FIFO',
        'Both data structures are the same',
        'A stack can only hold primitive data types',
      ],
      type: 'single',
      correctAnswers: ['A stack uses LIFO, while a queue uses FIFO'],
    },
    {
      id: 5,
      questionText: 'What does the CAP theorem state about distributed systems?',
      options: [
        'You can have consistency, availability, or partition tolerance, but not all three at the same time',
        'You can achieve consistency and availability but must sacrifice partition tolerance',
        'You can have partition tolerance and availability, but not consistency',
        'Consistency is the most important property in distributed systems',
      ],
      type: 'single',
      correctAnswers: ['You can have consistency, availability, or partition tolerance, but not all three at the same time'],
    },
    {
      id: 6,
      questionText: 'In software architecture, what is microservices?',
      options: [
        'A large monolithic application structure',
        'A design pattern that emphasizes small, independent services that communicate over a network',
        'A way to manage user sessions in web applications',
        'An architecture style that uses APIs exclusively',
      ],
      type: 'single',
      correctAnswers: ['A design pattern that emphasizes small, independent services that communicate over a network'],
    },
    {
      id: 7,
      questionText: 'Which of the following is NOT a characteristic of Agile methodologies?',
      options: [
        'Emphasis on collaboration between self-organizing teams',
        'Rigid adherence to planning and documentation',
        'Incremental delivery of working software',
        'Flexibility to adapt to changing requirements',
      ],
      type: 'single',
      correctAnswers: ['Rigid adherence to planning and documentation'],
    },
    {
      id: 8,
      questionText: 'What is the Big O notation for the worst-case time complexity of a binary search algorithm?',
      options: [
        'O(n)',
        'O(log n)',
        'O(n log n)',
        'O(1)',
      ],
      type: 'single',
      correctAnswers: ['O(log n)'],
    },
    {
      id: 9,
      questionText: 'Which of the following describes the Observer design pattern?',
      options: [
        'An object maintains a list of its dependents and notifies them automatically of any state changes',
        'An object allows others to be notified when it is being created',
        'An object is created to match the state of another object',
        'An object acts as a placeholder for another object to control access to it',
      ],
      type: 'single',
      correctAnswers: ['An object maintains a list of its dependents and notifies them automatically of any state changes'],
    },
    {
      id: 10,
      questionText: 'Which of the following technologies is primarily used for container orchestration?',
      options: [
        'Kubernetes',
        'Docker',
        'Jenkins',
        'Ansible',
      ],
      type: 'single',
      correctAnswers: ['Kubernetes'],
    },
  ],
};


const ExamPage: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);
  const [results, setResults] = useState<Record<number, { userAnswer: string | string[]; correct: boolean }>>({});

  const currentQuestion = mockExamData.questions[currentQuestionIndex];

  const handleAnswerChange = (questionId: number, selectedAnswer: string) => {
    setAnswers({
      ...answers,
      [questionId]: selectedAnswer,
    });
  };

  const handleMultiSelectChange = (questionId: number, selectedOption: string) => {
    const previousSelections = answers[questionId] as string[] || [];
    if (previousSelections.includes(selectedOption)) {
      setAnswers({
        ...answers,
        [questionId]: previousSelections.filter((option) => option !== selectedOption),
      });
    } else {
      setAnswers({
        ...answers,
        [questionId]: [...previousSelections, selectedOption],
      });
    }
  };

  const handleSubmit = () => {
    const newResults: Record<number, { userAnswer: string | string[]; correct: boolean }> = {};

    mockExamData.questions.forEach((question) => {
      const userAnswer = answers[question.id] || [];
      const correctAnswer = question.correctAnswers;

      const isCorrect =
        question.type === 'single'
          ? correctAnswer[0] === userAnswer
          : Array.isArray(userAnswer) &&
          userAnswer.length === correctAnswer.length &&
          userAnswer.every((ans) => correctAnswer.includes(ans));

      newResults[question.id] = {
        userAnswer,
        correct: isCorrect,
      };
    });

    setResults(newResults);
    setExamSubmitted(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < mockExamData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-3xl p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-4">Exam</h1>

        {examSubmitted ? (
          <div>
            <h2 className="text-lg text-center">Results</h2>
            <div className="mt-4">
              {mockExamData.questions.map((question) => {
                const userAnswer = answers[question.id];
                const correctAnswer = question.correctAnswers;
                const isCorrect = results[question.id]?.correct;

                return (
                  <div key={question.id} className="mb-4">
                    <h3 className="font-semibold">{question.questionText}</h3>
                    <p className={`mt-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {isCorrect ? 'Correct!' : 'Wrong!'}
                    </p>
                    <p className="mt-2">
                      Your answer: {Array.isArray(userAnswer) ? userAnswer.join(', ') : userAnswer || 'None'}
                    </p>
                    {isCorrect ? null : (
                      <p className="mt-2 text-green-600">
                        Correct answer: {correctAnswer.join(', ')}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between mb-4">
              <p className="text-lg font-semibold">Time left:</p>
              <CountdownCircleTimer
                isPlaying={true}
                duration={10}
                onComplete={handleSubmit}
                colors="#FFBB00"
                size={60}
                strokeWidth={6}
              >
                {({ remainingTime }) => <div className="text-dark">{remainingTime}s</div>}
              </CountdownCircleTimer>
            </div>

            <div className="mb-4">
              <h2 className="text-xl font-semibold">
                Question {currentQuestionIndex + 1} of {mockExamData.questions.length}
              </h2>
              <p className="mt-2 text-lg">{currentQuestion.questionText}</p>

              <div className="mt-4 space-y-2">
                {currentQuestion.type === 'single' ? (
                  currentQuestion.options.map((option) => (
                    <label
                      key={option}
                      className="flex items-center p-2 bg-gray-200 rounded-md hover:bg-gray-300 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={option}
                        checked={answers[currentQuestion.id] === option}
                        onChange={() => handleAnswerChange(currentQuestion.id, option)}
                        className="mr-2"
                      />
                      {option}
                    </label>
                  ))
                ) : (
                  currentQuestion.options.map((option) => (
                    <label
                      key={option}
                      className="flex items-center p-2 bg-gray-200 rounded-md hover:bg-gray-300 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        name={`question-${currentQuestion.id}`}
                        value={option}
                        checked={answers[currentQuestion.id]?.includes(option) as boolean}
                        onChange={() => handleMultiSelectChange(currentQuestion.id, option)}
                        className="mr-2"
                      />
                      {option}
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Previous
              </button>

              <button
                onClick={handleNext}
                disabled={currentQuestionIndex === mockExamData.questions.length - 1}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Next
              </button>

              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Submit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExamPage;
