import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../store/useChatStore.js';
import MessageInput from './MessageInput.jsx';
import ChatHeader from './ChatHeader.jsx';
import { useAuthStore } from '../store/useAuthStore.js';
export default function ChatContainer() {
 const { messages, getMessages, selectedUser, areMessagesLoading, hasOlder, loadOlder, loadingOlder, typingUntil } = useChatStore();
 const { authUser } = useAuthStore();
 const [search, setSearch] = useState('');
 const [now, setNow] = useState(Date.now());
 const end = useRef(null);
 const last = messages.at(-1)?._id;
 useEffect(() => { getMessages(selectedUser._id); }, [selectedUser._id, getMessages]);
 useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [last]);
 useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
 const filtered = messages.filter(m => !search || m.text?.toLowerCase().includes(search.toLowerCase()));
 return <section className="flex-1 min-w-0 flex flex-col overflow-hidden" aria-label={`Conversation with ${selectedUser.fullName}`}>
  <ChatHeader />
  <div className="px-4 py-2 border-b border-base-300"><input aria-label="Search loaded messages" className="input input-sm input-bordered w-full" placeholder="Search loaded messages…" value={search} onChange={e => setSearch(e.target.value)} /></div>
  <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-label="Messages" aria-live="polite">
   {hasOlder && <button className="btn btn-sm btn-ghost mx-auto block" onClick={loadOlder} disabled={loadingOlder}>{loadingOlder ? 'Loading…' : 'Load earlier messages'}</button>}
   {areMessagesLoading && <p role="status" className="text-center opacity-60">Loading conversation…</p>}
   {!areMessagesLoading && !filtered.length && <div className="py-16 text-center"><h2 className="text-xl font-semibold">{search ? 'No matching messages' : 'Start something good.'}</h2><p className="mt-2 opacity-60">{search ? 'Try another word or load earlier messages.' : `Say hello to ${selectedUser.fullName}.`}</p></div>}
   {filtered.map(m => <div key={m._id} className={`chat ${m.senderId === authUser._id ? 'chat-end' : 'chat-start'}`}>
    <div className="chat-header text-xs opacity-60 mb-1">{m.senderId === authUser._id ? 'You' : selectedUser.fullName} · <time dateTime={m.createdAt}>{new Date(m.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</time></div>
    <div className={`chat-bubble max-w-[85%] ${m.senderId === authUser._id ? 'chat-bubble-primary' : ''}`}>
     {m.image && <a href={m.image} target="_blank" rel="noreferrer"><img className="max-h-64 rounded-lg mb-2" src={m.image} alt="Shared attachment" loading="lazy" /></a>}
     <p className="whitespace-pre-wrap break-words">{m.text}</p>
    </div>
   </div>)}
   <div ref={end} />
  </div>
  <p className="px-5 text-xs opacity-60 h-5" aria-live="polite">{typingUntil[selectedUser._id] > now ? `${selectedUser.fullName} is typing…` : ''}</p>
  <MessageInput key={selectedUser._id} />
 </section>;
}
