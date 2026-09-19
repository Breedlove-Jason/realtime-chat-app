import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquare, Search, Send, Zap, ShieldCheck, Users } from 'lucide-react';
const initial = [
 { id: 1, author: 'Alex', text: 'Hey! Welcome to Relay. This is a local preview of the messaging experience.', own: false },
 { id: 2, author: 'You', text: 'A little space for good conversations. I like it.', own: true },
 { id: 3, author: 'Alex', text: 'Create an account to chat with real people, share images, and keep your conversations across devices.', own: false },
];
export default function DemoPage() {
 const [messages, setMessages] = useState(initial);
 const [draft, setDraft] = useState('');
 const [search, setSearch] = useState('');
 function send(e) { e.preventDefault(); if (!draft.trim()) return; setMessages(m => [...m, { id: Date.now(), author: 'You', text: draft.trim(), own: true }]); setDraft(''); }
 return <main className="min-h-screen pt-24 pb-10 px-4 bg-base-200">
  <div className="max-w-6xl mx-auto">
   <div className="flex flex-wrap justify-between gap-4 items-end mb-8">
    <div><span className="badge badge-outline mb-3">JASON BREEDLOVE / FULL-STACK PROJECT</span><h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Less noise.<br/><span className="text-primary">More connection.</span></h1><p className="mt-3 text-base-content/60 max-w-lg">A focused messenger built for conversations that keep moving.</p></div>
    <Link to="/signup" className="btn btn-primary">Create your account <ArrowRight size={18}/></Link>
   </div>
   <div className="rounded-2xl overflow-hidden border border-base-300 shadow-2xl bg-base-100">
    <div className="px-5 py-3 bg-primary/10 text-sm border-b border-base-300 flex flex-wrap gap-2 justify-between"><span><strong>Interactive preview</strong> · Sample conversation; messages stay in this tab.</span><button onClick={() => { setMessages(initial); setDraft(''); setSearch(''); }} className="underline">Reset preview</button></div>
    <div className="flex h-[470px]">
     <aside className="hidden sm:flex w-60 border-r border-base-300 p-5 flex-col gap-5"><div className="flex gap-2 font-semibold"><MessageSquare size={20}/> Conversations</div><div className="bg-primary/10 rounded-xl p-3"><strong>Alex Morgan</strong><p className="text-xs opacity-60 mt-1">Sample conversation</p></div><p className="mt-auto text-xs opacity-60">Real accounts unlock persistent history, live presence, and image sharing.</p></aside>
     <section className="flex-1 min-w-0 flex flex-col">
      <div className="border-b border-base-300 px-5 py-3 flex justify-between gap-3 items-center"><div><strong>Alex Morgan</strong><p className="text-xs opacity-60">Preview contact</p></div><label className="input input-sm input-bordered flex items-center gap-2 max-w-[50%]"><Search size={16}/><input aria-label="Search preview" className="w-full" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"/></label></div>
      <div className="flex-1 overflow-y-auto p-5" role="log" aria-label="Preview messages">{messages.filter(m => m.text.toLowerCase().includes(search.toLowerCase())).map(m => <div key={m.id} className={`chat ${m.own ? 'chat-end' : 'chat-start'}`}><div className="chat-header text-xs opacity-60">{m.author}</div><p className={`chat-bubble ${m.own ? 'chat-bubble-primary' : ''}`}>{m.text}</p></div>)}</div>
      <form onSubmit={send} className="flex gap-2 p-4 border-t border-base-300"><input aria-label="Preview message" value={draft} onChange={e => setDraft(e.target.value)} maxLength={4000} className="input input-bordered flex-1 min-w-0" placeholder="Try writing a message…"/><button className="btn btn-primary" disabled={!draft.trim()} aria-label="Send preview message"><Send size={20}/></button></form>
     </section>
    </div>
   </div>
   <div className="grid sm:grid-cols-3 gap-5 mt-7">{[[Zap,'Built for live conversation','Socket.IO messaging and typing indicators.'],[ShieldCheck,'Identity on the server','Authenticated sockets and private message history.'],[Users,'A thoughtful workspace','Contact search, unread counts, and 32 themes.']].map(([Icon,title,body]) => <div key={title} className="rounded-xl border border-base-300 p-5"><Icon size={22} className="text-primary mb-3"/><h2 className="font-semibold">{title}</h2><p className="text-sm opacity-60 mt-1">{body}</p></div>)}</div>
   <p className="text-xs opacity-50 mt-6">React · Express · MongoDB · Socket.IO / Built by Jason Breedlove</p>
  </div>
 </main>;
}
