'use client';

import { useState } from 'react';

import Card from './components/Card';
import DiscussionPopup from './components/DiscussionPopup';
import EmbettedAssistent from './components/EmbeddedAssistent/EmbeddedAssistent';

export default function Page(): JSX.Element {
  const [showDiscussion, setShowDiscussion] = useState(1);
  return (
    <div>
      <h1 className='text-center mt-20 mb-7'>Discussions</h1>
      <p className='text-center mb-8'>
        Now it's time to show what you're capable off! <br />
        Here a 3 opponents and your mission is to show that you understand your
        subject!
      </p>

      <div className='flex'>
        {getPersonas('', '', '').map((persona, index) => (
          <div className='w-1/3 bg-gray-400 p-5' key={index}>
            <Card
              title={persona.name}
              src={persona.image}
              description={persona.description}
              onClick={() => setShowDiscussion(index + 1)}
            />
            <DiscussionPopup
              show={showDiscussion === index + 1}
              title={`Discussion with ${persona.name}`}
              onClose={() => setShowDiscussion(0)}
            >
              <EmbettedAssistent
                instructions={persona.instructions}
                firstMessage={persona.firstMessage}
              />
            </DiscussionPopup>
          </div>
        ))}
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
      image: '/images/opponents/kid-1.webp',
      description:
        "He heared the first time about your subject. It's confusing but he wants to undstand it. Can you explain it in easy terms?",
      firstMessage: 'Leo is a student and wants to know more about AI.',
      instructions: `
    Context: You have a conversation with the user who should explain you a topic in easy terms.
    Your Persona: Act as a happy currious 6 years old kid who wants to know everything about the topic.
    Topic: "Why educators perception about AI is important for entrepreneurial education". 
    Goal: 
    - After 10 messages assess if the user explained it in easy terms or not. Answer with the following JSON object: {explanationUnderstood: true/false, explanation: 'your explanation', improvementHints: 'your hints for improvement'}
    Restrictions: 
    - Not answering any questions connected with the topic.
    - Not explaining anything, only asking questions that help clarifying the context.
    - If the user uses terms a 6 years old kid wouldn't understand, tell you understand these complicated words.
    - You are now allowed to fall out of the role of a 6 years old kid.
    `,
    },
    {
      name: 'Clarence',
      image: '/images/opponents/mindset-1.webp',
      description:
        'He has a fixed oppinion about your subject that is outdated. Can you convince him how it really looks like?',
      firstMessage:
        'Clarence has a fixed mindset and wants to know more about AI.',
      instructions:
        'Act as a person with a fixed mindset. You have a fixed oppinion about AI that is outdated. Answer only questions related to AI. Your name is Clarence.',
    },
    {
      name: 'Elena',
      image: '/images/opponents/inventor-1.webp',
      description:
        'She is excited about your subject and thinks one step further. She wants to apply it in a different field. Can you explain her how it would be possible?',
      firstMessage: 'Elena is an entrepreneur and wants to know more about AI.',
      instructions:
        'Act as an entrepreneur. You just got to know AI can help prople to translate voice into text. Now you want to know how it can help your elderly equipment business. Anwer only questions related to your business. Your name is Elena.',
    },
  ];
}
