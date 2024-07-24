import EventEmitter from "events";
import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";

class Transcriber extends EventEmitter {
  constructor() {
    super();
    this.deepgram = createClient(process.env.DEEPGRAM_API_KEY);
    this.deepgramSocket = null;
    this.inactivityTimeout = 3000;
    this.inactivityTimer = null;
  }

  async startTranscriptionStream(config) {
    if (!this.deepgramSocket) {
      try {
        const dgConnection = this.deepgram.listen.live({
          model: "nova-2",
          punctuate: true,
          language: "en",
          interim_results: true,
          diarize: false,
          smart_format: true,
          endpointing: 1,
          encoding: "linear16",
          sample_rate: config,
        });

        // Event listener for when the Deepgram connection is opened
        dgConnection.on(LiveTranscriptionEvents.Open, () => {
          this.emit("transcriber-ready");
          this.startInactivityTimer();
        });

        // Event listener for receiving transcription data
        dgConnection.on(LiveTranscriptionEvents.Transcript, (data) => {
          this.resetInactivityTimer();

          const is_final = data.is_final;
          const transcript = data.channel.alternatives[0].transcript;

          if (is_final) {
            this.emit("final", transcript);
          } else {
            this.emit("partial", transcript);
          }
        });

        // Event listener for when the Deepgram connection is closed
        dgConnection.on(LiveTranscriptionEvents.Close, () => {
          this.emit("close", "Deepgram connection is closed");
          this.deepgramSocket = null;
        });

        this.deepgramSocket = dgConnection;
      } catch (error) {
        this.emit("error", error);
      }
    }
  }

  // Method to send audio data to Deepgram
  send(payload) {
    this.deepgramSocket.send(payload);
  }

  // Method to start inactivity timer
  startInactivityTimer() {
    this.inactivityTimer = setTimeout(async () => {
      await this.endTranscriptionStream();
    }, this.inactivityTimeout);
  }

  // Method to reset inactivity timer
  resetInactivityTimer() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.startInactivityTimer();
    }
  }

  // Method to end the transcription stream
  async endTranscriptionStream() {
    try {
      await this.deepgramSocket.conn.close();
      this.deepgramSocket = null;
    } catch (error) {
      this.emit("error", error);
    }
  }
}

export default Transcriber;
