import { skillsArraySchema } from "@/interface/skills";
import { BountyType, CompensationType } from "@prisma/client";
import { z } from "zod";
import { dayjs } from '@/utils/dayjs';
import { emailRegex, telegramRegex, twitterRegex } from '@/features/talent';
import axios from "axios";
import { timeToCompleteOptions } from "../utils";
import { BONUS_REWARD_POSITION, MAX_BONUS_SPOTS, MAX_PODIUMS, tokenList } from "@/constants";

export const createListingFormSchema = (
  isGod: boolean,
  editable: boolean,
  isDuplicating: boolean,
  id?: string,
  isST?: boolean,
) => {
  const slugUniqueCheck = async (slug: string) => {
    try {
      const listingId = editable && !isDuplicating ? id : null;
      await axios.get(
        `/api/listings/check-slug?slug=${slug}&check=true&id=${listingId}`,
      );
      return true;
    } catch (error) {
      return false;
    }
  };

  const eligibilityQuestionSchema = z.object({
    order: z.number(),
    question: z.string().min(1),
    type: z.enum(["text", "link"]),
  });

  const rewardsSchema = z
  .record(z.coerce.number(), z.number().min(0.01))
  .refine(
    (rewards) => {
      const positions = Object.keys(rewards).map(Number);
      const regularPositions = positions.filter(pos => pos !== BONUS_REWARD_POSITION);
      return regularPositions.length <= MAX_PODIUMS;
    },
    {
      message: `Cannot exceed ${MAX_PODIUMS} reward positions`
    }
  )
  .refine(
    (rewards) => {
      const positions = Object.keys(rewards).map(Number);
      const regularPositions = positions.filter(pos => pos !== BONUS_REWARD_POSITION);
      const sortedPositions = regularPositions.sort((a, b) => a - b);
      return sortedPositions.every((pos, idx) => pos === idx + 1);
    },
    {
      message: `Reward positions must be sequential starting from 1`
    }
  )
  .refine(
    (rewards) => {
      const bonusAmount = rewards[BONUS_REWARD_POSITION];
      if (bonusAmount === undefined) return true;

      const positions = Object.keys(rewards).map(Number);
      const regularPositions = positions.filter(pos => pos !== BONUS_REWARD_POSITION);
      const totalBonusAmount = bonusAmount * MAX_BONUS_SPOTS;
      const regularRewardsSum = regularPositions.reduce(
        (sum, pos) => sum + (rewards[pos] || 0),
        0
      );
      return (regularRewardsSum + totalBonusAmount) <= Number.MAX_SAFE_INTEGER;
    },
    {
      message: `Total rewards amount exceeds maximum allowed value`
    }
  )
  .refine(
    (rewards) => {
      return Object.values(rewards).every(value => !Number.isNaN(value));
    },
    {
      message: "All reward values must be valid numbers"
    }
  )
  .transform((rewards) => {
    return Object.fromEntries(
      Object.entries(rewards).map(([key, value]) => [String(key), Number(value)])
    );
  });

  return z.object({
    id: z.string().optional(),
    title: z.string().min(1, "Title is required"),
    slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug should only contain lowercase alphabets, numbers, and hyphens',
    )
    .refine(slugUniqueCheck, {
      message: 'Slug already exists. Please try another.',
    }),
    pocSocials: z
    .string()
    .min(1, 'Point of Contact is required')
    .refine(
      (value) => {
        return (
          twitterRegex.test(value) ||
            telegramRegex.test(value) ||
            emailRegex.test(value)
        );
      },
      {
        message: 'Please enter a valid X / Telegram link, or email address',
      },
    ),
    description: z.string().min(1, "Description is required"),
    type: z.nativeEnum(BountyType).default('bounty'),
    region: z.string().default("GLOBAL"),
    deadline: z.string().datetime().min(1, "Deadline is required")
    .refine(
      (date) => isGod || dayjs(date).isAfter(dayjs()), 
      "Deadline cannot be in the past"
    ),

    timeToComplete: z.string().optional(),
    templateId: z.string().uuid().optional(),
    publishedAt: z.string().datetime().optional(),
    eligibility: z.array(eligibilityQuestionSchema).optional(),
    skills: skillsArraySchema,

    token: z.enum(tokenList.map(token => token.tokenSymbol) as [string, ...string[]], {
      errorMap: () => ({ message: 'Token Not Allowed'})
    }).default("USDC"),
    rewardAmount: z.number().min(0).optional(),
    rewards: rewardsSchema.optional(),
    compensationType: z.nativeEnum(CompensationType).default("fixed"),
    minRewardAsk: z.number().min(0).optional(),
    maxRewardAsk: z.number().min(0).optional(),
    maxBonusSpots: z.number().min(1).max(50).optional(),
    isFndnPaying: z.boolean()
    .default(false)
    .refine(
      (value) => {
        if (value === true && !isST) {
          return false;
        }
        return true;
      },
      {
        message: "Foundation paying can only be enabled for Superteam listings"
      }
    ),
    isPrivate: z.boolean().default(false),
  }).superRefine((data, ctx) => {
      if (data.compensationType === "fixed") {
        if (!data.rewards || Object.keys(data.rewards).length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Rewards is required for fixed compensation type",
            path: ["rewards"]
          });
        }

        if (data.rewards) {
          const totalRewards = Object.values(data.rewards).reduce((sum, value) => sum + value, 0);
          if (totalRewards !== data.rewardAmount) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Total of rewards must equal the reward amount",
              path: ["rewardAmount"]
            });
          }
        }
      }

      if (data.compensationType === "range") {
        if (!data.minRewardAsk) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Minimum reward is required for range compensation type",
            path: ["minRewardAsk"]
          });
        }
        if (!data.maxRewardAsk) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Maximum reward is required for range compensation type",
            path: ["maxRewardAsk"]
          });
        }
        if (data.minRewardAsk && data.maxRewardAsk && data.maxRewardAsk < data.minRewardAsk) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Maximum reward must be greater than minimum reward",
            path: ["maxRewardAsk"]
          });
        }

        if (data.rewardAmount && data.maxRewardAsk && data.rewardAmount !== data.maxRewardAsk) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Reward amount must equal maximum reward for range compensation",
            path: ["rewardAmount"]
          });
        }
      }

      if (
        data.type === 'project' &&
          !timeToCompleteOptions.some(
            (option) => option.value === data.timeToComplete,
          )
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['timeToComplete'],
          message: 'Time to complete is required for projects',
        });
      }

      if(!!data.maxBonusSpots && (!data.rewards?.[BONUS_REWARD_POSITION] ||
        isNaN(data.rewards[BONUS_REWARD_POSITION]))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['rewards'],
          message: 'Bonus Reward is not mentioned',
        });
      }

    });

}