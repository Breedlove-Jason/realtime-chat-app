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
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }
  return (
    <div className="flex-1 flex flex-col overflow-auto">
      {/* Chat header showing the current conversation partner */}
      <ChatHeader />

      {/* Message list container with scrolling */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        {/* Map through and render each message */}
        {messages.map((message) => {
          // Determine if this message was sent by the current user
          const isOwnMessage = message.senderId === authUser._id;

          return (
            <div
              key={message._id}
              // Apply different styling based on whether message is sent or received
              className={`chat ${isOwnMessage ? 'chat-end' : 'chat-start'}`}
              style={{
                // Position messages from current user on the right, others on the left
                alignSelf: isOwnMessage ? 'flex-end' : 'flex-start',
                marginTop: isOwnMessage ? 'auto' : '4px',
                marginBottom: isOwnMessage ? '4px' : 'auto',
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

        {/* Empty div at the end for auto-scrolling */}
        <div ref={messageEndRef} />
      </div>

      {/* Message input component for sending new messages */}
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
