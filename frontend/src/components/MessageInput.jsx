import React, { useState, useRef } from 'react';
import { useChatStore } from '../store/useChatStore.js';
import { X, Image, Send } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore.js';
import toast from 'react-hot-toast';

const MessageInput = () => {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error('Images must be under 2 MB');
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef) {
      fileInputRef.current.value = '';
    }
  };
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (sending || (!text.trim() && !imagePreview)) return;
    setSending(true);
    try {
      const sent = await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });
      if (!sent) return;
      // clear form
      setText('');
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (e) {
      toast.error('Failed to send message');
      console.error('Failed to send message', e);
    } finally { setSending(false); }
  };
  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              aria-label="Remove attachment"
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            maxLength={4000}
            aria-label="Message"
            onChange={(e) => { setText(e.target.value); useAuthStore.getState().socket?.emit('typing', { receiverId: useChatStore.getState().selectedUser?._id }); }}
          />
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
                     ${imagePreview ? 'text-emerald-500' : 'text-zinc-400'}`}
            aria-label="Attach image"
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          aria-label="Send message"
          disabled={sending || (!text.trim() && !imagePreview)}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};
export default MessageInput;

