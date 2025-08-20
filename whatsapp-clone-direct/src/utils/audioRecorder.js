// Audio recorder utility for voice messages

export class AudioRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
    this.audioBlob = null;
    this.audioUrl = null;
    this.startTime = null;
    this.onDataAvailable = null;
    this.onStop = null;
  }
  
  async init() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      
      this.mediaRecorder.addEventListener('dataavailable', (event) => {
        this.audioChunks.push(event.data);
        if (this.onDataAvailable) {
          this.onDataAvailable(event.data);
        }
      });
      
      this.mediaRecorder.addEventListener('stop', () => {
        this.audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.audioUrl = URL.createObjectURL(this.audioBlob);
        
        if (this.onStop) {
          this.onStop({
            blob: this.audioBlob,
            url: this.audioUrl,
            duration: this.getDuration()
          });
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error initializing audio recorder:', error);
      return false;
    }
  }
  
  start() {
    if (!this.mediaRecorder) {
      return false;
    }
    
    this.audioChunks = [];
    this.startTime = Date.now();
    this.mediaRecorder.start(100); // Collect data every 100ms
    return true;
  }
  
  stop() {
    if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
      return false;
    }
    
    this.mediaRecorder.stop();
    this.stopStream();
    return true;
  }
  
  pause() {
    if (!this.mediaRecorder || this.mediaRecorder.state !== 'recording') {
      return false;
    }
    
    this.mediaRecorder.pause();
    return true;
  }
  
  resume() {
    if (!this.mediaRecorder || this.mediaRecorder.state !== 'paused') {
      return false;
    }
    
    this.mediaRecorder.resume();
    return true;
  }
  
  stopStream() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }
  
  getDuration() {
    if (!this.startTime) {
      return 0;
    }
    
    return Math.floor((Date.now() - this.startTime) / 1000);
  }
  
  getAudioUrl() {
    return this.audioUrl;
  }
  
  getAudioBlob() {
    return this.audioBlob;
  }
  
  // Clean up resources
  dispose() {
    this.stopStream();
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
    this.audioBlob = null;
    this.audioUrl = null;
    this.startTime = null;
  }
}

// Format seconds to mm:ss format
export const formatAudioTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Generate waveform data from audio
export const generateWaveformData = async (audioBlob, numPoints = 40) => {
  return new Promise((resolve) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const fileReader = new FileReader();
    
    fileReader.onload = async (event) => {
      try {
        const audioData = await audioContext.decodeAudioData(event.target.result);
        const channelData = audioData.getChannelData(0);
        const blockSize = Math.floor(channelData.length / numPoints);
        const waveformData = [];
        
        for (let i = 0; i < numPoints; i++) {
          const blockStart = blockSize * i;
          let sum = 0;
          
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(channelData[blockStart + j]);
          }
          
          // Normalize between 0.1 and 1 to avoid tiny bars
          const average = Math.max(0.1, Math.min(1, sum / blockSize * 2));
          waveformData.push(average);
        }
        
        resolve(waveformData);
      } catch (error) {
        console.error('Error generating waveform data:', error);
        // Return default waveform if there's an error
        resolve(Array(numPoints).fill(0.5));
      }
    };
    
    fileReader.onerror = () => {
      console.error('Error reading audio file');
      resolve(Array(numPoints).fill(0.5));
    };
    
    fileReader.readAsArrayBuffer(audioBlob);
  });
};

