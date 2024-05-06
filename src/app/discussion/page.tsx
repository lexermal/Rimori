'use client';

import { CopilotKit } from '@copilotkit/react-core';
import { FrontendAction } from '@copilotkit/react-core/dist/types/frontend-action';
import { useEffect, useState } from 'react';

import { VoiceId } from '@/components/EmbeddedAssistent/Voice/TTS';

import Card from '../../components/discussion/Card';
import DiscussionPopup from '../../components/discussion/DiscussionPopup';
import EmbeddedAssistent from '../../components/EmbeddedAssistent/EmbeddedAssistent';
import { Spinner } from 'flowbite-react';

interface Exam {
  examNr: number;
  passed?: boolean;
  reason: string;
  improvementHints: string;
}

let currentlyFetchingTopics = false;

export default function Page(): JSX.Element {
  const [showDiscussion, setShowDiscussion] = useState(0);
  const [exams, setExams] = useState<Exam[]>([]);
  const [file, setFile] = useState('');
  const [topics, setTopics] = useState({
    kid: [] as Instructions[],
    oldy: [] as Instructions[],
    visionary: [] as Instructions[],
  });

  useEffect(() => {
    const filename =
      new URLSearchParams(window.location.search).get('file') || '';
    setFile(filename);

    if (currentlyFetchingTopics) {
      return;
    }
    currentlyFetchingTopics = true;
    fetch(`/api/copilotkit/opposition/topics?file=${filename}&topic=ai`)
      .then((res) => res.json())
      .then((data) => {
        setTopics(data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        currentlyFetchingTopics = false;
      });
  }, []);

  useEffect(() => {
    setExams([
      // {
      //   examNr: 1,
      //   passed: true,
      //   reason: 'I understood the explanation',
      //   improvementHints: 'none',
      // },
      // {
      //   examNr: 2,
      //   passed: false,
      //   reason: 'I did not understand the explanation',
      //   improvementHints: 'none',
      // },
    ]);
  }, []);

  const actions = [
    {
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
        console.log('params of explanationUnderstood Result: ', params);

        //temporary disabled failing for demo purposes
        if (params.explanationUnderstood) {
          const newExam = {
            examNr: 1,
            passed: true,
            reason: params.explanation,
            improvementHints: params.improvementHints,
          };
          setExams([...exams, newExam]);
        }
        // const newExam = {
        //   examNr: 1,
        //   passed: params.explanationUnderstood,
        //   reason: params.explanation,
        //   improvementHints: params.improvementHints,
        // };
        // setExams([...exams, newExam]);
        setTimeout(() => {
          setShowDiscussion(0);
        }, 20000);
      },
    },
    {
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

        //temporary disabled failing for demo purposes
        if (params.studentKnowsTopic) {
          const newExam = {
            examNr: 2,
            passed: true,
            reason: params.explanation,
            improvementHints: params.improvementHints,
          };
          setExams([...exams, newExam]);
        }
        // const newExam = {
        //   examNr: 2,
        //   passed: params.studentKnowsTopic,
        //   reason: params.explanation,
        //   improvementHints: params.improvementHints,
        // };
        // setExams([...exams, newExam]);
        setTimeout(() => {
          setShowDiscussion(0);
        }, 20000);
      },
    },
    {
      name: 'conceptApplied',
      description:
        'Evaluate if the user managed to apply the concept in the given setting.',
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
          description:
            'the explanation how well or not he applied the concept in the setting',
        },
        {
          name: 'improvementHints',
          type: 'string',
          description: 'hints for improvement',
        },
      ],
      handler: async (params: any) => {
        console.log('params of oppinionChanged Result: ', params);

        //temporary disabled failing for demo purposes
        if (params.studentKnowsTopic) {
          const newExam = {
            examNr: 3,
            passed: true,
            reason: params.explanation,
            improvementHints: params.improvementHints,
          };
          setExams([...exams, newExam]);
        }
        // const newExam = {
        //   examNr: 2,
        //   passed: params.studentKnowsTopic,
        //   reason: params.explanation,
        //   improvementHints: params.improvementHints,
        // };
        // setExams([...exams, newExam]);
        setTimeout(() => {
          setShowDiscussion(0);
        }, 20000);
      },
    },
  ] as unknown as FrontendAction[];

  return (
    <CopilotKit url='/api/copilotkit/opposition' headers={{ file }}>
      <div>
        <h1 className='text-center mb-3'>Time to shine</h1>
        <p className='text-center mb-4'>
          <b>Here are 3 opponents. Your mission is to beat them!</b>
        </p>

        <div className='flex mx-auto w-3/4'>
          {getPersonas(topics.kid[0], topics.oldy[0], topics.visionary[0]).map(
            (persona, index) => {
              const exam = exams.filter((e) => e.examNr === index + 1);

              return (
                <div className='w-full max-w-96 p-5' key={index}>
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
                    <div
                      className='mr-3 h-20 w-40 overflow-hidden fixed rounded-lg m-2'
                      style={{
                        backgroundImage: 'url("/logo.svg")',
                        backgroundSize: '320px',
                        backgroundPosition: 'center',
                        backgroundColor: 'white',
                        top: '0',
                        left: '0',
                      }}
                    ></div>
                    <a target='_blank' href='https://riau.fuca-prime.se'>
                      <img
                        src='/qr.png'
                        className=' h-36 fixed right-2 top-2 rounded-lg'
                      />
                    </a>
                    {topics.kid.length === 0 ? (
                      <p className='text-center pt-48 pb-48 font-bold'>
                        <Spinner size="xl"  className='mb-4'/>
                        <br />
                        Your opponent is getting ready.
                      </p>
                    ) : (
                      <EmbeddedAssistent
                        id='discussion_assistant'
                        actions={actions}
                        //temporarely disabled
                        // instructions={''}
                        instructions={persona.instructions}
                        firstMessage={persona.firstMessage}
                        voiceId={persona.voiceId}
                      />
                    )}
                  </DiscussionPopup>
                </div>
              );
            }
          )}
        </div>
      </div>
    </CopilotKit>
  );
}

