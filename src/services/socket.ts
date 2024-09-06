import { Server } from "socket.io";
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const pub = new Redis({
  host: process.env.REDIS_HOST!,
  port: Number(process.env.REDIS_PORT!),
  username: process.env.REDIS_USERNAME!,
  password: process.env.REDIS_PASSWORD!,
});
const sub = new Redis({
  host: process.env.REDIS_HOST!,
  port: Number(process.env.REDIS_PORT!),
  username: process.env.REDIS_USERNAME!,
  password: process.env.REDIS_PASSWORD!,
});

class SocketService {
  private _io: Server;

  constructor() {
    console.log("Socket service initialized");
    this._io = new Server({
      cors: {
        origin: "*",
        allowedHeaders: ["*"],
      },
    });
    sub.subscribe("MESSAGES");
  }

  public initListeners() {
    const io = this.io;
    console.log("Initializing listeners");

    io.on("connection", (socket) => {
      console.log("New connection", socket.id);

      socket.on("event:message", async (data) => {
        console.log(data);
        console.log("Message received");
        //publish to redis, so that other services can consume, in case we scale
        await pub.publish("MESSAGES", JSON.stringify(data));
      });
    });

    sub.on("message", (channel, message) => {
      if (channel === "MESSAGES") {
        console.log("Message received from redis");
        io.emit("message", JSON.parse(message));
      }
    });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;
