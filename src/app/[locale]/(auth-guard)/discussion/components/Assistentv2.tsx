import React, { useEffect } from 'react';
import CircleAudioAvatar from './CircleAudioAvatar';
import AudioInputField from './AudioInputField';
import { VoiceId } from '@/components/EmbeddedAssistent/Voice/TTS';
import { useChat } from 'ai/react';
import MessageSender from './MessageSender';
import EmitterSingleton from './Emitter';
import { useEnv } from '@/providers/EnvProvider';
import { useUser } from '@supabase/auth-helpers-react';

const emitter = EmitterSingleton;

interface Props {
    instructions: string;
    firstMessage: string;
    voiceId: VoiceId;
    personImageUrl: string;
    onComplete: (result: any) => void;
}

const sender = new MessageSender();

function Assistentv2({ personImageUrl, instructions, firstMessage, voiceId, onComplete }: Props) {
    sender.setVoiceId(voiceId);
    sender.setElevenLabsApiKey(useEnv().ELEVENLABS_API_KEY);
    const [oralCommunication, setOralCommunication] = React.useState(true);
    const user = useUser();

    const { messages, append, isLoading, setMessages } = useChat({
        maxToolRoundtrips: 5,
        api: "/api/opposition",
    });

    const lastAssistantMessage = [...messages].filter((m) => m.role === 'assistant').pop()?.content;
    console.log("messages", messages);

    useEffect(() => {
        setMessages([
            { id: '1', role: 'system', content: instructions },
            { id: '2', role: 'user', content: "Hi" },
            { id: '3', role: 'assistant', content: firstMessage }
        ]);

        sender.steamFullMessage(firstMessage);
    }, []);

    useEffect(() => {
        let message = lastAssistantMessage;
        if (message != messages[messages.length - 1]?.content) {
            message = undefined;
        }
        sender.streamOngoingMessage(isLoading, message);
    }, [messages, isLoading]);

    const lastMessage = messages[messages.length - 1];

    useEffect(() => {
        const toolInvocations = lastMessage?.toolInvocations;
        if (toolInvocations) {
            onComplete(toolInvocations[0].args);
        }
    }, [lastMessage]);

    if (lastMessage?.toolInvocations) {
        const args = lastMessage.toolInvocations[0].args;

        const success = args.explanationUnderstood === "TRUE" || args.studentKnowsTopic === "TRUE";

        return <div className="px-5 pt-5 overflow-y-auto text-center" style={{ height: "478px" }}>
            <h1 className='text-center mt-5 mb-5'>
                {success ? "Great job!" : "You failed"}
            </h1>
            <p>{args.improvementHints}</p>
        </div>
    }

    return (
        <div>
            {oralCommunication ?
                <CircleAudioAvatar imageUrl={personImageUrl} className='mx-auto my-16' /> :
                <div className="w-full">
                    {lastAssistantMessage && <div className="text-gray-700 px-5 pt-5 overflow-y-auto " style={{ height: "478px" }}>
                        {lastAssistantMessage}
                    </div>}
                </div>}
            <AudioInputField
                onSubmit={message => {
                     append({ role: 'user', content: message });
                     EmitterSingleton.emit("analytics-event", {
                        category: "opposition",
                        action: "send-message: " + message,
                        user: user?.id
                    });
                }}
                onAudioControl={voice => {
                    setOralCommunication(voice);
                    sender.setVoiceEnabled(voice);
                    emitter.emit('enableAudio', voice);
                    EmitterSingleton.emit("analytics-event", {
                        category: "opposition",
                        action: "turn-audio-on: " + voice,
                        user: user?.id
                    });
                }} />
        </div>
    );
};

export default Assistentv2;
