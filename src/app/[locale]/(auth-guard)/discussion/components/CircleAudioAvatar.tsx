import React, { useEffect, useRef } from 'react';
import EmitterSingleton from './Emitter';

interface CircleAudioAvatarProps {
    imageUrl: string;
    className?: string;
}

const emitter = EmitterSingleton;

const CircleAudioAvatar: React.FC<CircleAudioAvatarProps> = ({ imageUrl, className }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        setupImageContext();
    }, [imageUrl]);


    // Function to set up the audio context
    const setupImageContext = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const image = new Image();
                image.src = imageUrl;

                emitter.on('loudness', (loudness: number) => {
                    // console.log('Loudness:', loudness);
                    draw(ctx, canvas, image, loudness);
                });
                draw(ctx, canvas, image, 0);
            }
        }
    };

    // Function to draw on the canvas
    const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, image: HTMLImageElement, loudness: number) => {
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw pulsing circle
            const radius = Math.min(canvas.width, canvas.height) / 3;
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const pulseRadius = radius + loudness / 2.5; // Adjust the divisor for sensitivity
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

    return <canvas ref={canvasRef} className={className} width={300} height={300} style={{ width: '150px', height: '150px' }} />;
};

export default CircleAudioAvatar;