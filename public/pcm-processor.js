class PCMProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.buffer = new Float32Array();
        console.log("PCMProcessor initialized");

        // Handle messages in AudioWorklet
        this.port.onmessage = (e) => {
            try {
                console.log("Received message in worklet");
                const newData = e.data;
                console.log(`New data length: ${newData.length}`);
                
                const newBuffer = new Float32Array(this.buffer.length + newData.length);
                newBuffer.set(this.buffer);
                newBuffer.set(newData, this.buffer.length);
                this.buffer = newBuffer;
                
                console.log(`Total buffer length: ${this.buffer.length}`);
                
                // Send confirmation back to main thread
                this.port.postMessage({ type: 'buffer_updated', length: this.buffer.length });
            } catch (error) {
                console.error("Error in worklet message handler:", error);
                this.port.postMessage({ type: 'error', error: error.message });
            }
        };
    }

    process(inputs, outputs, parameters) {
        try {
            const output = outputs[0];
            const channelData = output[0];

            if (this.buffer.length >= channelData.length) {
                // Copy data from buffer to output
                channelData.set(this.buffer.slice(0, channelData.length));
                // Remove processed data from buffer
                this.buffer = this.buffer.slice(channelData.length);
                return true;
            }

            // If we don't have enough data, fill with silence
            channelData.fill(0);
            return true;
        } catch (error) {
            console.error("Error in worklet process:", error);
            this.port.postMessage({ type: 'error', error: error.message });
            return true;
        }
    }
}

registerProcessor('pcm-processor', PCMProcessor); 