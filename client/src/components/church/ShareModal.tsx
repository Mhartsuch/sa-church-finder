import { useState } from 'react';
import { X } from 'lucide-react';

interface ShareModalProps {
  churchName: string;
  churchDenomination?: string;
  churchAddress?: string;
  churchSlug: string;
  coverImageUrl?: string | null;
  onClose: () => void;
}

const SHARE_OPTIONS = [
  { label: 'Copy Link', icon: '🔗', color: '#222' },
  { label: 'Email', icon: '✉️', color: '#D44638' },
  { label: 'WhatsApp', icon: '💬', color: '#25D366' },
  { label: 'Twitter', icon: '🐦', color: '#1DA1F2' },
  { label: 'Facebook', icon: '📘', color: '#1877F2' },
  { label: 'Messages', icon: '💭', color: '#34C759' },
  { label: 'Pinterest', icon: '📌', color: '#E60023' },
];

export const ShareModal = ({
  churchName,
  churchDenomination,
  churchAddress,
  churchSlug,
  coverImageUrl,
  onClose,
}: ShareModalProps) => {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/churches/${churchSlug}`;
  const message = `Check out ${churchName}${churchAddress ? ` at ${churchAddress}` : ''} on ChurchFinder!`;

  const handleShare = async (option: string) => {
    switch (option) {
      case 'Copy Link':
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
      case 'Email':
        window.open(
          `mailto:?subject=${encodeURIComponent(churchName)}&body=${encodeURIComponent(`${message}\n${url}`)}`,
        );
        break;
      case 'WhatsApp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${message} ${url}`)}`);
        break;
      case 'Twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`,
        );
        break;
      case 'Facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'Messages':
        window.open(`sms:?body=${encodeURIComponent(`${message} ${url}`)}`);
        break;
      case 'Pinterest':
        window.open(
          `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(message)}`,
        );
        break;
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md animate-modal-slide-up rounded-2xl bg-card p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold">Share this church</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Preview */}
        <div className="mb-6 flex gap-4 rounded-xl border border-border p-3">
          {coverImageUrl ? (
            <img
              src={coverImageUrl}
              alt={churchName}
              className="h-16 w-16 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted text-2xl">
              ⛪
            </div>
          )}
          <div>
            <h4 className="font-semibold">{churchName}</h4>
            <p className="text-sm text-muted-foreground">
              {[churchDenomination, churchAddress].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>

        {/* Share options */}
        <div className="grid grid-cols-4 gap-3">
          {SHARE_OPTIONS.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => handleShare(option.label)}
              className="flex flex-col items-center gap-2 rounded-xl p-3 transition-colors hover:bg-muted"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-xl"
                style={{ backgroundColor: `${option.color}18` }}
              >
                {option.icon}
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">
                {option.label === 'Copy Link' && copied ? 'Copied!' : option.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
