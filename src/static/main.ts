import { v4 as uuidv4 } from "uuid";

interface MessageData {
  message: string;
  username: string;
  datetime: string;
  color: string;
}

class User {
  uuid: string;
  username: string;

  constructor(username: string) {
    this.username = username;
    this.uuid = uuidv4();
  }
}

let socket: WebSocket;

function createUser(username) {
  return new User(username);
}

function appendMessage(messageData: MessageData) {
  const p = document.createElement("p");
  p.innerText =
    `${messageData.datetime} ${messageData.username}: ${messageData.message}`;
  chatWindow.appendChild(p);
}

function initConnection(user: User) {
  const socket = new WebSocket(process.env.SERVER_URL);

  socket.onopen = function () {
    console.log("connection opened");
    appendMessage({
      message: "now connected",
      username: "system",
      datetime: new Date().toLocaleTimeString(),
      color: "#AAA",
    });
  };

  socket.onclose = function () {
    console.log("connection closed");
    appendMessage({
      message: "disconnected",
      username: "system",
      datetime: new Date().toLocaleTimeString(),
      color: "#AAA",
    });
  };

  socket.onmessage = function (e) {
    console.log(e.data);
    const s = JSON.parse(e.data);
    appendMessage(s);
  };

  document.onclick = function (e) {
    const textInputEl = <HTMLInputElement> document.getElementById("textInput");
    const target = (<HTMLElement> e.target);
    if (target.id === "submitButton" && textInputEl.value !== "") {
      socket.send(JSON.stringify({
        id: user.uuid,
        username: user.username,
        datetime: new Date().toLocaleTimeString(),
        message: textInputEl.value,
      }));
      textInputEl.value = "";
    }
  };
}

const chatWindow = document.getElementById("chatWindow");
const connectionMessage = document.getElementById("connectionMessage");

connectionMessage.onclick = function (ev: MouseEvent) {
  const userNameInput = connectionMessage.querySelector("#usernameInput");
  const username = (<HTMLInputElement> userNameInput).value;
  if ((<HTMLElement> ev.target).id === "connectBtn" && username !== "") {
    connectionMessage.remove();
    const user = createUser(username);
    initConnection(user);
    chatWindow.classList.remove("bg-gray-400");
  }
};

chatWindow.append(connectionMessage);
