import { useAtomValue, useSetAtom } from 'jotai';
import { ExternalLink, Loader2 } from 'lucide-react';
import { useRouter } from 'next/router';
import { usePostHog } from 'posthog-js/react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

import {
  confirmModalAtom,
  isDraftSavingAtom,
  isEditingAtom,
  isSTAtom,
  previewAtom,
  submitListingMutationAtom,
} from '../../../atoms';
import { useListingForm } from '../../../hooks';
import { GeoLock, Visibility } from '..';
import { Foundation } from './Foundation';
import { Slug } from './Slug';

export function PrePublish() {
  const isST = useAtomValue(isSTAtom);
  useMemo(() => console.log('isST', isST), [isST]);
  const form = useListingForm();
  const [open, isOpen] = useState(false);

  const isDraftSaving = useAtomValue(isDraftSavingAtom);
  const setConfirmModal = useSetAtom(confirmModalAtom);
  const setShowPreview = useSetAtom(previewAtom);

  const isEditing = useAtomValue(isEditingAtom);

  const submitListingMutation = useAtomValue(submitListingMutationAtom);

  const router = useRouter();
  const posthog = usePostHog();
  return (
    <Dialog
      open={open}
      onOpenChange={(e) => {
        if (isDraftSaving) return;
        isOpen(e);
      }}
    >
      <Button
        className="ph-no-capture"
        disabled={isDraftSaving}
        onClick={async () => {
          posthog.capture('basics_sponsor');
          if (await form.validateBasics()) isOpen(true);
        }}
      >
        Continue
      </Button>
      <DialogContent className="py-4 sm:max-w-[500px]">
        <DialogHeader className="">
          <DialogTitle className="text-md">
            Few more things to consider:
          </DialogTitle>
        </DialogHeader>
        <Separator className="relativerl w-[100%]" />
        <div className="space-y-4">
          <Visibility />
          <GeoLock />
          <Slug />
          {isST && <Foundation />}
        </div>
        <DialogFooter className="flex w-full pt-4 sm:justify-between">
          <Button
            variant="outline"
            className="ph-no-capture gap-8"
            disabled={isDraftSaving || submitListingMutation.isPending}
            onClick={() => {
              posthog.capture('preview_listing');
              setShowPreview(true);
            }}
          >
            Preview <ExternalLink />{' '}
          </Button>
          <Button
            className="px-12"
            onClick={async () => {
              console.log('values ', form.getValues());
              if (await form.trigger()) {
                try {
                  const data = await form.submitListing();
                  isOpen(false);
                  if (isEditing) {
                    posthog.capture('update listing_sponsor');
                    router.push('/dashboard/listings');
                  } else {
                    posthog.capture('publish listing_sponsor');
                    if (data.status === 'VERIFYING') {
                      setConfirmModal('VERIFICATION');
                    } else {
                      setConfirmModal('SUCCESS');
                    }
                  }
                } catch (error) {
                  console.log(error);
                  toast.error(
                    'Failed to create listing, please try again later',
                    {},
                  );
                }
              }
            }}
            disabled={isDraftSaving || submitListingMutation.isPending}
          >
            {submitListingMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : !!isEditing ? (
              'Update'
            ) : (
              'Publish'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}