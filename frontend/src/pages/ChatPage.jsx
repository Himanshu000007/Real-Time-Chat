import { useChatStore } from "../store/useChatStore";

import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";

function ChatPage() {
  const { activeTab, selectedUser } = useChatStore();

  return (
    <div className="relative w-full max-w-6xl md:h-[800px] h-[calc(100vh-2rem)] flex flex-col">
      <BorderAnimatedContainer>
        <div className="flex w-full h-full">
          {/* LEFT SIDE (Sidebar) */}
          <div
            className={`
              ${selectedUser ? "hidden md:flex" : "flex"} 
              w-full md:w-80 bg-slate-800/50 backdrop-blur-sm flex-col border-r border-slate-700/50
            `}
          >
            <ProfileHeader />
            <ActiveTabSwitch />

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {activeTab === "chats" ? <ChatsList /> : <ContactList />}
            </div>
          </div>

          {/* RIGHT SIDE (Chat Window) */}
          <div
            className={`
              ${!selectedUser ? "hidden md:flex" : "flex"} 
              flex-1 flex flex-col bg-slate-900/50 backdrop-blur-sm
            `}
          >
            {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
          </div>
        </div>
      </BorderAnimatedContainer>
    </div>
  );
}
export default ChatPage;
