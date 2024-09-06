import http from "http";
import dotenv from "dotenv";
import SocketService from "./services/socket";

dotenv.config();

async function init() {
  const socketService = new SocketService();

  const httpServer = http.createServer();
  const PORT = process.env.PORT || 8000;

  socketService.io.attach(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  socketService.initListeners();
}

init();
