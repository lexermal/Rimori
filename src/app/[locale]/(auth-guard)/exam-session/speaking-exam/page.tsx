"use client";
import React, { useState, useEffect, useRef } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { OpenAI } from "openai";
import VoiceRecorder from "@/components/ai-sidebar/VoiceRecoder";

const Role = {
  Student: 0,
  Student1: 1,
  Student2: 2,
};

interface Round {
  topic: string;
  responses: {
    [key: number]: string;
  };
  evaluation?: string;
}

const topics = ["React Basics", "State Management", "React Lifecycle"];

const ExamSimulator = () => {
  const [rounds, setRounds] = useState<Round[]>(
    topics.map((topic) => ({
      topic,
      responses: {
        [Role.Student]: "",
        [Role.Student1]: "",
        [Role.Student2]: "",
      },
      evaluation: "",
    }))
  );

  const [currentRound, setCurrentRound] = useState(0);
  const [currentRole, setCurrentRole] = useState<number | null>(null);
  const [studentInput, setStudentInput] = useState("");
  const [isInputEnabled, setIsInputEnabled] = useState(false);
  const [isTimerPlaying, setIsTimerPlaying] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [Student1Response, setStudent1Response] = useState("");
  const [Student2Response, setStudent2Response] = useState("");
  const [isStudent1Thinking, setIsStudent1Thinking] = useState(false);
  const [isStudent2Thinking, setIsStudent2Thinking] = useState(false);

  const handleTimerComplete = () => {
    switch (currentRole) {
      case Role.Student:
        // stopRecording(); //improve this, the recording must stop after timer is
        break;
      case Role.Student1:
        setIsStudent1Thinking(false);
        handleStudent1Response(); //send request for last student
        break;
      case Role.Student2:
        setIsStudent2Thinking(false);
        setIsTimerPlaying(false);
        setCurrentRole(null);
        break;
      default:
        break;
    }
    return { shouldRepeat: false };
  };

  const handleStudentSubmit = async (transcript: string) => {
    const updatedRounds = [...rounds];
    updatedRounds[currentRound].responses[Role.Student] = transcript;
    setRounds(updatedRounds);
    setStudentInput("");
    setIsInputEnabled(false);
    setCurrentRole(Role.Student1);
    setIsStudent1Thinking(true);
    setTimerKey((prevKey) => prevKey + 1);

    const prompt = `This is a simulation of an exam in Sweden about the topic: ${rounds[currentRound].topic}. The teacher is asking you to continue speaking what you know about topic. The student responded with: "${updatedRounds[currentRound].responses[Role.Student]}". Please continue by elaborating on what the student might have missed. Act as a student. And provide a human response.`;
    await fetchAIResponse(Role.Student1, prompt, 150);
  };

  const handleStudent1Response = async () => {
    setCurrentRole(Role.Student2);
    setIsStudent2Thinking(true);
    setTimerKey((prevKey) => prevKey + 1);

    const prompt = `The teacher is asking you to continue speaking what you know about topic ${rounds[currentRound].topic}. The last student responded: "${rounds[currentRound].responses[Role.Student]}", and another student added: "${Student1Response}". Please further elaborate on this topic with additional details.  Act as a student. And provide a human response. Show them what you know!`;
    await fetchAIResponse(Role.Student2, prompt, 100);
  };

  const fetchAIResponse = async (role: number, prompt: string, maxTokens: number) => {
    const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, dangerouslyAllowBrowser: true });

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "system", content: prompt }],
        max_tokens: maxTokens,
      });

      const aiResponse = response.choices[0]?.message.content || "No response from student.";

      if (role === Role.Student1) {
        setStudent1Response(aiResponse);
        simulateTyping(aiResponse, Role.Student1);
      } else if (role === Role.Student2) {
        setStudent2Response(aiResponse);
        simulateTyping(aiResponse, Role.Student2);
      }
    } catch (error) {
      const updatedRounds = [...rounds];
      updatedRounds[currentRound].responses[role] = "Error getting student response.";
      setRounds(updatedRounds);
    }
  };

  const simulateTyping = (fullResponse: string, role: number) => {
    let index = 0;
    const typingInterval = 50;
    const typingTimeout = setInterval(() => {
      if (index < fullResponse.length) {
        setRounds((prevRounds) => {
          const updatedRounds = [...prevRounds];
          updatedRounds[currentRound].responses[role] = fullResponse.substring(0, index + 1);
          return updatedRounds;
        });
        index++;
      } else {
        clearInterval(typingTimeout);
      }
    }, typingInterval);
  };

  const startExam = () => {
    setCurrentRole(Role.Student);
    setIsInputEnabled(true);
    setIsTimerPlaying(true);
    setTimerKey((prevKey) => prevKey + 1);
  };

  const handleNextTopic = () => {
    if (currentRound < topics.length - 1) {
      setCurrentRound((prevRound) => prevRound + 1);
      setCurrentRole(Role.Student);
      setIsInputEnabled(true);
      setIsTimerPlaying(true);
      setTimerKey((prevKey) => prevKey + 1);
    } else {
      setCurrentRole(null);
      setIsInputEnabled(false);
      evaluateResponses();
    }
  };

  const evaluateResponses = async () => {
    const updatedRounds = [...rounds];
    for (let i = 0; i < updatedRounds.length; i++) {
      const studentResponse = updatedRounds[i].responses[Role.Student];
      const evaluationPrompt = `Evaluate the following student's response on a scale of 1 to 10 for topic ${updatedRounds[i].topic}: "${studentResponse}". Provide a brief explanation for the score.`;

      try {
        const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, dangerouslyAllowBrowser: true });
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "system", content: evaluationPrompt }],
          max_tokens: 100,
        });

        const evaluation = response.choices[0]?.message.content || "Evaluation could not be generated.";
        updatedRounds[i].evaluation = evaluation;
      } catch (error) {
        updatedRounds[i].evaluation = "Error fetching evaluation.";
      }
    }
    setRounds(updatedRounds);
  };

  const isCurrentTopicComplete = () => {
    return (
      rounds[currentRound].responses[Role.Student] &&
      rounds[currentRound].responses[Role.Student1] &&
      rounds[currentRound].responses[Role.Student2]
    );
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen">
      <div className="w-full text-dark py-4 px-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Oral Exam Simulation</h1>
        <div className="flex space-x-4 items-center">
          <CountdownCircleTimer
            key={timerKey}
            isPlaying={isTimerPlaying}
            duration={10}
            onComplete={handleTimerComplete}
            colors="#FFBB00"
            size={60}
            strokeWidth={6}
          >
            {({ remainingTime }) => <div className="text-dark">{remainingTime}s</div>}
          </CountdownCircleTimer>
          {currentRole === null && !isCurrentTopicComplete() && (
            <button onClick={startExam} className="bg-green-500 hover:bg-green-600 text-dark font-semibold px-4 py-2 rounded-lg">
              Start
            </button>
          )}
          {currentRole === null && isCurrentTopicComplete() && (
            <button onClick={handleNextTopic} className="bg-green-500 hover:bg-green-600 text-dark font-semibold px-4 py-2 rounded-lg">
              {currentRound < topics.length - 1 ? "Next Topic" : "Submit and Get Results"}
            </button>
          )}
        </div>
      </div>

      <div className="flex w-full max-w-6xl mx-auto p-8 space-x-6">
        <div className="flex-1 space-y-6">
          {currentRound < topics.length && (
            <>
              <h2 className="text-xl font-semibold">
                {currentRole === null ? "Press Start to reveal the topic" : `Topic: ${rounds[currentRound].topic}`}
              </h2>
              {currentRole === Role.Student && (
                <div className="flex flex-row">
                  <div className="mr-2">
                    <VoiceRecorder isDisabled={!isInputEnabled || !isTimerPlaying} onVoiceRecorded={(transcript: string) => handleStudentSubmit(transcript)} />
                  </div>
                  <div className="font-semibold">Recording will start when you press the button</div>
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold">Student Answer:</h3>
                <p className="border p-4 rounded-lg bg-white">{rounds[currentRound].responses[Role.Student] || "No response yet."}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Student1 Response:</h3>
                <p className="border p-4 rounded-lg bg-white">{rounds[currentRound].responses[Role.Student1] || (isStudent1Thinking ? "AI is thinking..." : "No response yet.")}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Student2 Response:</h3>
                <p className="border p-4 rounded-lg bg-white">{rounds[currentRound].responses[Role.Student2] || (isStudent2Thinking ? "AI is thinking..." : "No response yet.")}</p>
              </div>
            </>
          )}
          {currentRound >= topics.length && (
            <div>
              <h2 className="text-2xl font-semibold">Exam Completed</h2>
              {rounds.map((round, index) => (
                <div key={index} className="mb-4">
                  <h3 className="text-lg font-semibold">Round {index + 1}: {round.topic}</h3>
                  <p><strong>Student:</strong> {round.responses[Role.Student]}</p>
                  <p><strong>Student1:</strong> {round.responses[Role.Student1]}</p>
                  <p><strong>Student2:</strong> {round.responses[Role.Student2]}</p>
                  <p><strong>Evaluation:</strong> {round.evaluation || "No evaluation yet."}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="w-64 border-l border-gray-300 pl-4">
          <h3 className="text-lg font-semibold mb-4">Evaluation</h3>
          <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-160px)]">
            {currentRound < topics.length && (
              <div>
                <h4 className="font-semibold">Current Topic Evaluation:</h4>
                <p className="border p-4 rounded-lg bg-white">{rounds[currentRound].evaluation || "No evaluation yet."}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamSimulator;
