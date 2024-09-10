import React, { useEffect, useRef } from 'react';

interface CircleAudioAvatarProps {
    imageUrl: string;
}

const CircleAudioAvatar: React.FC<CircleAudioAvatarProps> = ({ imageUrl }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        checkMicrophonePermission();
    }, [imageUrl]);

    // Function to check microphone permission
    const checkMicrophonePermission = async () => {
        try {
            const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
            console.log('Microphone permission status:', permissionStatus.state);

            if (permissionStatus.state === 'granted') {
                requestMicrophoneAccess();
            } else if (permissionStatus.state === 'prompt') {
                console.log('Requesting microphone access...');
                requestMicrophoneAccess();
            } else {
                console.error('Microphone access denied');
            }

            permissionStatus.onchange = () => {
                console.log('Microphone permission status changed:', permissionStatus.state);
                if (permissionStatus.state === 'granted') {
                    requestMicrophoneAccess();
                }
            };
        } catch (error) {
            console.error('Error checking microphone permission:', error);
        }
    };

    // Function to request microphone access
    const requestMicrophoneAccess = () => {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            console.log('Microphone access granted:', stream);
            setupAudioContext(stream);
        }).catch(error => {
            console.error('Error accessing microphone:', error);
        });
    };

    // Function to set up the audio context
    const setupAudioContext = (stream: MediaStream) => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const image = new Image();
                image.src = imageUrl;

                // Audio context setup
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                console.log('AudioContext created:', audioContext);

                const source = audioContext.createMediaStreamSource(stream);
                console.log('MediaStreamAudioSourceNode created:', source);
                const analyser = audioContext.createAnalyser();
                console.log('AnalyserNode created:', analyser);
                analyser.fftSize = 256;
                analyser.smoothingTimeConstant = 0.8; // Add smoothing to reduce noise
                source.connect(analyser);
                console.log('Source connected to analyser');

                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                console.log('Buffer length:', bufferLength);
                console.log('Data array initialized:', dataArray);

                draw(ctx, canvas, image, analyser, bufferLength, dataArray);
            }
        }
    };

    // Function to draw on the canvas
    const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, image: HTMLImageElement, analyser: AnalyserNode, bufferLength: number, dataArray: Uint8Array) => {
        const drawFrame = () => {
            requestAnimationFrame(drawFrame);
            analyser.getByteFrequencyData(dataArray);

            // Calculate loudness
            const loudness = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
            console.log('Loudness:', Math.round(loudness));

            if (canvas && ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Draw pulsing circle
                const radius = Math.min(canvas.width, canvas.height) / 3;
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const pulseRadius = radius + loudness / 2; // Adjust the divisor for sensitivity
                ctx.beginPath();
                ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2, true);
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.lineWidth = 5;
                ctx.stroke();

                // Draw image circle
                ctx.save();
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(image, centerX - radius, centerY - radius, radius * 2, radius * 2);
                ctx.restore();

                // Draw circular frame around the image
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
                ctx.strokeStyle = 'rgba(20,20, 20, 0.9)';
                ctx.lineWidth = 5; // Adjust the width of the frame as needed
                ctx.stroke();
            }
        };

        drawFrame();
    };

    return <canvas ref={canvasRef} className="border border-black" width={300} height={300} style={{ width: '150px', height: '150px' }} />;
};

export default CircleAudioAvatar;