import Transcriber from "./transcriber.js";

const initializeWebSocket = (io) => {
  io.on("connection", async (socket) => {
    console.log(`connection made (${socket.id})`);

    const transcriber = new Transcriber();

    transcriber.on("transcriber-ready", () => {
      socket.emit("transcriber-ready", "Transcriber is ready");
    });

    transcriber.on("final", (transcript) => {
      socket.emit("final", transcript);
    });

    transcriber.on("partial", (transcript) => {
      socket.emit("partial", transcript);
    });

    transcriber.on("error", (error) => {
      socket.emit("error", error);
    });

    socket.on("incoming-audio", async (data) => {
      if (!transcriber.deepgramSocket) {
        await transcriber.startTranscriptionStream(data.sampleRate);
        transcriber.send(data.audioData);
      } else {
        transcriber.send(data.audioData);
      }
    });

    // socket.on("disconnect", () => {
    //   transcriber.endTranscriptionStream();
    //   console.log(`connection closed (${socket.id})`);
    // });
  });

  return io;
};

export default initializeWebSocket;
