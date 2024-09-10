import React, { useEffect } from 'react';
import CircleAudioAvatar from './CircleAudioAvatar';
import AudioInputField from './AudioInputField';
import { VoiceId } from '@/components/EmbeddedAssistent/Voice/TTS';
import { useChat } from 'ai/react';
import MessageSender from './MessageSender';

interface Props {
    instructions: string;
    firstMessage: string;
    // actions?: FrontendAction[];
    voiceId: VoiceId;
    oralCommunication: boolean;
    personImageUrl: string;
}

const sender = new MessageSender();

function Assistentv2({ oralCommunication, personImageUrl, instructions, firstMessage, voiceId }: Props) {
    sender.setVoiceId(voiceId);
    oralCommunication = true;

    const { messages, addToolResult, append, isLoading, setMessages } = useChat({
        maxToolRoundtrips: 5,
        api: "/api/opposition",

        // run client-side tools that are automatically executed:
        // async onToolCall({ toolCall }) {
        //   if (toolCall.toolName === 'storyEnded') {
        //     setStoryEnded(true);
        //     return true;
        //   }
        // },
    });

    const lastAssistantMessage = messages.filter((m) => m.role === 'assistant').pop()?.content;
    console.log("messages", messages);
    firstMessage = "Hello, I am the assistant. I am here to help you. How can I help you today?";

    useEffect(() => {
        setMessages([
            { id: '1', role: 'system', content: instructions },
            { id: '2', role: 'user', content: "Hi" },
            { id: '3', role: 'assistant', content: firstMessage }
        ]);

        sender.steamFullMessage(firstMessage);
    }, []);

    useEffect(() => {
        sender.streamOngoingMessage(isLoading, lastAssistantMessage);
    }, [messages, isLoading]);

    return (
        <div>
            {oralCommunication && <CircleAudioAvatar imageUrl={personImageUrl} className='mx-auto' />}
            {!oralCommunication && <div className="w-full">
                {lastAssistantMessage && <div className="text-sm text-gray-500">
                    {lastAssistantMessage}
                </div>}
            </div>}
            <AudioInputField onSubmit={m => append({ id: "4", role: 'user', content: m })} />
        </div>
    );
};

export default Assistentv2;
