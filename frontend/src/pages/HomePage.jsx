import React from 'react';
import Sidebar from '../components/Sidebar.jsx';
import {useChatStore} from "../store/useChatStore.js";
import NoChatSelected from '../components/NoChatSelected.jsx';
import ChatContainer from '../components/ChatContainer.jsx';

const HomePage = () => {
  const { selectedUser } = useChatStore();
  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-2 sm:px-4">
        <div className="bg-base-100 rounded-lg shadow-2xl border border-base-300 w-full max-w-6xl" style={{ height: 'calc(100dvh - 6rem)' }}>
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;