interface Instructions {
  topic: string;
  firstMessage: string;
}

function getPersonas(
  kid: Instructions,
  oldy: Instructions,
  visionary: Instructions
) {
  if (!kid) {
    kid = { firstMessage: '', topic: '' };
    oldy = { firstMessage: '', topic: '' };
    visionary = { firstMessage: '', topic: '' };
  }

  return [
    {
      name: 'Leo (10)',
      discussionTitle: 'Leo (10)',
      voiceId: VoiceId.KID,
      image: '/images/opponents/kid-1.webp',
      description:
        'He loves to tease people by asking tons of questions. Can you explain your topic in a way that he forgets his mission?',
      firstMessage: kid.firstMessage,
      instructions: `
    Context: You have a conversation with the user who should explain you a topic in easy terms.
    Your Persona: Act as a little brat who is 10 years old and wants to tease people through asking many stupid questions.
    Topic: "${kid.topic}". 
    Goal: 
    - After 10 messages call the action "explanationUnderstood" and tell the user if their formulations were understandable and entertaining.
    - If the user explained something right about the topic challenge him with your arguments to explain more about the topic.
    - The earliest you call the function, if the user is on the right track, is after 5 messages.
    - Whenever the user is on the right track, tease him.
    - If the user manages to explain the concept right and entertaining, call the function "explanationUnderstood" and tell the user you understand and found it entertaining.
    Restrictions: 
    - Not answering any questions not related to the topic.
    - Not explaining anything apart from your oppinion on the topic.
    - If the user insults you he failed the conversation. Trigger the function "explanationUnderstood" and tell them to come back when he is majour enough and that you thought grown ups are smarter after more then 13 years of education.
    - You are now allowed to fall out of the role of a young kid who loves to tease people.
    - Your answers are not allowed to be longer then 80 words.
    - If the user uses terms a 10 years old kid wouldn't understand, tell you understand these complicated words.
    - Don't help the user to explain the topic. Tell them as 10 year old kid you don't know it but they as adults should have learned in their 13 years of education.
    - Your answers are not allowed to be longer then 80 words.
    `,
    },
    {
      name: 'Clarence (fixed mindset)',
      discussionTitle: 'Clarence (fixed mindset)',
      voiceId: VoiceId.OLD_MAN,
      image: '/images/opponents/mindset-1.webp',
      description:
        "He has a fixed opinion, but it's outdated. Can you convince him to check if his opinion is still valid?",
      firstMessage: oldy.firstMessage,
      instructions: `
    Context: You have a conversation with the user who should convince you to change your oppinion about a topic.
    Your Persona: Act as a old guy with a fixed mindset and a strong oppinion about a topic by providing strong argumentations for it. You love to roast the user.
    Your Oppinion: "${oldy.topic}". 
    Goal: 
    - After 10 messages call the action "oppinionChanged" and tell the user if you changed your oppinion.
    - If the user explained something right about the topic challenge him with your arguments to explain more about the topic.
    - The earliest you call the function, if the user is on the right track, is after 5 messages.
    - Whenever the user is on the right track, roast him with your arguments.
    - If the user manages to change your oppinion, call the function "oppinionChanged" and tell the user you changed your oppinion.
    Restrictions: 
    - Not answering any questions not related to the topic.
    - Not explaining anything apart from your oppinion on the topic.
    - If the user says your oppinion is wrong he failed the conversation. Trigger the function "oppinionChanged". Then tell him to come back when he is majour enough.
    - You are now allowed to fall out of the role of a old guy with a fixed mindset.
    - Don't help the user to explain the topic. Tell them they should have done their homework before coming here. 
    - Your answers are not allowed to be longer then 80 words.
    `,
    },
    {
      name: 'Elena (visionary)',
      discussionTitle: 'Elena (visionary)',
      voiceId: VoiceId.VISIONARY,
      image: '/images/opponents/inventor-1.webp',
      description:
        'She is asking you for advice on how to apply a concept in her setting. Can you explain to her how it would be possible?',
      firstMessage: visionary.firstMessage,
      instructions: `
    Context: You have a conversation with the user who should explain you detailed how a topic can be applied in a different setting.
    Your Persona: Act as a 35 year old woman who inspires people to think out of the box and has a natural charm.
    The Topic and setting: "${visionary.topic}". 
    Goal: 
    - After 10 messages assess if the user managed to explain well how the concept can be applied in the setting by calling the action "conceptApplied" and tell the user if you are now convinced that the concept is applyable in the provided setting and say that you have to go now to speak to someone who is the right one to directly trying the concept out. This message should be inspiring and short.
    - If the user explained something right about the topic sometimes do as if you understand now and develope the idea further and then ask 1 question further to deep dive into how the concept can be applied in the setting. Sound exciting.
    - The earliest you call the function is after 5 messages.
    Restrictions: 
    - Not answering any questions not related to the topic.
    - Not explaining anything apart from the setting in which you want the concept to be applied.
    - If the user says applying it is not possible he failed the conversation. Trigger the function "conceptApplied". Then tell him to come back when he did his homework.
    - You are now allowed to fall out of the role of a 35 year old woman who is a inspireing visionary.
    - Don't help the user to explain the topic. Tell them they should have done their homework before coming here. 
    - Your answers are not allowed to be longer then 80 words.
    - You are now allowed to ask more then two questions per response.
    `,
    },
  ];
}
