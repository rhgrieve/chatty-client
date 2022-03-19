import MarkdownIt from 'markdown-it';
import emoji from 'markdown-it-emoji';
import { MessageData, User } from './helpers';

const md = new MarkdownIt();
md.use(emoji);

const chatWindow = document.getElementById('chatWindow');
const connectionMessage = document.getElementById('connectionMessage');
const textInputEl = <HTMLInputElement> document.getElementById('textInput');
const submitBtn = document.getElementById('submitButton');

function createUser(username: string) {
  return new User(username);
}

function appendMessage(messageData: MessageData) {
  const scrollPos = chatWindow.clientHeight + chatWindow.scrollTop;
  const isSCrolledToBottom = scrollPos === chatWindow.scrollHeight;

  const markdownText = `_${messageData.datetime}_ **${messageData.username}**: ${messageData.message}`;
  const div = document.createElement('div');
  div.innerHTML = md.render(markdownText);
  chatWindow.appendChild(div);
  if (isSCrolledToBottom) {
    chatWindow.scrollTop = chatWindow.scrollHeight - chatWindow.clientHeight;
  }
}

function systemMessage(message: string) {
  appendMessage({
    message,
    username: 'system',
    datetime: new Date().toLocaleTimeString(),
    color: '#AAA',
  });
}

function initConnection(user: User) {
  const socket = new WebSocket(process.env.SERVER_URL);

  socket.onopen = () => {
    console.log('connection opened');
    user.connect(socket);
    systemMessage('now connected');
  };

  socket.onclose = () => {
    console.log('connection closed');
    systemMessage('disconnected');
  };

  socket.onmessage = (e) => {
    console.log(e.data);
    const s = JSON.parse(e.data);
    appendMessage(s);
  };

  submitBtn.onclick = () => {
    if (textInputEl.value !== '') {
      user.send(textInputEl.value);
      textInputEl.value = '';
    }
  };

  document.onkeydown = (e) => {
    if (e.key === 'Enter' && document.activeElement.id === textInputEl.id) {
      user.send(textInputEl.value);
      textInputEl.value = '';
    }
  };
}

connectionMessage.onclick = (ev: MouseEvent) => {
  const userNameInput = connectionMessage.querySelector('#usernameInput');
  const username = (<HTMLInputElement> userNameInput).value;
  if ((<HTMLElement> ev.target).id === 'connectBtn' && username !== '') {
    connectionMessage.remove();
    const user = createUser(username);
    initConnection(user);
    chatWindow.classList.remove('bg-gray-400');
  }
};

chatWindow.append(connectionMessage);
