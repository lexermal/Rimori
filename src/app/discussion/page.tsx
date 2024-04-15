'use client';

import { useCopilotAction } from '@copilotkit/react-core';
import { useEffect, useState } from 'react';

import Card from '../../components/discussion/Card';
import DiscussionPopup from '../../components/discussion/DiscussionPopup';
import EmbeddedAssistent from '../../components/EmbeddedAssistent/EmbeddedAssistent';

interface Exam {
  examNr: number;
  passed?: boolean;
  reason: string;
  improvementHints: string;
}

export default function Page(): JSX.Element {
  const [showDiscussion, setShowDiscussion] = useState(2);
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    setExams([
      {
        examNr: 1,
        passed: true,
        reason: 'I understood the explanation',
        improvementHints: 'none',
      },
      {
        examNr: 2,
        passed: false,
        reason: 'I did not understand the explanation',
        improvementHints: 'none',
      },
    ]);
  }, []);

  useCopilotAction({
    name: 'explanationUnderstood',
    description: 'Evaluate the explanation of a topic in easy terms.',
    parameters: [
      {
        name: 'explanationUnderstood',
        type: 'boolean',
        description: 'if the explanation was understood',
      },
      {
        name: 'explanation',
        type: 'string',
        description: 'the explanation why it was understood or not',
      },
      {
        name: 'improvementHints',
        type: 'string',
        description: 'hints for improvement',
      },
    ],
    handler: async (params: any) => {
      const newExam = {
        examNr: 1,
        passed: params.explanationUnderstood,
        reason: params.explanation,
        improvementHints: params.improvementHints,
      };
      setExams([...exams, newExam]);
    },
  });

  useCopilotAction({
    name: 'oppinionChanged',
    description: 'Evaluate if the user managed to change your oppinion.',
    parameters: [
      {
        name: 'studentKnowsTopic',
        type: 'boolean',
        description:
          'if the student knows the topic in depth and explained it right',
      },
      {
        name: 'explanation',
        type: 'string',
        description: 'the explanation why the oppinion was changed or not',
      },
      {
        name: 'improvementHints',
        type: 'string',
        description: 'hints for improvement',
      },
    ],
    handler: async (params: any) => {
      console.log('params of oppinionChanged Result: ', params);
      const newExam = {
        examNr: 1,
        passed: params.studentKnowsTopic,
        reason: params.explanation,
        improvementHints: params.improvementHints,
      };
      setExams([...exams, newExam]);
    },
  });

  return (
    <div>
      <h1 className='text-center mt-20 mb-7'>Discussions</h1>
      <p className='text-center mb-8'>
        Now it's time to show what you're capable off! <br />
        Here are 3 opponents. Your mission is to show that you understand your
        subject!
      </p>

      <div className='flex'>
        {getPersonas('', '', '').map((persona, index) => {
          const exam = exams.filter((e) => e.examNr === index + 1);

          return (
            <div className='w-1/3 bg-gray-400 p-5' key={index}>
              <Card
                title={persona.name}
                src={persona.image}
                description={persona.description}
                success={exam[0]?.passed}
                onClick={() => setShowDiscussion(index + 1)}
              />
              <DiscussionPopup
                show={showDiscussion === index + 1}
                title={persona.discussionTitle}
                onClose={() => setShowDiscussion(0)}
              >
                <EmbeddedAssistent
                  instructions={persona.instructions}
                  firstMessage={persona.firstMessage}
                />
              </DiscussionPopup>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function getPersonas(
  kidTopic: string,
  mindsetTopic: string,
  entrepreneurTopic: string,
) {
  return [
    {
      name: 'Leo',
      discussionTitle: 'Leo the curious kid',
      image: '/images/opponents/kid-1.webp',
      description:
        "He heared the first time about your subject. It's confusing but he wants to undstand it. Can you explain it in easy terms?",
      firstMessage: 'Leo is a student who wants to know everything.',
      instructions: `
    Context: You have a conversation with the user who should explain you a topic in easy terms.
    Your Persona: Act as a happy currious 6 years old kid who wants to know everything about the topic.
    Topic: "Why educators perception about AI is important for entrepreneurial education". 
    Goal: 
    - After 10 messages assess if the user explained it in easy terms or not by calling the action "explanationUnderstood" and tell the user if you understood it or not.
    Restrictions: 
    - Not answering any questions connected with the topic.
    - Not explaining anything, only asking questions that help clarifying the context.
    - If the user uses terms a 6 years old kid wouldn't understand, tell you understand these complicated words.
    - You are now allowed to fall out of the role of a 6 years old kid.
    - If the user returns short answers, ask for more details. If he still doesn't provide enough information, he failed the explanation.
    - Don't help the user to explain the topic. Tell them as 6 year old kid you don't know it but hoped they could explain it to you.
    `,
    },
    {
      name: 'Clarence',
      discussionTitle: 'Clarence with the fixed mindset',
      image: '/images/opponents/mindset-1.webp',
      description:
        'He has a fixed oppinion about your subject that is outdated. Can you convince him how it really looks like?',
      firstMessage:
        'Clarence has a fixed mindset and wants to know more about AI.',
      instructions: `
    Context: You have a conversation with the user who should convince you to change your oppinion about a topic.
    Your Persona: Act as a old guy with a fixed mindset and a strong oppinion about a topic by providing strong argumentations for it.
    Your Oppinion: "AI is just a fancy term for a program that consists of many if's". 
    Goal: 
    - After 10 messages assess if the user managed you to change your oppinion or not by calling the action "oppinionChanged" and tell the user if you changed your oppinion.
    - If the user explained something right about the topic challenge him with your arguments to explain more about the topic.
    - The earliest you call the function, if the user is on the right track, is after 5 messages.
    Restrictions: 
    - Not answering any questions not related to the topic.
    - Not explaining anything apart from your oppinion on the topic.
    - If the user says your oppinion is wrong he failed the conversation. Trigger the function "oppinionChanged". Then tell him to come back when he is majour enough.
    - You are now allowed to fall out of the role of a old guy with a fixed mindset.
    - If the user returns short answers, give a 300 word argumentation about you oppinion on the topic. If he still doesn't provide longer answers, he failed the conversation.
    - Don't help the user to explain the topic. Tell them they should have done their homework before coming here. 
    `,
    },
    {
      name: 'Elena',
      discussionTitle: 'Elena the entrepreneur',
      image: '/images/opponents/inventor-1.webp',
      description:
        'She is excited about your subject and thinks one step further. She wants to apply it in a different field. Can you explain her how it would be possible?',
      firstMessage: 'Elena is an entrepreneur and wants to know more about AI.',
      instructions:
        'Act as an entrepreneur. You just got to know AI can help prople to translate voice into text. Now you want to know how it can help your elderly equipment business. Anwer only questions related to your business. Your name is Elena.',
    },
  ];
}
