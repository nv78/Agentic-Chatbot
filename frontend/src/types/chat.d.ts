// Types for chat API responses based on backend schema

/** Chat object */
export type Chat = {
  id: number;
  chat_uuid: string;
  name: string;
  created_at: string;
  updated_at: string;
};

/** File object attached to messages */
export type ChatFile = {
  uuid: string;
  name: string;
  size: number;
  url: string;
  type: string;
};

/** Message object with attached files */
export type ChatMessage = {
  id: number;
  content: string;
  role: "user" | "assistant" | "system";
  created_at: string;
  files: ChatFile[];
};

/** Shared chat response */
export type SharedChatResponse = {
  chat: Chat;
  messages: ChatMessage[];
  is_shared: boolean;
};

/** Get chat response */
export type GetChatResponse = {
  chat: Chat;
  messages: ChatMessage[];
};

/** Get user chats response */
export type GetUserChatsResponse = {
  chats: Chat[];
};

/** Create chat response */
export type CreateChatResponse = {
  chat_uuid: string;
  name: string;
  message: string;
};

/** Add message response */
export type AddMessageResponse = {
  message_uuid: string;
  content: string;
  role: "user" | "assistant" | "system";
};

/** Update chat response */
export type UpdateChatResponse = {
  message: string;
  name: string;
};

/** Delete chat response */
export type DeleteChatResponse = {
  message: string;
};

/** Share link status */
export type ShareLinkStatus = {
  share_uuid: string | null;
  is_active: boolean;
  created_at?: string;
  view_count?: number;
};


/** Delete share link response */
export type DeleteShareLinkResponse = {
  message: string;
};

/** Update share link response */
export type CreateShareLinkResponse = {
  share_uuid: string;
  is_active: boolean;
  message: string;
};
