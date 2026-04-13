import { useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Lock,
  MessageCircle,
  Pin,
  Plus,
  Send,
  Trash2,
  X,
} from 'lucide-react';

import { useAuthSession } from '@/hooks/useAuth';
import { useDocumentHead } from '@/hooks/useDocumentHead';
import {
  useCreateForumPost,
  useCreateForumReply,
  useDeleteForumPost,
  useDeleteForumReply,
  useForumPost,
  useForumPosts,
} from '@/hooks/useForum';
import { useToast } from '@/hooks/useToast';
import type {
  CreateForumPostInput,
  ForumCategory,
  ForumPostSort,
  IForumPost,
  IForumReply,
} from '@/types/forum';
import { FORUM_CATEGORIES, FORUM_CATEGORY_LABELS, FORUM_SORT_OPTIONS } from '@/types/forum';

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const Avatar = ({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) => {
  const sizeClasses = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm';
  return (
    <div
      className={`flex ${sizeClasses} items-center justify-center rounded-full bg-muted-foreground font-semibold text-white`}
    >
      {getInitials(name)}
    </div>
  );
};

/* ─── Post List Item ─── */
const PostListItem = ({
  post,
  onClick,
}: {
  post: IForumPost;
  onClick: (id: string) => void;
}) => (
  <button
    type="button"
    onClick={() => onClick(post.id)}
    className="group w-full text-left transition-colors hover:bg-muted/50"
  >
    <div className="flex gap-4 px-5 py-5 sm:px-6">
      <Avatar name={post.author.name} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {post.isPinned ? <Pin className="h-3.5 w-3.5 flex-shrink-0 text-[#FF385C]" /> : null}
          {post.isLocked ? (
            <Lock className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
          ) : null}
          <h3 className="truncate text-sm font-semibold text-foreground group-hover:text-[#FF385C]">
            {post.title}
          </h3>
        </div>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {post.body}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{post.author.name}</span>
          <span>{formatDate(post.createdAt)}</span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            {post.replyCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {post.viewCount}
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
            {FORUM_CATEGORY_LABELS[post.category as ForumCategory] || post.category}
          </span>
        </div>
      </div>
    </div>
  </button>
);

/* ─── Create Post Form ─── */
const CreatePostForm = ({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<ForumCategory>('general');
  const createMutation = useCreateForumPost();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    try {
      const input: CreateForumPostInput = {
        title: title.trim(),
        body: body.trim(),
        category,
      };
      await createMutation.mutateAsync(input);
      addToast({ message: 'Post created!', variant: 'success' });
      onCreated();
    } catch (err) {
      addToast({
        message: err instanceof Error ? err.message : 'Failed to create post',
        variant: 'error',
      });
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">New Discussion</h2>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div>
          <label htmlFor="post-title" className="mb-1.5 block text-sm font-medium text-foreground">
            Title
          </label>
          <input
            id="post-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's on your mind?"
            maxLength={200}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
          />
        </div>

        <div className="relative">
          <label
            htmlFor="post-category"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Category
          </label>
          <select
            id="post-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ForumCategory)}
            className="w-full appearance-none rounded-xl border border-border bg-background px-4 py-3 pr-10 text-sm text-foreground outline-none transition-colors focus:border-foreground"
          >
            {FORUM_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {FORUM_CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute bottom-3.5 right-3 h-4 w-4 text-muted-foreground" />
        </div>

        <div>
          <label htmlFor="post-body" className="mb-1.5 block text-sm font-medium text-foreground">
            Message
          </label>
          <textarea
            id="post-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share your thoughts, ask a question, or start a conversation..."
            rows={5}
            className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!title.trim() || !body.trim() || createMutation.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF385C] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#e0314f] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createMutation.isPending ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ─── Reply Card ─── */
const ReplyCard = ({
  reply,
  canDelete,
  onDelete,
}: {
  reply: IForumReply;
  canDelete: boolean;
  onDelete: (replyId: string) => void;
}) => (
  <div className="flex gap-3 py-4">
    <Avatar name={reply.author.name} size="sm" />
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-foreground">{reply.author.name}</span>
        <span className="text-xs text-muted-foreground">{formatDate(reply.createdAt)}</span>
      </div>
      <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
        {reply.body}
      </p>
      {canDelete ? (
        <button
          type="button"
          onClick={() => onDelete(reply.id)}
          className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-[#FF385C]"
        >
          <Trash2 className="h-3 w-3" />
          Delete
        </button>
      ) : null}
    </div>
  </div>
);

/* ─── Post Detail View ─── */
const PostDetail = ({
  postId,
  onBack,
}: {
  postId: string;
  onBack: () => void;
}) => {
  const { user } = useAuthSession();
  const { data, isLoading, error } = useForumPost(postId);
  const [replyBody, setReplyBody] = useState('');
  const createReplyMutation = useCreateForumReply();
  const deletePostMutation = useDeleteForumPost();
  const deleteReplyMutation = useDeleteForumReply();
  const { addToast } = useToast();

  const post = data?.data;

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim() || !post) return;

    try {
      await createReplyMutation.mutateAsync({ postId: post.id, body: replyBody.trim() });
      setReplyBody('');
      addToast({ message: 'Reply posted!', variant: 'success' });
    } catch (err) {
      addToast({
        message: err instanceof Error ? err.message : 'Failed to post reply',
        variant: 'error',
      });
    }
  };

  const handleDeletePost = async () => {
    if (!post) return;
    try {
      await deletePostMutation.mutateAsync(post.id);
      addToast({ message: 'Post deleted', variant: 'success' });
      onBack();
    } catch (err) {
      addToast({
        message: err instanceof Error ? err.message : 'Failed to delete post',
        variant: 'error',
      });
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    try {
      await deleteReplyMutation.mutateAsync(replyId);
      addToast({ message: 'Reply deleted', variant: 'success' });
    } catch (err) {
      addToast({
        message: err instanceof Error ? err.message : 'Failed to delete reply',
        variant: 'error',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4 px-5 py-6 sm:px-6">
        <div className="h-4 w-24 rounded bg-gray-200" />
        <div className="h-6 w-3/4 rounded bg-gray-200" />
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-2/3 rounded bg-gray-200" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="px-5 py-12 text-center sm:px-6">
        <p className="text-sm text-muted-foreground">
          {error?.message || 'Post not found'}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 text-sm font-semibold text-[#FF385C] hover:underline"
        >
          Back to discussions
        </button>
      </div>
    );
  }

  const isOwner = user?.id === post.authorId;
  const isAdmin = user?.role === 'site_admin';

  return (
    <div>
      <div className="border-b border-border px-5 py-5 sm:px-6">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to discussions
        </button>

        <div className="flex items-start gap-4">
          <Avatar name={post.author.name} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {post.isPinned ? <Pin className="h-3.5 w-3.5 text-[#FF385C]" /> : null}
              {post.isLocked ? <Lock className="h-3.5 w-3.5 text-muted-foreground" /> : null}
              <h2 className="text-lg font-bold text-foreground">{post.title}</h2>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{post.author.name}</span>
              <span>{formatDate(post.createdAt)}</span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                {FORUM_CATEGORY_LABELS[post.category as ForumCategory] || post.category}
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {post.viewCount}
              </span>
            </div>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-foreground">{post.body}</p>

            {isOwner || isAdmin ? (
              <button
                type="button"
                onClick={() => void handleDeletePost()}
                disabled={deletePostMutation.isPending}
                className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-[#FF385C]"
              >
                <Trash2 className="h-3 w-3" />
                {deletePostMutation.isPending ? 'Deleting...' : 'Delete post'}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Replies */}
      <div className="px-5 sm:px-6">
        <p className="py-4 text-sm font-semibold text-foreground">
          {post.replies.length} {post.replies.length === 1 ? 'Reply' : 'Replies'}
        </p>

        {post.replies.length > 0 ? (
          <div className="divide-y divide-border">
            {post.replies.map((reply) => (
              <ReplyCard
                key={reply.id}
                reply={reply}
                canDelete={user?.id === reply.authorId || isAdmin}
                onDelete={(replyId) => void handleDeleteReply(replyId)}
              />
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No replies yet. Be the first to respond!
          </p>
        )}

        {/* Reply form */}
        {user && !post.isLocked ? (
          <form
            onSubmit={(e) => void handleSubmitReply(e)}
            className="flex gap-3 border-t border-border py-5"
          >
            <Avatar name={user.name} size="sm" />
            <div className="flex min-w-0 flex-1 gap-2">
              <textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Write a reply..."
                rows={2}
                className="min-w-0 flex-1 resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
              />
              <button
                type="submit"
                disabled={!replyBody.trim() || createReplyMutation.isPending}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center self-end rounded-full bg-[#FF385C] text-white transition-colors hover:bg-[#e0314f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        ) : null}

        {!user && !post.isLocked ? (
          <div className="border-t border-border py-6 text-center">
            <p className="text-sm text-muted-foreground">
              <a href="/login" className="font-semibold text-[#FF385C] hover:underline">
                Sign in
              </a>{' '}
              to join the discussion.
            </p>
          </div>
        ) : null}

        {post.isLocked ? (
          <div className="border-t border-border py-6 text-center">
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              This discussion has been locked.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

/* ─── Main Forum Page ─── */
const ForumPage = () => {
  const { user } = useAuthSession();
  const [selectedCategory, setSelectedCategory] = useState<ForumCategory | undefined>(undefined);
  const [sort, setSort] = useState<ForumPostSort>('recent');
  const [page, setPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  useDocumentHead({
    title: 'Community Forum',
    description:
      'Connect with church visitors and leaders in San Antonio. Discuss, share, and ask questions.',
    canonicalPath: '/forum',
  });

  const { data, isLoading, error } = useForumPosts({
    category: selectedCategory,
    sort,
    page,
  });

  const posts = data?.data || [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages || 1;

  if (selectedPostId) {
    return (
      <div className="flex flex-1 bg-background">
        <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <PostDetail postId={selectedPostId} onBack={() => setSelectedPostId(null)} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 bg-background">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FF385C]">
              Community
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Forum
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Connect with church visitors and leaders in San Antonio.
            </p>
          </div>

          {user ? (
            <button
              type="button"
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF385C] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#e0314f]"
            >
              <Plus className="h-4 w-4" />
              New discussion
            </button>
          ) : null}
        </div>

        {/* Create form */}
        {showCreateForm ? (
          <div className="mt-6">
            <CreatePostForm
              onClose={() => setShowCreateForm(false)}
              onCreated={() => {
                setShowCreateForm(false);
                setPage(1);
              }}
            />
          </div>
        ) : null}

        {/* Filters */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory(undefined);
              setPage(1);
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              !selectedCategory
                ? 'bg-foreground text-white'
                : 'border border-border bg-card text-foreground hover:border-foreground'
            }`}
          >
            All
          </button>
          {FORUM_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat);
                setPage(1);
              }}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'bg-foreground text-white'
                  : 'border border-border bg-card text-foreground hover:border-foreground'
              }`}
            >
              {FORUM_CATEGORY_LABELS[cat]}
            </button>
          ))}

          <div className="ml-auto relative">
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as ForumPostSort);
                setPage(1);
              }}
              className="appearance-none rounded-full border border-border bg-card px-4 py-2 pr-8 text-sm font-semibold text-foreground outline-none transition-colors hover:border-foreground focus:border-foreground"
            >
              {FORUM_SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        {/* Post list */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
          {isLoading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse px-5 py-5 sm:px-6">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-gray-200" />
                      <div className="h-3 w-full rounded bg-gray-200" />
                      <div className="h-3 w-1/3 rounded bg-gray-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="px-5 py-12 text-center sm:px-6">
              <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="px-5 py-16 text-center sm:px-6">
              <MessageCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground">No discussions yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {user
                  ? 'Be the first to start a conversation!'
                  : 'Sign in to start a conversation.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {posts.map((post) => (
                <PostListItem key={post.id} post={post} onClick={setSelectedPostId} />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 ? (
          <nav className="mt-6 flex items-center justify-center gap-1" aria-label="Forum pagination">
            <button
              type="button"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setPage(pageNum)}
                  aria-current={page === pageNum ? 'page' : undefined}
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    page === pageNum
                      ? 'bg-foreground text-white'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        ) : null}

        {/* Sign in prompt */}
        {!user ? (
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">
              <a href="/login" className="font-semibold text-[#FF385C] hover:underline">
                Sign in
              </a>{' '}
              to join the conversation and start discussions.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ForumPage;
