import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { getToken } from "../utils/auth";

let stompClient = null;

const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

export const connectSocket = (onMessage, onNewStudent) => {

  const token = getToken();

  const socket = new SockJS(`${BASE_URL}/ws?token=${token}`);

  stompClient = new Client({

    webSocketFactory: () => socket,

    reconnectDelay: 5000,

    onConnect: () => {

      stompClient.subscribe("/user/queue/messages", (msg) => {
        onMessage(JSON.parse(msg.body));
      });

      stompClient.subscribe("/topic/new-student", (msg) => {
        onNewStudent(msg.body);
      });

    }

  });

  stompClient.activate();
};

export const sendMessage = (message) => {

  if (!stompClient) return;

  stompClient.publish({
    destination: "/app/chat.send",
    body: JSON.stringify(message)
  });

};