import { v4 as uuidv4 } from 'uuid';

export interface MessageData {
  message: string;
  username: string;
  datetime: string;
  color: string;
  statusMessage?: string;
  isSystem?: boolean;
}

export class User {
  uuid: string;

  username: string;

  connection: WebSocket;

  constructor(username: string) {
    this.username = username;
    this.uuid = uuidv4();
  }

  connect(socket: WebSocket) {
    this.connection = socket;
    this.send('', 'connect');
  }

  disconnect() {
    this.send('', 'disconnect');
    this.connection.close();
  }

  send(message: string, statusMessage?: string) {
    this.connection.send(JSON.stringify({
      id: this.uuid,
      username: this.username,
      datetime: new Date().toLocaleTimeString(),
      statusMessage,
      message,
    }));
  }
}
