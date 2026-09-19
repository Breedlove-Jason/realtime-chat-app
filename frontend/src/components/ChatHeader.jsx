import React from "react";
import { X } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore.js";
const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers, connectionStatus } = useAuthStore();

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/*Avatar*/}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={selectedUser.profilePic || "/avatar.svg"}
                alt={selectedUser.fullName}
              />
            </div>
          </div>
          {/*User info*/}
          <div>
            <h3 className="font-medium">{selectedUser?.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {connectionStatus !== "connected" ? "Reconnecting…" : onlineUsers.includes(selectedUser._id) ? "Online · Live chat" : "Offline · Messages saved"}
            </p>
          </div>
        </div>
        {/*Close button*/}
        <button aria-label="Close conversation" onClick={() => setSelectedUser(null)}>
          <X />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;

