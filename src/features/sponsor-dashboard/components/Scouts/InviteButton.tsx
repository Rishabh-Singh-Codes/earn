import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { usePostHog } from 'posthog-js/react';
import React from 'react';
import { LuCheck, LuPlus } from 'react-icons/lu';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils';

interface Props {
  bountyId: string;
  userId: string;
  invited: boolean;
  setInvited: (value: string) => void;
  maxInvitesReached: boolean;
  invitesLeft: number;
}

export function InviteButton({
  bountyId,
  userId,
  invited,
  setInvited,
  maxInvitesReached,
  invitesLeft,
}: Props) {
  const posthog = usePostHog();

  const inviteMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        `/api/listings/scout/invite/${bountyId}/${userId}`,
      );
      return response.data;
    },
    onSuccess: () => {
      setInvited(userId);
      posthog.capture('invited talent_scout', {
        invitedUser: userId,
      });
      const invites = invitesLeft - 1;
      toast.success(
        `Invite sent. ${invites} Invite${invites === 1 ? '' : 's'} Remaining`,
      );
    },
    onError: (error) => {
      console.error('Invite error:', error);
      toast.error('Invite failed, please try again later');
    },
  });

  const handleInvite = () => {
    inviteMutation.mutate();
  };

  return (
    <Button
      onClick={handleInvite}
      disabled={invited || maxInvitesReached}
      className={cn(
        'ph-no-capture h-full gap-2 text-xs',
        'bg-indigo-50 text-brand-purple',
        'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400',
      )}
      {...(inviteMutation.isPending && { 'aria-disabled': true })}
    >
      {invited ? (
        <>
          <LuCheck strokeLinecap="square" strokeWidth={3} /> Invited
        </>
      ) : (
        <>
          <LuPlus strokeLinecap="square" strokeWidth={3} /> Invite
        </>
      )}
    </Button>
  );
}
