export default class ChunkedAudioPlayer {
    private audioContext: AudioContext;
    private chunkQueue: ArrayBufferLike[] = [];
    private combinedChunks: AudioBuffer[] = [];
    private chunkSplit: number[] = [];
    private currentChunkIndex = 0;
    private isPlaying = false;

    constructor() {
        this.audioContext = new AudioContext();
    }

    async addChunk(chunk: ArrayBufferLike, chunkSplit: number[]): Promise<void> {
        this.chunkQueue.push(chunk);
        this.chunkSplit = chunkSplit;

        if (this.chunkQueue.length >= this.chunkSplit[this.currentChunkIndex]) {
            const combinedBuffer = await this.combineChunks();
            this.combinedChunks.push(combinedBuffer);
            this.currentChunkIndex++;
            if (!this.isPlaying) {
                this.playChunks();
            }
        }
    }

    private async combineChunks(): Promise<AudioBuffer> {
        const chunksToCombine = this.chunkQueue.splice(0, this.chunkSplit[this.currentChunkIndex]);
        const combinedBuffer = this.concatenateArrayBuffers(chunksToCombine);
        const audioBuffer = await this.audioContext.decodeAudioData(combinedBuffer.slice(0));
        return audioBuffer;
    }

    private playChunks(): void {
        if (this.combinedChunks.length > 0 && !this.isPlaying) {
            console.log('Playing chunk ' + this.combinedChunks.length);
            this.isPlaying = true;
            // setTimeout(() => {
                this.playChunk(this.combinedChunks.shift()!).then(() => {
                    this.isPlaying = false;
                    this.playChunks();
                });
            // }, 500); // Delay of 100ms
        }
    }

    private playChunk(chunk: AudioBuffer): Promise<void> {
        return new Promise((resolve) => {
            const source = this.audioContext.createBufferSource();
            source.buffer = chunk;
            source.connect(this.audioContext.destination);
            source.start(0);

            source.onended = () => {
                resolve();
            };
        });
    }

    private concatenateArrayBuffers(buffers: ArrayBufferLike[]): ArrayBuffer {
        let totalLength = 0;
        for (const buffer of buffers) {
            totalLength += buffer.byteLength;
        }

        const concatenatedBuffer = new ArrayBuffer(totalLength);
        const dataView = new DataView(concatenatedBuffer);
        let offset = 0;
        for (const buffer of buffers) {
            for (let i = 0; i < buffer.byteLength; i++) {
                dataView.setUint8(offset + i, new Uint8Array(buffer)[i]);
            }
            offset += buffer.byteLength;
        }

        return concatenatedBuffer;
    }

    async endConversation(): Promise<void> {
        console.log('Conversation ended');
        if (this.chunkQueue.length > 0) {
            const combinedBuffer = await this.combineChunks();
            this.combinedChunks.push(combinedBuffer);
            if (!this.isPlaying) {
                this.playChunks();
            }
        }
    }
}