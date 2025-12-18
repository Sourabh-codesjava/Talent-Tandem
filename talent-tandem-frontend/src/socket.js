import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const socket = new Client({
  webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
  reconnectDelay: 5000,
  debug: () => {}
});

socket.activate();
export default socket;
