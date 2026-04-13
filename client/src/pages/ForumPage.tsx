import { useDocumentHead } from '@/hooks/useDocumentHead';

const ForumPage = () => {
  useDocumentHead({
    title: 'Community Forum',
    description:
      'Connect with church visitors and leaders in San Antonio. Community discussions coming soon.',
    canonicalPath: '/forum',
  });

  return (
    <div className="flex flex-1 bg-background">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FF385C]">
          Community
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Forum
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          Community discussions are coming soon. Check back for a place to connect with other church
          visitors and leaders in San Antonio.
        </p>
      </div>
    </div>
  );
};

export default ForumPage;
