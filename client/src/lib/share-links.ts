export type ShareTarget = {
  title: string;
  text?: string;
  url: string;
};

export const buildTwitterShareUrl = (target: ShareTarget): string => {
  const params = new URLSearchParams();
  params.set('url', target.url);
  const body = target.text ? `${target.title} — ${target.text}` : target.title;
  params.set('text', body);
  return `https://twitter.com/intent/tweet?${params.toString()}`;
};

export const buildFacebookShareUrl = (target: ShareTarget): string => {
  const params = new URLSearchParams();
  params.set('u', target.url);
  return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
};

export const buildMailtoShareUrl = (target: ShareTarget): string => {
  const params = new URLSearchParams();
  params.set('subject', target.title);
  const bodyLines = [target.text, target.url].filter(
    (value): value is string => typeof value === 'string' && value.length > 0,
  );
  params.set('body', bodyLines.length > 0 ? bodyLines.join('\n\n') : target.url);
  // mailto: expects + to be a literal space; URLSearchParams encodes space as +, which is OK for mailto.
  return `mailto:?${params.toString()}`;
};

export const canUseNativeShare = (target: ShareTarget): boolean => {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
    return false;
  }
  if (typeof navigator.canShare === 'function') {
    try {
      return navigator.canShare({ title: target.title, text: target.text, url: target.url });
    } catch {
      return false;
    }
  }
  return true;
};

export const copyTextToClipboard = async (value: string): Promise<boolean> => {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // fall through to the legacy path
    }
  }

  if (typeof document === 'undefined') {
    return false;
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-1000px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
};
