import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Award,
  BookOpen,
  ChevronRight,
  Church,
  Globe,
  Lock,
  MapPin,
  Pencil,
  Plus,
  Share2,
  Star,
  Trash2,
  Trophy,
} from 'lucide-react';

import { CreateCollectionModal } from '@/components/passport/CreateCollectionModal';
import { EditVisitModal } from '@/components/passport/EditVisitModal';
import { ConfirmDialog } from '@/components/layout/ConfirmDialog';
import { useAuthSession } from '@/hooks/useAuth';
import {
  useCreateCollection,
  useDeleteVisit,
  usePassport,
  useUpdateVisit,
  useUserCollections,
  useUserVisits,
} from '@/hooks/usePassport';
import { useToast } from '@/hooks/useToast';
import {
  AWARD_METADATA,
  ICreateCollectionInput,
  IPassportVisit,
  IUpdateVisitInput,
} from '@/types/passport';

const ALL_AWARD_TYPES = Object.keys(AWARD_METADATA);

const formatMemberSince = (dateStr: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr));
};

const formatVisitDate = (dateStr: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateStr));
};

const formatEarnedDate = (dateStr: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateStr));
};

const truncateNotes = (notes: string, maxLength = 80): string => {
  if (notes.length <= maxLength) return notes;
  return notes.slice(0, maxLength).trimEnd() + '...';
};

