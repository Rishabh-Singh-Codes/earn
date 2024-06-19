import { type Prisma } from '@prisma/client';
import { WebhookClient } from 'discord.js';

import { getURL } from '@/utils/validUrl';

const discord = new WebhookClient({
  url: process.env.DISCORD_LISTINGS_WEBHOOK!,
});

export type updateStatus =
  | 'Draft Added'
  | 'Published'
  | 'Unpublished'
  | 'Deadline Reached'
  | 'Winner Announced';

type BountiesWithSponsor = Prisma.BountiesGetPayload<{
  include: {
    sponsor: true;
  };
}>;

export async function discordListingUpdate(
  listing: BountiesWithSponsor,
  status: updateStatus,
) {
  const url = `${getURL()}listings/${listing.type}/${listing.slug}`;

  const msg = `Listing: ${listing.title} (<${url}>)
Type: ${listing.type}
Sponsor Name: ${listing.sponsor.name} (<${listing.sponsor?.url}>)
${listing.rewardAmount ? `Amount: ${listing.rewardAmount} ${listing.token}` : ''}${listing.compensationType === 'variable' ? 'Variable' : ''}${listing.compensationType === 'range' ? `${listing.minRewardAsk} (${listing.token}) to ${listing.maxRewardAsk} (${listing.token})` : ''}
Status: ${status}
`;

  await discord.send({
    content: msg,
    embeds: [],
  });
  console.log('Message sent');
}
