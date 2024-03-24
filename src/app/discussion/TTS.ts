export enum VoiceId {
    OLD_MAN = "t0jbNlBVZ17f02VDIeMI",
    // Add more voice IDs here...
}

export default class TTS {
    private socket: WebSocket;
    private chunks: string[] = [];

    private constructor(socket: WebSocket) {
        this.socket = socket;
    }

    static createAsync(voiceId: VoiceId, model = 'eleven_monolingual_v1'): Promise<TTS> {
        return new Promise((resolve, reject) => {
            const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${model}`;
            const socket = new WebSocket(wsUrl);

            socket.onopen = () => {
                const bosMessage = {
                    "text": " ",
                    "voice_settings": {
                        "stability": 0.8,
                        "similarity_boost": 0.8
                    },
                    "xi_api_key": process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
                };

                socket.send(JSON.stringify(bosMessage));

                const tts = new TTS(socket);
                socket.onmessage = tts.handleMessage.bind(tts);
                socket.onerror = tts.handleError.bind(tts);
                socket.onclose = tts.handleClose.bind(tts);

                resolve(tts);
            };

            socket.onerror = (error) => {
                reject(error);
            };
        });
    }

    endConversation() {
        const eosMessage = {
            "text": ""
        };

        this.socket.send(JSON.stringify(eosMessage));
    }

    sendMessage(text: string) {
        const textMessage = {
            "text": text,
            "try_trigger_generation": true,
        };

        this.socket.send(JSON.stringify(textMessage));
    }

    private handleMessage(event: MessageEvent) {
        const response = JSON.parse(event.data);

        if (response.audio) {
            const audioChunk = response.audio as string;
            this.chunks.push(audioChunk);
            console.log("Received audio chunk");
        } else {
            console.log("No audio data in the response");
        }

        if (response.isFinal) {
            const audioArrays = this.chunks.map(chunk => {
                const audioData = atob(chunk);
                const audioArray = new Uint8Array(audioData.length);
                for (let i = 0; i < audioData.length; i++) {
                    audioArray[i] = audioData.charCodeAt(i);
                }
                return audioArray;
            });

            const audioBlob = new Blob(audioArrays, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.playbackRate = 1.05;
            console.log("Start Playing audio...");
            audio.play();
            console.log("Audio played");

            // Clear the chunks after playing the audio
            this.chunks = [];
        }

        if (response.normalizedAlignment) {
            // use the alignment info if needed
        }
    }

    private handleError(error: Event) {
        console.error(`WebSocket Error: ${error}`);
    }

    private handleClose(event: CloseEvent) {
        if (event.wasClean) {
            console.info(`Connection closed cleanly, code=${event.code}, reason=${event.reason}`);
        } else {
            console.warn('Connection died');
        }
    }
}