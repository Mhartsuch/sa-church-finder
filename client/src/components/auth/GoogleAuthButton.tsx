type GoogleAuthButtonProps = {
  href: string;
  label: string;
};

export const GoogleAuthButton = ({ href, label }: GoogleAuthButtonProps) => {
  return (
    <a
      href={href}
      className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" focusable="false">
        <path
          fill="#EA4335"
          d="M12 10.2v3.9h5.42c-.23 1.25-.94 2.31-2 3.02l3.24 2.52c1.89-1.74 2.98-4.31 2.98-7.36 0-.72-.06-1.4-.18-2.06H12Z"
        />
        <path
          fill="#34A853"
          d="M6.27 14.28 5.54 14.84 2.96 16.85A9.98 9.98 0 0 0 12 22c2.7 0 4.96-.89 6.61-2.42l-3.24-2.52c-.89.6-2.02.96-3.37.96-2.59 0-4.78-1.75-5.56-4.1Z"
        />
        <path
          fill="#4A90E2"
          d="M2.96 7.15A10 10 0 0 0 2 12c0 1.75.42 3.4 1.16 4.85l3.11-2.57c-.2-.6-.31-1.24-.31-1.91 0-.67.11-1.31.31-1.91Z"
        />
        <path
          fill="#FBBC05"
          d="M12 5.98c1.46 0 2.77.5 3.8 1.48l2.85-2.85C16.95 3.03 14.7 2 12 2a9.98 9.98 0 0 0-9.04 5.15l3.11 2.57c.78-2.35 2.97-4.1 5.93-4.1Z"
        />
      </svg>
      <span>{label}</span>
    </a>
  );
};
