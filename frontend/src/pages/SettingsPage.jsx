import { THEMES } from '../constants/index.js';
import { useThemeStore } from '../store/useThemeStore.js';
import { Send } from 'lucide-react';
import { useEffect, useRef, memo } from 'react';

// Capitalizes the first letter, e.g., "aura" -> "Aura"
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * ThemePreview
 * Memoized to avoid unnecessary re-renders.
 */
const ThemePreview = memo(({ themeName, isSelected, onClick }) => {
  const ref = useRef(null);

  // Update data-theme attribute only on themeName change
  useEffect(() => {
    ref.current?.setAttribute('data-theme', themeName);
    // Update children with [data-theme] for DaisyUI support
    ref.current
      ?.querySelectorAll('[data-theme]')
      .forEach((el) => el.setAttribute('data-theme', themeName));
  }, [themeName]);

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      data-theme={themeName}
      className={`group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors
        ${isSelected ? 'bg-base-200' : 'hover:bg-base-200/50'}`}
      tabIndex={0}
      aria-label={`Select theme: ${themeName}`}
    >
      <div className="relative h-8 w-full rounded-md overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
          <div className="rounded bg-primary" />
          <div className="rounded bg-secondary" />
          <div className="rounded bg-accent" />
          <div className="rounded bg-neutral" />
        </div>
      </div>
      <span className="text-[11px] font-medium truncate w-full text-center">
        {capitalize(themeName)}
      </span>
    </button>
  );
});

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  {
    id: 2,
    content: "I'm doing great! Just working on some new features.",
    isSent: true,
  },
];

// ChatPreviewMessage extracted for clarity and reusability
const ChatPreviewMessage = memo(({ message }) => (
  <div className={`flex ${message.isSent ? 'justify-end' : 'justify-start'}`}>
    <div
      className={`max-w-[80%] rounded-xl p-3 shadow-sm ${message.isSent ? 'bg-primary text-primary-content' : 'bg-base-200'}`}
    >
      <p className="text-sm">{message.content}</p>
      <p
        className={`text-[10px] mt-1.5 ${message.isSent ? 'text-primary-content/70' : 'text-base-content/70'}`}
      >
        12:00 PM
      </p>
    </div>
  </div>
));

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="h-screen container mx-auto px-4 pt-20 max-w-5xl">
      <div className="space-y-6">
        {/* Theme Selector */}
        <section>
          <h2 className="text-lg font-semibold">Theme</h2>
          <p className="text-sm text-base-content/70">
            Choose a theme for the chat interface.
          </p>
          <div className="mt-2 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {THEMES.map((t) => (
              <ThemePreview
                key={t}
                themeName={t}
                isSelected={theme === t}
                onClick={() => setTheme(t)}
              />
            ))}
          </div>
        </section>

        {/* Chat Preview */}
        <section>
          <h3 className="text-lg font-semibold mb-3">Preview</h3>
          <div
            className="rounded-xl border border-base-300 overflow-hidden bg-base-100 shadow-lg"
            data-theme={theme}
          >
            <div className="p-4 bg-base-200">
              <div className="max-w-lg mx-auto">
                {/* Chat UI */}
                <div className="bg-base-100 rounded-xl shadow-sm overflow-hidden">
                  {/* Header */}
                  <header className="px-4 py-3 border-b border-base-300 flex items-center gap-3 bg-base-100">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-content font-medium">
                      J
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">John Doe</h3>
                      <p className="text-xs text-base-content/70">Online</p>
                    </div>
                  </header>
                  {/* Messages */}
                  <div className="p-4 space-y-4 min-h-[200px] max-h-[200px] overflow-y-auto bg-base-100">
                    {PREVIEW_MESSAGES.map((m) => (
                      <ChatPreviewMessage key={m.id} message={m} />
                    ))}
                  </div>
                  {/* Input */}
                  <footer className="p-4 border-t border-base-300 bg-base-100">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="input input-bordered flex-1 text:sm h-10"
                        value="This is a preview"
                        readOnly
                        placeholder="Type a message..."
                        tabIndex={-1}
                      />
                      <button
                        className="btn btn-primary h-10 min-h-0"
                        tabIndex={-1}
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </footer>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default SettingsPage;
