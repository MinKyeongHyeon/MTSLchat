export interface Message {
  id: string;
  text: string;
  sender: 'me' | 'partner';
  timestamp: Date;
}

export interface User {
  id: string;
  nickname: string;
}

export interface ChatRoom {
  id: string;
  user1: User;
  user2: User;
  messages: Message[];
}

export type AppState = 'nickname' | 'waiting' | 'chatting';