const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'
          }`}
        />
      ))}
    </span>
  );
};

const VisitRow = ({
  visit,
  canManage,
  onEdit,
  onDelete,
}: {
  visit: IPassportVisit;
  canManage: boolean;
  onEdit: (visit: IPassportVisit) => void;
  onDelete: (visit: IPassportVisit) => void;
}) => {
  const churchName = visit.church?.name ?? 'A San Antonio church';

  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div className="min-w-0 flex-1">
        {visit.church ? (
          <Link
            to={`/churches/${visit.church.slug}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 truncate block"
          >
            {visit.church.name}
          </Link>
        ) : (
          <span className="text-sm font-medium text-gray-900 truncate block">{churchName}</span>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
          <span>{formatVisitDate(visit.visitedAt)}</span>
          {visit.rating !== null && <RatingStars rating={visit.rating} />}
          {visit.church?.neighborhood && (
            <span className="inline-flex items-center gap-0.5">
              <MapPin className="h-3 w-3" />
              {visit.church.neighborhood}
            </span>
          )}
        </div>
        {visit.notes && (
          <p className="mt-1 text-xs text-gray-400 italic">{truncateNotes(visit.notes)}</p>
        )}
      </div>
      <div className="ml-3 flex flex-shrink-0 items-center gap-1">
        {canManage && (
          <>
            <button
              type="button"
              onClick={() => onEdit(visit)}
              aria-label={`Edit visit to ${churchName}`}
              title="Edit visit"
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(visit)}
              aria-label={`Delete visit to ${churchName}`}
              title="Delete visit"
              className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        )}
        {visit.church && (
          <Link
            to={`/churches/${visit.church.slug}`}
            className="text-gray-300 hover:text-gray-500"
            aria-label={`View ${visit.church.name}`}
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
};

const PassportPage = () => {
  const { id: routeUserId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated, isLoading: isAuthLoading } = useAuthSession();
  const { addToast } = useToast();

  const userId = routeUserId ?? currentUser?.id ?? null;
  const isOwnPassport = !routeUserId || routeUserId === currentUser?.id;

  const {
    data: passport,
    isLoading: isPassportLoading,
    error: passportError,
  } = usePassport(userId);

  const { data: collections = [], isLoading: isCollectionsLoading } = useUserCollections(userId);

  const createCollectionMutation = useCreateCollection();
  const updateVisitMutation = useUpdateVisit();
  const deleteVisitMutation = useDeleteVisit();

  const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<IPassportVisit | null>(null);
  const [deletingVisit, setDeletingVisit] = useState<IPassportVisit | null>(null);
  const [showAllVisits, setShowAllVisits] = useState(false);
  const [visitsPage, setVisitsPage] = useState(1);

  const {
    data: allVisitsResponse,
    isLoading: isAllVisitsLoading,
    error: allVisitsError,
  } = useUserVisits(showAllVisits ? userId : null, visitsPage);

  // Redirect to login if viewing own passport while not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated && !routeUserId) {
      navigate('/login', { replace: true });
    }
  }, [isAuthLoading, isAuthenticated, routeUserId, navigate]);

  const handleSharePassport = async () => {
    const targetUserId = userId;
    if (!targetUserId) return;

    const publicUrl = `${window.location.origin}/users/${targetUserId}/passport`;

    try {
      await navigator.clipboard.writeText(publicUrl);
      addToast({ message: 'Passport link copied to clipboard', variant: 'success' });
    } catch {
      addToast({ message: 'Failed to copy link', variant: 'error' });
    }
  };

  const handleCreateCollection = async (input: ICreateCollectionInput) => {
    try {
      const created = await createCollectionMutation.mutateAsync(input);
      setIsCreateCollectionOpen(false);
      addToast({
        message: `"${created.name}" is ready — happy collecting!`,
        variant: 'success',
      });
      navigate(`/collections/${created.id}`);
    } catch (createError) {
      addToast({
        message:
          createError instanceof Error
            ? createError.message
            : 'Unable to create that collection right now.',
        variant: 'error',
      });
    }
  };

  const handleUpdateVisit = async (input: IUpdateVisitInput) => {
    if (!editingVisit) return;

    try {
      await updateVisitMutation.mutateAsync({ visitId: editingVisit.id, input });
      setEditingVisit(null);
      addToast({ message: 'Visit updated', variant: 'success' });
    } catch (updateError) {
      addToast({
        message:
          updateError instanceof Error
            ? updateError.message
            : 'Unable to update that visit right now.',
        variant: 'error',
      });
    }
  };

  const handleDeleteVisit = async () => {
    if (!deletingVisit) return;

    try {
      await deleteVisitMutation.mutateAsync(deletingVisit.id);
      setDeletingVisit(null);
      addToast({ message: 'Visit removed from your passport', variant: 'success' });
    } catch (deleteError) {
      setDeletingVisit(null);
      addToast({
        message:
          deleteError instanceof Error
            ? deleteError.message
            : 'Unable to remove that visit right now.',
        variant: 'error',
      });
    }
  };

  const handleToggleAllVisits = () => {
    setShowAllVisits((current) => !current);
    setVisitsPage(1);
  };

  // Auth still loading
  if (isAuthLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        </div>
      </div>
    );
  }

  // Not logged in and no route user ID
  if (!isAuthenticated && !routeUserId) {
    return null;
  }

  // Passport data loading
  if (isPassportLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        </div>
      </div>
    );
  }

  // Error state
  if (passportError || !passport) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-20">
          <Trophy className="mx-auto h-12 w-12 text-gray-300" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">Passport not found</h2>
          <p className="mt-2 text-sm text-gray-500">
            {passportError?.message ?? 'This passport could not be loaded.'}
          </p>
          <Link to="/" className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-800">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const { user: passportUser, stats, awards, recentVisits } = passport;
  const earnedAwardTypes = new Set(awards.map((a) => a.awardType));
  const earnedAwardMap = new Map(awards.map((a) => [a.awardType, a]));

  // Filter collections: show all for own passport, only public for others
  const visibleCollections = isOwnPassport ? collections : collections.filter((c) => c.isPublic);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {passportUser.avatarUrl ? (
              <img
                src={passportUser.avatarUrl}
                alt={passportUser.name}
                className="h-16 w-16 rounded-full object-cover border-2 border-gray-100"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xl font-semibold">
                {passportUser.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {passportUser.name}
                {isOwnPassport && (
                  <span className="ml-2 text-sm font-normal text-gray-400">(you)</span>
                )}
              </h1>
              <p className="text-sm text-gray-500">
                Member since {formatMemberSince(passportUser.createdAt)}
              </p>
            </div>
          </div>
          <button
            onClick={handleSharePassport}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Visit Stats</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Church className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalVisits}</p>
            <p className="text-sm text-gray-500">Total Visits</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 text-emerald-600 mb-2">
              <Globe className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.uniqueChurches}</p>
            <p className="text-sm text-gray-500">Unique Churches</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <BookOpen className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.denominationsVisited}</p>
            <p className="text-sm text-gray-500">Denominations</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 text-orange-600 mb-2">
              <MapPin className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.neighborhoodsVisited}</p>
            <p className="text-sm text-gray-500">Neighborhoods</p>
          </div>
        </div>
      </div>

      {/* Awards Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Awards</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {ALL_AWARD_TYPES.map((awardType) => {
            const meta = AWARD_METADATA[awardType];
            const isEarned = earnedAwardTypes.has(awardType);
            const earned = earnedAwardMap.get(awardType);

            return (
              <div
                key={awardType}
                title={
                  isEarned
                    ? `${meta.name}: ${meta.description} — Earned ${formatEarnedDate(earned!.earnedAt)}`
                    : `${meta.name}: ${meta.description}`
                }
                className={`relative rounded-xl border p-4 text-center transition-colors ${
                  isEarned
                    ? 'border-yellow-300 bg-yellow-50'
                    : 'border-gray-200 bg-gray-50 opacity-50'
                }`}
              >
                <div className="text-2xl mb-1.5">{meta.icon}</div>
                <p
                  className={`text-sm font-medium ${isEarned ? 'text-gray-900' : 'text-gray-400'}`}
                >
                  {meta.name}
                </p>
                {!isEarned && <Lock className="absolute top-2 right-2 h-3.5 w-3.5 text-gray-300" />}
                {isEarned && (
                  <Award className="absolute top-2 right-2 h-3.5 w-3.5 text-yellow-500" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Visits Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {showAllVisits ? 'All Visits' : 'Recent Visits'}
          </h2>
          {stats.totalVisits > 0 && (
            <button
              type="button"
              onClick={handleToggleAllVisits}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              {showAllVisits
                ? 'Show recent only'
                : `View all ${stats.totalVisits} ${stats.totalVisits === 1 ? 'visit' : 'visits'}`}
            </button>
          )}
        </div>
        {showAllVisits ? (
          isAllVisitsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            </div>
          ) : allVisitsError ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-sm text-gray-500">{allVisitsError.message}</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {(allVisitsResponse?.data ?? []).map((visit) => (
                  <VisitRow
                    key={visit.id}
                    visit={visit}
                    canManage={isOwnPassport}
                    onEdit={setEditingVisit}
                    onDelete={setDeletingVisit}
                  />
                ))}
              </div>
              {(allVisitsResponse?.meta.totalPages ?? 1) > 1 && (
                <div className="mt-4 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setVisitsPage((current) => Math.max(1, current - 1))}
                    disabled={visitsPage === 1}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <p className="text-sm text-gray-500">
                    Page {allVisitsResponse?.meta.page ?? visitsPage} of{' '}
                    {allVisitsResponse?.meta.totalPages ?? 1}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setVisitsPage((current) =>
                        Math.min(allVisitsResponse?.meta.totalPages ?? current, current + 1),
                      )
                    }
                    disabled={visitsPage >= (allVisitsResponse?.meta.totalPages ?? 1)}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )
        ) : recentVisits.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <Church className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">
              {isOwnPassport
                ? 'No visits yet. Start exploring churches in San Antonio!'
                : 'No visits recorded yet.'}
            </p>
            {isOwnPassport && (
              <Link
                to="/search"
                className="mt-3 inline-block text-sm text-blue-600 hover:text-blue-800"
              >
                Find churches to visit
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {recentVisits.map((visit) => (
              <VisitRow
                key={visit.id}
                visit={visit}
                canManage={isOwnPassport}
                onEdit={setEditingVisit}
                onDelete={setDeletingVisit}
              />
            ))}
          </div>
        )}
      </div>

      {/* Collections Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Collections</h2>
          {isOwnPassport && (
            <button
              type="button"
              onClick={() => setIsCreateCollectionOpen(true)}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              New Collection
            </button>
          )}
        </div>
        {isCollectionsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          </div>
        ) : visibleCollections.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">
              {isOwnPassport
                ? 'No collections yet. Create one to group your favorite churches.'
                : 'No public collections.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {visibleCollections.map((collection) => (
              <Link
                key={collection.id}
                to={`/collections/${collection.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {collection.name}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        collection.isPublic
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {collection.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {collection.churchCount} {collection.churchCount === 1 ? 'church' : 'churches'}
                  </p>
                </div>
                <ChevronRight className="ml-3 h-4 w-4 flex-shrink-0 text-gray-300" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {isCreateCollectionOpen && (
        <CreateCollectionModal
          isPending={createCollectionMutation.isPending}
          onSubmit={(input) => {
            void handleCreateCollection(input);
          }}
          onClose={() => setIsCreateCollectionOpen(false)}
        />
      )}

      {editingVisit && (
        <EditVisitModal
          churchName={editingVisit.church?.name ?? 'this church'}
          initialNotes={editingVisit.notes}
          initialRating={editingVisit.rating}
          isPending={updateVisitMutation.isPending}
          onSubmit={(input) => {
            void handleUpdateVisit(input);
          }}
          onClose={() => setEditingVisit(null)}
        />
      )}

      <ConfirmDialog
        open={deletingVisit !== null}
        title="Remove this visit?"
        description={
          deletingVisit
            ? `Your ${formatVisitDate(deletingVisit.visitedAt)} visit to ${
                deletingVisit.church?.name ?? 'this church'
              } will be removed from your passport. This cannot be undone.`
            : ''
        }
        confirmLabel="Remove visit"
        variant="destructive"
        isPending={deleteVisitMutation.isPending}
        onConfirm={() => {
          void handleDeleteVisit();
        }}
        onCancel={() => setDeletingVisit(null)}
      />
    </div>
  );
};

export default PassportPage;
