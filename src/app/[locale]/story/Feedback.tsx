import { useRouter } from "next/navigation";

export interface StoryFeedback {
  understanding: number;
  coherence: number;
  vocabulary: number;
  deepUnderstanding: number;
  generalFeedback: string;
  suggestions: string;
  grade: string;
  isAnswerCorrect: boolean;
  chosenOption: string;
}

export default function Feedback(props: { feedback: StoryFeedback, onContinue: () => void }) {
  console.log("feedback", props.feedback);
  const { coherence, deepUnderstanding, generalFeedback, suggestions, understanding, vocabulary } = props.feedback;
  const router = useRouter();

  let grade = props.feedback.grade;
  let isAnswerCorrect = props.feedback.isAnswerCorrect;

  if (["A", "B", "C"].indexOf(grade) === -1) {
    grade = "F";
    isAnswerCorrect = false;
  }

  //todo: remove this
  // grade = "A";
  // isAnswerCorrect = true;

  return (
    <div className={'p-5 mt-3 bg-gray-200 dark:bg-gray-800 rounded-lg shadow-md text-left ' + (isAnswerCorrect ? 'border-3 border-green-500' : 'border border-red-500')}>
      <div className='flex items-center mb-5'>
        <p className='font-medium text-xl text-gray-900 dark:text-white'>
          Grade: {isAnswerCorrect ? grade + "✅" : "F (failed) ❌"}
        </p>
      </div>
      <div className='gap-8 sm:grid sm:grid-cols-2'>
        <div>
          <Score score={vocabulary} title='Vocabulary' />
          <Score score={deepUnderstanding} title='Deep Understanding' />
        </div>
        <div>
          <Score score={coherence} title='Coherence' />
          <Score score={understanding} title='Understanding of the case' />
        </div>
      </div>
      <div className='flex items-center mb-5'>
        <p className='text-md font-medium text-gray-800 dark:text-gray-400'>
          {generalFeedback}
        </p>
      </div>
      <div className='flex items-center mb-5'>
        <p className='text-md font-medium text-gray-800 dark:text-gray-400'>
          <b>Suggestion:</b> {suggestions}
        </p>
      </div>
      <div className='flex items-center'>
        {isAnswerCorrect && <button onClick={_ => props.onContinue()} className='ms-auto text-md bg-green-200 border-2 font-bold border-gray-900 p-3 rounded-lg  hover:underline dark:text-blue-500'>
          Next chapter
        </button>}

        {!isAnswerCorrect && <button onClick={_ => router.push("/")} className='ms-auto text-sm font-medium text-blue-600 hover:underline dark:text-blue-500'>
          Try again later
        </button>}
      </div>
    </div>
  );
}


function Score(props: { score: number, title: string, showScore?: boolean }) {
  return <dl className="mb-5">
    <dt className='text-sm font-medium text-gray-700 dark:text-gray-400'>
      {props.title}
    </dt>
    <dd className='flex items-center'>
      <div className='w-full bg-gray-300 rounded h-2.5 dark:bg-gray-700 me-2'>
        <div
          className='bg-blue-600 h-2.5 rounded dark:bg-blue-500'
          style={{ width: `${props.score * 10}%` }}
        ></div>
      </div>
      <span className='text-sm font-medium text-gray-500 dark:text-gray-400 min-h-6'>
        {props.showScore ? props.score : " "}
      </span>
    </dd>
  </dl>
}