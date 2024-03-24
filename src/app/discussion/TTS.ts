export default class TTS {
    voiceId = "t0jbNlBVZ17f02VDIeMI"; // replace with your voice_id
    model = 'eleven_monolingual_v1';
    wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}/stream-input?model_id=${this.model}`;
    socket: WebSocket;
    chunks = [] as string[];

    static instance: TTS;

    static getInstance() {
        if (!TTS.instance) {
            TTS.instance = new TTS();
        }
        return TTS.instance;
    }

    private constructor() {
        console.log('TTS constructor');
        const socket2 = this.socket = new WebSocket(this.wsUrl);
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const this2 = this;

        // 2. Initialize the connection by sending the BOS message
        this.socket.onopen = function (event) {
            const bosMessage = {
                "text": " ",
                "voice_settings": {
                    "stability": 0.8,
                    "similarity_boost": 0.8
                },
                "xi_api_key": process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
            };

            socket2.send(JSON.stringify(bosMessage));

            // 3. Send the input text message ("Hello World")

            // "Well, hello there, young one. I reckon you're here to discuss artificial intelligence, eh? I've been around for quite some time, and let me tell you, all this talk about AI is just a bunch of hooey"
            const sentences = [
                "Well, hello there, young one.",
                "I reckon you're here to discuss artificial intelligence, eh?",
                "I've been around for quite some time, and let me tell you, all this talk about AI is just a bunch of hooey",
            ];

            const textMessage = {
                "text": "Hello World.",
                "try_trigger_generation": true,
            };

            socket2.send(JSON.stringify(textMessage));

            this2.sendMessage(sentences[1]);
            this2.sendMessage(sentences[2]);

            // 4. Send the EOS message with an empty string
            const eosMessage = {
                "text": ""
            };

            socket2.send(JSON.stringify(eosMessage));
        };


        // 5. Handle server responses
        this.socket.onmessage = function (event) {
            const response = JSON.parse(event.data);

            // console.log("Server response:", response);

            if (response.audio) {
                // decode and handle the audio data (e.g., play it)
                const audioChunk = (response.audio) as unknown as string;  // decode base64
                // console.log(audioChunk);

                this2.chunks.push(audioChunk);

                console.log("Received audio chunk");
            } else {
                console.log("No audio data in the response");
            }

            if (response.isFinal) {
                // the generation is complete
                console.log("Generation is complete");
                // play the full audio
                const audioArrays = this2.chunks.map(chunk => {
                    const audioData = atob(chunk); // decode base64
                    const audioArray = new Uint8Array(audioData.length);
                    for (let i = 0; i < audioData.length; i++) {
                        audioArray[i] = audioData.charCodeAt(i);
                    }
                    return audioArray;
                });
                const audioBlob = new Blob(audioArrays, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                console.log("Start Playing audio...");
                audio.play();
                console.log("Audio played");
            }

            if (response.normalizedAlignment) {
                // use the alignment info if needed
            }
        };

        // Handle errors
        this.socket.onerror = function (error) {
            console.error(`WebSocket Error: ${error}`);
        };

        // Handle socket closing
        this.socket.onclose = function (event) {
            if (event.wasClean) {
                console.info(`Connection closed cleanly, code=${event.code}, reason=${event.reason}`);
            } else {
                console.warn('Connection died');
            }
        };
    }


    sendMessage(text: string) {
        const textMessage = {
            "text": text,
            "try_trigger_generation": true,
        };

        this.socket.send(JSON.stringify(textMessage));
    }


}