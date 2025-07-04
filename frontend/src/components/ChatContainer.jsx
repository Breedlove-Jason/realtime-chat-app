import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../store/useChatStore.js';
import MessageInput from './MessageInput.jsx';
import ChatHeader from './ChatHeader.jsx';
import MessageSkeleton from './skeletons/MessageSkeleton.jsx';
import { useAuthStore } from '../store/useAuthStore.js';
import { formatMessageOTime } from '../lib/utils.js';

/**
 * ChatContainer Component
 * 
 * Displays the main chat interface including:
 * - Chat header with user info
 * - Message history between users
 * - Message input for sending new messages
 * - Handles real-time message updates via Socket.io
 */

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    areMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  /**
   * Effect for loading messages and setting up real-time updates
   * 
   * 1. Fetches message history when a user is selected
   * 2. Subscribes to real-time message updates via Socket.io
   * 3. Cleans up by unsubscribing when component unmounts or user changes
   */
  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => {
      unsubscribeFromMessages();
    };
  }, [
    selectedUser._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  /**
   * Effect for auto-scrolling to the latest message
   * 
   * Smoothly scrolls to the bottom of the chat whenever new messages arrive
   */
  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (areMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatHeader />
        <div className="flex-1 overflow-y-auto" style={{ height: 'calc(100vh - 180px)' }}>
          <MessageSkeleton />
        </div>
        <MessageInput />
      </div>
    );
  }
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Chat header showing the current conversation partner */}
      <ChatHeader />

      {/* Message list container with scrolling */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse space-y-reverse space-y-2" style={{ height: 'calc(100vh - 180px)' }}>
        {/* Empty div at the beginning for auto-scrolling (will be at the bottom visually) */}
        <div ref={messageEndRef} />

        {/* Map through and render each message, newest at the bottom for both sender and receiver */}
        {[...messages].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((message) => {
          // Determine if this message was sent by the current user
          const isOwnMessage = message.senderId === authUser._id;

          return (
            <div
              key={message._id}
              // Apply different styling based on whether message is sent or received
              className={`chat ${isOwnMessage ? 'chat-end' : 'chat-start'}`}
              style={{
                alignSelf: isOwnMessage ? 'flex-end' : 'flex-start',
                marginTop: '4px',
                marginBottom: '4px',
                justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
              }}
            >
              {/* User avatar */}
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      isOwnMessage
                        ? authUser.profilePic || '/avatar.png'
                        : selectedUser.profilePic || '/avatar.png'
                    }
                    alt="profile pic"
                  />
                </div>
              </div>

              {/* Message timestamp */}
              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageOTime(message.createdAt)}
                </time>
              </div>

              {/* Message content - can contain image, text, or both */}
              <div className="chat-bubble flex flex-col">
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
                {message.text && <p>{message.text}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Message input component for sending new messages */}
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
