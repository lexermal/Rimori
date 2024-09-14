import EmitterSingleton from "@/app/[locale]/(auth-guard)/discussion/components/Emitter";
import { SupabaseClient } from "@/utils/supabase/server";
import { Spinner } from "flowbite-react";
import React from "react";

interface Props {
  messages: any
  fileId: string
  question: string,
  possibilties: string[],
  onSubmit: (value: string, choice: string) => void,
}

async function fetchDataFromBackend(messages: any[], fileId: string) {
  const supabase = SupabaseClient.getClient();
  const { data } = await supabase.auth.getSession();

  return await fetch('/api/story-answer-validation', {
    method: 'POST',
    body: JSON.stringify({ messages, fileId }),
    headers: { 'Content-Type': 'application/json', 'Authorization': data.session!.access_token },
  })
    .then((response) => response.text())
    .then((response) => JSON.parse(response).result)
    .catch((error) => {
      console.error('Error at validating answer:', error);
    });
}

export default function AnswerComponent(props: Props) {
  const [selected, setSelected] = React.useState<string>();
  const [reason, setReason] = React.useState<string>();
  const [validate, setValidate] = React.useState<boolean>(false);

  if (validate) {
    return <div className="bg-gray-300 mx-auto max-w-3xl rounded-xl p-5">
      <Spinner aria-label="Default status example" size="lg" />
      <span className="ms-2">Validating your answer...</span>
    </div>
  }
  return <div className="bg-gray-300 mx-auto max-w-3xl rounded-xl p-5 text-left">
    <p className="font-bold text-xl">{props.question}</p>
    {props.possibilties.map((possibility, index) => {
      const isSelected = selected === possibility;
      return <div key={index}>
        <div className="flex items-center mb-2">
          <input id={"list-radio-" + index} type="radio" value="" name="list-radio" onClick={() => {
            setSelected(possibility);
          }}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
          <label htmlFor={"list-radio-" + index} className="w-full py-1 ms-2 text-md font-medium text-gray-900 dark:text-gray-300">{possibility}</label>
        </div>
      </div>
    }
    )}
    <textarea
      className="w-full p-2 border border-gray-300 rounded-lg"
      onChange={e => setReason(e.target.value)}
      placeholder="Explain the advantages and disadvantes of the options." /><br />
    <button
      disabled={!selected || !reason || reason.length === 0}
      className="mt-2 bg-blue-500 text-white font-bold py-2 px-4 rounded disabled:opacity-75"
      onClick={() => {
        setValidate(true);

        const assistentChoiceMessage = { role: "assistant", content: `Question: '${props.question}', answer possibilities: \n- ${props.possibilties.join("\n- ")}` };
        const userMessage = { role: "user", content: `Choice: '${selected}', reason: '${reason}'` };

        EmitterSingleton.emit('analytics-event', { category: 'Story answer', action: 'form-submit', name: JSON.stringify({ assistentChoiceMessage, userMessage }) });

        fetchDataFromBackend([...props.messages, assistentChoiceMessage, userMessage], props.fileId).then((data) => {
          console.log("data", data);
          props.onSubmit(data, selected!);
        });
      }}>Submit answer</button>
  </div>
}