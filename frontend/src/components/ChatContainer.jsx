import React, { useEffect } from 'react'
import {useChatStore} from "../store/useChatStore.js";
import MessageInput from "./MessageInput.jsx";
import ChatHeader from "./ChatHeader.jsx";
import MessageSkeleton from './skeletons/MessageSkeleton.jsx';

const ChatContainer = () => {
    const {messages, getMessages, areMessagesLoading, selectedUser} = useChatStore()
useEffect(() => {
    getMessages(selectedUser._id)
}, [selectedUser._id, getMessages])

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
            <ChatHeader />
            <p>messages...</p>
            <MessageInput />
        </div>
    )
}

export default ChatContainer
