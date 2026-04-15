import { FormEvent, useEffect, useState } from 'react';
import { Pencil, Save, X } from 'lucide-react';

import { useUpdateChurch } from '@/hooks/useChurches';
import { useToast } from '@/hooks/useToast';
import { IChurch, IUpdateChurchInput } from '@/types/church';

type ChurchEditorProps = {
  church: IChurch;
  onClose: () => void;
  onSaved?: (church: IChurch) => void;
};

type FormState = {
  description: string;
  phone: string;
  email: string;
  website: string;
  pastorName: string;
  yearEstablished: string;
  languages: string;
  amenities: string;
  goodForChildren: boolean | null;
  goodForGroups: boolean | null;
  wheelchairAccessible: boolean | null;
};

const initFormState = (church: IChurch): FormState => ({
  description: church.description ?? '',
  phone: church.phone ?? '',
  email: church.email ?? '',
  website: church.website ?? '',
  pastorName: church.pastorName ?? '',
  yearEstablished: church.yearEstablished ? String(church.yearEstablished) : '',
  languages: church.languages.join(', '),
  amenities: church.amenities.join(', '),
  goodForChildren: church.goodForChildren ?? null,
  goodForGroups: church.goodForGroups ?? null,
  wheelchairAccessible: church.wheelchairAccessible ?? null,
});

const trilabelOptions = [
  { value: 'true', label: 'Yes' },
  { value: 'false', label: 'No' },
  { value: 'null', label: 'Unknown' },
] as const;

const parseTrilabel = (value: boolean | null): string => {
  if (value === true) return 'true';
  if (value === false) return 'false';
  return 'null';
};

const toTrilabel = (value: string): boolean | null => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
};

const splitCsv = (value: string): string[] =>
  value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

export const ChurchEditor = ({ church, onClose, onSaved }: ChurchEditorProps) => {
  const updateMutation = useUpdateChurch();
  const { addToast } = useToast();
  const [form, setForm] = useState<FormState>(() => initFormState(church));

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !updateMutation.isPending) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose, updateMutation.isPending]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const input: IUpdateChurchInput = {
      description: form.description.trim() || null,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      website: form.website.trim() || null,
      pastorName: form.pastorName.trim() || null,
      yearEstablished: form.yearEstablished.trim() ? Number(form.yearEstablished.trim()) : null,
      languages: splitCsv(form.languages),
      amenities: splitCsv(form.amenities),
      goodForChildren: form.goodForChildren,
      goodForGroups: form.goodForGroups,
      wheelchairAccessible: form.wheelchairAccessible,
    };

    try {
      const updated = await updateMutation.mutateAsync({
        churchId: church.id,
        input,
      });
      addToast({
        message: `${church.name} listing updated successfully`,
        variant: 'success',
      });
      onSaved?.(updated);
      onClose();
    } catch (error) {
      addToast({
        message: error instanceof Error ? error.message : 'Unable to save changes right now.',
        variant: 'error',
      });
    }
  };

  const inputClass =
    'w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#FF385C] focus:outline-none focus:ring-1 focus:ring-[#FF385C]';
  const labelClass = 'block text-sm font-semibold text-foreground';

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-[2px] animate-modal-overlay"
      onClick={() => {
        if (!updateMutation.isPending) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="church-editor-title"
        className="my-8 w-full max-w-2xl overflow-hidden rounded-2xl bg-card shadow-[0_20px_80px_rgba(0,0,0,0.25)] animate-modal-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff5f0] text-[#FF385C]">
              <Pencil className="h-4 w-4" />
            </div>
            <h2 id="church-editor-title" className="text-lg font-semibold text-foreground">
              Edit {church.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={updateMutation.isPending}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            aria-label="Close editor"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5 px-6 py-5">
          <div>
            <label htmlFor="ce-description" className={labelClass}>
              Description
            </label>
            <textarea
              id="ce-description"
              rows={4}
              maxLength={5000}
              className={`${inputClass} resize-y`}
              placeholder="Tell visitors about your church community, mission, and what to expect..."
              value={form.description}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {form.description.length}/5,000 characters
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ce-phone" className={labelClass}>
                Phone
              </label>
              <input
                id="ce-phone"
                type="tel"
                maxLength={30}
                className={inputClass}
                placeholder="(210) 555-0100"
                value={form.phone}
                onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="ce-email" className={labelClass}>
                Email
              </label>
              <input
                id="ce-email"
                type="email"
                maxLength={255}
                className={inputClass}
                placeholder="info@yourchurch.org"
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ce-website" className={labelClass}>
                Website
              </label>
              <input
                id="ce-website"
                type="url"
                maxLength={500}
                className={inputClass}
                placeholder="https://yourchurch.org"
                value={form.website}
                onChange={(e) => setForm((s) => ({ ...s, website: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="ce-pastor" className={labelClass}>
                Pastor / Lead Minister
              </label>
              <input
                id="ce-pastor"
                type="text"
                maxLength={255}
                className={inputClass}
                placeholder="Pastor name"
                value={form.pastorName}
                onChange={(e) => setForm((s) => ({ ...s, pastorName: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ce-year" className={labelClass}>
                Year Established
              </label>
              <input
                id="ce-year"
                type="number"
                min={1500}
                max={new Date().getFullYear()}
                className={inputClass}
                placeholder="1970"
                value={form.yearEstablished}
                onChange={(e) => setForm((s) => ({ ...s, yearEstablished: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="ce-languages" className={labelClass}>
                Languages
              </label>
              <input
                id="ce-languages"
                type="text"
                className={inputClass}
                placeholder="English, Spanish"
                value={form.languages}
                onChange={(e) => setForm((s) => ({ ...s, languages: e.target.value }))}
              />
              <p className="mt-1 text-xs text-muted-foreground">Comma-separated</p>
            </div>
          </div>

          <div>
            <label htmlFor="ce-amenities" className={labelClass}>
              Amenities
            </label>
            <input
              id="ce-amenities"
              type="text"
              className={inputClass}
              placeholder="Parking, Nursery, Fellowship hall, Live streaming"
              value={form.amenities}
              onChange={(e) => setForm((s) => ({ ...s, amenities: e.target.value }))}
            />
            <p className="mt-1 text-xs text-muted-foreground">Comma-separated</p>
          </div>

          <fieldset>
            <legend className="text-sm font-semibold text-foreground">
              Accessibility & Community
            </legend>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="ce-wheelchair" className="text-sm text-muted-foreground">
                  Wheelchair Accessible
                </label>
                <select
                  id="ce-wheelchair"
                  className={inputClass}
                  value={parseTrilabel(form.wheelchairAccessible)}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      wheelchairAccessible: toTrilabel(e.target.value),
                    }))
                  }
                >
                  {trilabelOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="ce-children" className="text-sm text-muted-foreground">
                  Good for Children
                </label>
                <select
                  id="ce-children"
                  className={inputClass}
                  value={parseTrilabel(form.goodForChildren)}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      goodForChildren: toTrilabel(e.target.value),
                    }))
                  }
                >
                  {trilabelOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="ce-groups" className="text-sm text-muted-foreground">
                  Good for Groups
                </label>
                <select
                  id="ce-groups"
                  className={inputClass}
                  value={parseTrilabel(form.goodForGroups)}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      goodForGroups: toTrilabel(e.target.value),
                    }))
                  }
                >
                  {trilabelOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>

          <div className="flex justify-end gap-3 border-t border-border pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={updateMutation.isPending}
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-foreground disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-[#FF385C] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#b00838] disabled:opacity-70"
            >
              <Save className="h-4 w-4" />
              {updateMutation.isPending ? 'Saving\u2026' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
