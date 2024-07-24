const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const initializeWebSocket = require("./websocket.js");

require("dotenv").config();

const { PORT = 8080 } = process.env;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

initializeWebSocket(io);

server.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
