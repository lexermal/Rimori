import React, { useState } from 'react';
import { BiSolidRightArrow } from "react-icons/bi";
import VoiceRecorder from '@/components/ai-sidebar/VoiceRecoder';

interface AudioInputFieldProps {
    onSubmit: (text: string) => void;
}

const AudioInputField: React.FC<AudioInputFieldProps> = ({ onSubmit }) => {
    const [text, setText] = useState('');

    const handleSubmit = (manualText?: string) => {
        const sendableText = manualText || text;
        if (sendableText.trim()) {
            onSubmit(text);
            setText('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.ctrlKey && e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <div className="flex items-center bg-gray-300 pt-2 pb-2 p-2">
            <VoiceRecorder onVoiceRecorded={(m: string) => {
                console.log('onVoiceRecorded', m);
                handleSubmit(m);
            }}
            />
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 border-none rounded-lg p-2"
                placeholder='Type a message...'
            />
            <button onClick={() => handleSubmit()} className="cursor-default">
                <BiSolidRightArrow className='w-10 h-10 cursor-pointer' />
            </button>
        </div>
    );
};

export default AudioInputField;