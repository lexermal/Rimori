import React, { useState, useEffect } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const PomodoroCounter = (props:{onEnd:()=>void}) => {
    const [timeRemaining, setTimeRemaining] = useState(25);
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        if (timeRemaining > 0) {
            const timer = setTimeout(() => {
                setTimeRemaining(timeRemaining - 1);
                if (timeRemaining-1 === 0) {
                    props.onEnd();
                }
            }, 60000);
            return () => clearTimeout(timer);
        }
    }, [timeRemaining]);

    return (
        <div className='flex flex-col items-center relative'>
            <div 
                onMouseEnter={() => setShowButton(true)}
                onMouseLeave={() => setShowButton(false)}
                className='relative'
            >
                <CircularProgressbar
                    value={timeRemaining}
                    maxValue={25}
                    text={`${timeRemaining}min`}
                    background={true}
                    styles={buildStyles({
                        rotation: 0,
                        strokeLinecap: 'butt',
                        textSize: '16px',
                        pathTransitionDuration: 0.5,
                        pathColor: `rgba(62, 152, 199, ${timeRemaining / 25})`,
                        textColor: '#f88',
                        trailColor: '#d6d6d6',
                        backgroundColor: 'white',

                    })}
                />
                {showButton && (
                    <button 
                        className='bg-blue-500 text-white p-2 m-2 text-sm rounded absolute top-7 left-6'
                        onClick={props.onEnd}
                    >
                        Stop
                    </button>
                )}
            </div>
        </div>
    );
};

export default PomodoroCounter;