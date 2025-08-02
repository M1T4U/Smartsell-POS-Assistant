
export enum MessageAuthor {
  USER = 'user',
  AI = 'ai',
}

export interface ChatMessage {
  id: string;
  author: MessageAuthor;
  content: string;
}
