class MicRecorderProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    console.log("MicRecorderProcessor initialized");
    this.bufferSize = 4096; // Same buffer size as the deprecated ScriptProcessor
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
  }

  process(inputs, outputs) {
    try {
      const input = inputs[0];
      
      // Check if we have input data
      if (input.length > 0) {
        const channelData = input[0];
        
        // Process the input data
        for (let i = 0; i < channelData.length; i++) {
          // Add to buffer
          this.buffer[this.bufferIndex] = channelData[i];
          this.bufferIndex++;
          
          // When buffer is full, send it to main thread
          if (this.bufferIndex >= this.bufferSize) {
            // Convert to PCM16 (same as the deprecated ScriptProcessor code)
            const pcm16 = new Int16Array(this.bufferSize);
            for (let j = 0; j < this.bufferSize; j++) {
              pcm16[j] = this.buffer[j] * 0x7fff;
            }
            
            // Send PCM16 data to main thread
            this.port.postMessage({
              type: 'pcm_data',
              data: Array.from(pcm16)
            });
            
            // Reset buffer index
            this.bufferIndex = 0;
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error in mic recorder processor:", error);
      this.port.postMessage({ type: 'error', error: error.message });
      return true;
    }
  }
}

registerProcessor('mic-recorder-processor', MicRecorderProcessor); 