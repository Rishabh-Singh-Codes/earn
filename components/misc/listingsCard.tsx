/* eslint-disable no-nested-ternary */
import { BellIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Center,
  Flex,
  Image,
  Link,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { useWallet } from '@solana/wallet-adapter-react';
import parse from 'html-react-parser';
import moment from 'moment';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { TiTick } from 'react-icons/ti';

import type { MultiSelectOptions } from '../../constants';
import { tokenList } from '../../constants';
import type { BountyStatus } from '../../interface/types';
import { TalentStore } from '../../store/talent';
import { userStore } from '../../store/user';
import { findTalentPubkey, updateNotification } from '../../utils/functions';
import { EarningModal } from '../modals/earningModal';

type ListingSectionProps = {
  children?: React.ReactNode;
  title: string;
  sub: string;
  emoji: string;
  type: 'bounties' | 'jobs' | 'grants';
};

export const ListingSection = ({
  children,
  title,
  sub,
  emoji,
  type,
}: ListingSectionProps) => {
  const router = useRouter();

  return (
    <Box
      display={
        router.query.category
          ? router.query.category === (type as string) ||
            router.query.category === 'all'
            ? 'block'
            : 'none'
          : 'block'
      }
      w={{ md: '46.0625rem', base: '100%' }}
      mt={'1rem'}
      mb={'2.8125rem'}
      mx={'auto'}
    >
      <Flex
        align={'center'}
        mb={'0.875rem'}
        pb={'0.75rem'}
        borderBottom={'0.0625rem solid #E2E8F0'}
      >
        <Image
          w={'1.4375rem'}
          h={'1.4375rem'}
          mr={'0.75rem'}
          alt=""
          src={emoji}
        />
        <Text
          color={'#334155'}
          fontSize={{ base: '14px', md: '16px' }}
          fontWeight={'600'}
        >
          {title}
        </Text>
        <Text mx={'0.625rem'} color={'#CBD5E1'}>
          |
        </Text>
        <Text color={'#64748B'} fontSize={{ base: '12px', md: '14px' }}>
          {sub}
        </Text>
      </Flex>
      <Flex direction={'column'} rowGap={'2.625rem'}>
        {children}
      </Flex>
    </Box>
  );
};

const textLimiter = (text: string, len: number) => {
  if (text.length > len) {
    return `${text.slice(0, len)}...`;
  }
  return text;
};

interface BountyProps {
  title: string;
  description: string;
  amount: string;
  due: string;
  logo: string;
  status: BountyStatus;
  token: string;
  slug: string;
}
export const BountiesCard = ({
  amount,
  description,
  due,
  status,
  logo,
  title,
  token,
  slug,
}: BountyProps) => {
  return (
    <Flex w={{ base: '100%', md: '46.125rem' }} h={'3.9375rem'}>
      <Image
        w={'3.9375rem'}
        h={'3.9375rem'}
        mr={'1.375rem'}
        alt={''}
        rounded={'md'}
        src={logo ?? '/assets/home/placeholder/ph1.png'}
      />
      <Flex justify={'space-between'} direction={'column'} w={'full'}>
        <Text color={'#334155'} fontSize={'1rem'} fontWeight={'600'}>
          {textLimiter(title, 30)}
        </Text>
        <Text
          w={'full'}
          color={'#64748B'}
          fontSize={{ md: '0.875rem', base: '0.7688rem' }}
          fontWeight={'400'}
          noOfLines={1}
        >
          {parse(
            description?.startsWith('"')
              ? JSON.parse(description || '')?.slice(0, 100)
              : (description ?? '')?.slice(0, 100)
          )}
        </Text>
        <Flex align={'center'}>
          <Image
            w={'0.8125rem'}
            h={'0.8125rem'}
            mr={'0.1969rem'}
            alt=""
            rounded={'full'}
            src={
              tokenList.find((ele) => {
                return ele.mintAddress === token;
              })?.icon
            }
          />

          <Text color={'#334155'} fontSize={'0.8125rem'} fontWeight={'600'}>
            {amount}
          </Text>
          <Text mx={'0.5rem'} color={'#CBD5E1'} fontSize={'0.75rem'}>
            |
          </Text>
          <Text color={'#64748B'} fontSize={'0.75rem'}>
            {moment(due).fromNow().includes('ago')
              ? `Closed ${moment(due).fromNow()}`
              : `Closing ${moment(due).fromNow()}`}
          </Text>
        </Flex>
      </Flex>
      <Link
        ml={'auto'}
        href={`https://earn-frontend-v2.vercel.app/listings/bounties/${slug}`}
        isExternal
      >
        <Button
          display={{ base: 'none', md: 'block' }}
          ml={'auto'}
          px={'1.5rem'}
          py={'0.5rem'}
          color={'#94A3B8'}
          bg={'transparent'}
          border={'0.0625rem solid #94A3B8'}
        >
          {Number(moment(due).format('x')) < Date.now()
            ? status === 'close'
              ? 'View'
              : 'View'
            : 'Apply'}
        </Button>
      </Link>
    </Flex>
  );
};
interface JobsProps {
  title: string;
  description: string;
  max: number;
  min: number;
  maxEq: number;
  minEq: number;
  skills: MultiSelectOptions[];
  logo: string;
  orgName: string;
  link?: string;
}
export const JobsCard = ({
  description,
  max,
  min,
  maxEq,
  minEq,
  skills,
  title,
  logo,
  orgName,
  link,
}: JobsProps) => {
  return (
    <Flex
      align="center"
      justify="space-between"
      w={{ base: '100%', md: '46.125rem' }}
      h={'3.9375rem'}
    >
      <Flex justify="start">
        <Image
          w={'3.9375rem'}
          h={'3.9375rem'}
          mr={'1.375rem'}
          alt={''}
          rounded={'md'}
          src={logo ?? '/assets/home/placeholder/ph2.png'}
        />
        <Flex justify={'space-between'} direction={'column'}>
          <Text color={'#334155'} fontSize={'1rem'} fontWeight={'600'}>
            {title}
          </Text>
          <Text
            color={'#64748B'}
            fontSize={{ md: '0.875rem', base: '0.7688rem' }}
            fontWeight={'400'}
          >
            {description
              ? parse(
                  description?.startsWith('"')
                    ? JSON.parse(description || '')?.slice(0, 100)
                    : (description ?? '')?.slice(0, 100)
                )
              : orgName}
          </Text>
          <Flex align={'center'}>
            {!!min && !!max && (
              <Text mr={'0.6875rem'} color={'#64748B'} fontSize={'0.75rem'}>
                <Text as="span" fontWeight="700">
                  ${' '}
                </Text>
                {min.toLocaleString()} - {max.toLocaleString()}
              </Text>
            )}
            {!!minEq && !!maxEq && (
              <Text mr={'0.6875rem'} color={'#64748B'} fontSize={'0.75rem'}>
                {minEq.toLocaleString()}% - {maxEq.toLocaleString()}% Equity
              </Text>
            )}
            {skills?.length &&
              skills.slice(0, 3).map((e) => {
                return (
                  <Text
                    key={''}
                    display={{ base: 'none', md: 'block' }}
                    mr={'0.6875rem'}
                    color={'#64748B'}
                    fontSize={'0.75rem'}
                  >
                    {e.label}
                  </Text>
                );
              })}
          </Flex>
        </Flex>
      </Flex>
      <Link
        px={'1.5rem'}
        py={'0.5rem'}
        color={'#94A3B8'}
        border={'0.0625rem solid #94A3B8'}
        borderRadius="4px"
        _hover={{
          textDecoration: 'none',
          bg: '#94A3B8',
          color: '#ffffff',
        }}
        href={
          link ||
          `https://earn-frontend-v2.vercel.app/listings/jobs/${title
            .split(' ')
            .join('-')}`
        }
        isExternal
      >
        Apply
      </Link>
    </Flex>
  );
};

interface GrantsProps {
  title: string;
  description: string;
  logo: string;
  max: number;
  min: number;
}
export const GrantsCard = ({
  description,
  title,
  logo,
  max,
  min,
}: GrantsProps) => {
  return (
    <Flex w={{ base: '100%', md: '46.125rem' }} h={'3.9375rem'}>
      <Image
        w={'3.9375rem'}
        h={'3.9375rem'}
        mr={'1.375rem'}
        alt={''}
        rounded={'md'}
        src={logo ?? '/assets/home/placeholder/ph3.png'}
      />
      <Flex justify={'space-between'} direction={'column'}>
        <Text color={'#334155'} fontSize={'1rem'} fontWeight={'600'}>
          {title}
        </Text>
        <Text
          color={'#64748B'}
          fontSize={{ md: '0.875rem', base: '0.7688rem' }}
          fontWeight={'400'}
        >
          {parse(
            description?.startsWith('"')
              ? JSON.parse(description || '')?.slice(0, 100)
              : (description ?? '')?.slice(0, 100)
          )}
        </Text>
        <Flex align={'center'}>
          <Image
            w={'0.875rem'}
            h={'0.875rem'}
            mr={'0.1969rem'}
            alt=""
            src="/assets/icons/dollar.svg"
          />
          <Text mr={'0.6875rem'} color={'#64748B'} fontSize={'0.75rem'}>
            {min.toLocaleString()} - {max.toLocaleString()}
          </Text>
        </Flex>
      </Flex>
      <Link
        ml={'auto'}
        href={`https://earn-frontend-v2.vercel.app/listings/grants/${title
          .split(' ')
          .join('-')}`}
        isExternal
      >
        <Button
          display={{ base: 'none', md: 'block' }}
          ml={'auto'}
          px={'1.5rem'}
          py={'0.5rem'}
          color={'#94A3B8'}
          bg={'transparent'}
          border={'0.0625rem solid #94A3B8'}
        >
          Apply
        </Button>
      </Link>
    </Flex>
  );
};

type CategoryAssetsType = {
  [key: string]: {
    bg: string;
    desc: string;
    color: string;
    icon: string;
  };
};

export const CategoryBanner = ({ type }: { type: string }) => {
  const { userInfo } = userStore();

  const { talentInfo, setTalentInfo } = TalentStore();
  const [loading, setLoading] = useState(false);
  const categoryAssets: CategoryAssetsType = {
    Design: {
      bg: `/assets/category_assets/bg/design.png`,
      desc: 'If delighting users with eye-catching designs is your jam, you should check out the earning opportunities below.',
      color: '#FEFBA8',
      icon: '/assets/category_assets/icon/design.png',
    },
    Growth: {
      bg: `/assets/category_assets/bg/growth.png`,
      desc: 'If you’re a master of campaigns, building relationships, or data-driven strategy, we have earning opportunities for you.',
      color: '#BFA8FE',
      icon: '/assets/category_assets/icon/growth.png',
    },
    Content: {
      bg: `/assets/category_assets/bg/content.png`,
      desc: 'If you can write insightful essays, make stunning videos, or create killer memes, the opportunities below are calling your name.',
      color: '#FEB8A8',
      icon: '/assets/category_assets/icon/content.png',
    },
    'Frontend Development': {
      bg: `/assets/category_assets/bg/frontend.png`,
      desc: 'If you are a pixel-perfectionist who creates interfaces that users love, check out the earning opportunities below.',
      color: '#FEA8EB',
      icon: '/assets/category_assets/icon/frontend.png',
    },
    'Backend Development': {
      bg: `/assets/category_assets/bg/backend.png`,
      desc: 'Opportunities to build high-performance databases, on and off-chain. ',
      color: '#FEEBA8',
      icon: '/assets/category_assets/icon/backend.png',
    },
    Blockchain: {
      bg: `/assets/category_assets/bg/contract.png`,
      desc: 'If you can write insightful essays, make stunning videos, or create killer memes, the opportunities below are calling your name.',
      color: '#A8FEC0',
      icon: '/assets/category_assets/icon/contract.png',
    },
  };
  const { publicKey } = useWallet();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const updateTalent = async () => {
    const talent = await findTalentPubkey(publicKey?.toBase58() as string);
    if (!talent) {
      return null;
    }
    return setTalentInfo(talent.data);
  };
  return (
    <>
      {isOpen && <EarningModal isOpen={isOpen} onClose={onClose} />}
      <Flex
        direction={{ md: 'row', base: 'column' }}
        w={{ md: '46.0625rem', base: '24.125rem' }}
        h={{ md: '7.375rem', base: 'fit-content' }}
        mt={'1.5625rem'}
        p={'1.5rem'}
        bg={`url('${categoryAssets[type]?.bg}')`}
        bgSize={'contain'}
        rounded={'lg'}
      >
        <Center
          w={'3.6875rem'}
          h={'3.6875rem'}
          mr={'1.0625rem'}
          bg={categoryAssets[type]?.color}
          rounded={'md'}
        >
          <Image alt="Category icon" src={categoryAssets[type]?.icon} />
        </Center>
        <Box w={{ md: '60%', base: '100%' }} mt={{ base: '1rem', md: '0' }}>
          <Text fontFamily={'Domine'} fontWeight={'700'}>
            {type}
          </Text>
          <Text color={'#64748B'} fontSize={'0.875rem'}>
            {categoryAssets[type]?.desc}
          </Text>
        </Box>
        <Button
          mt={{ base: '1rem', md: '' }}
          ml={{ base: '', md: 'auto' }}
          my={{ base: '', md: 'auto' }}
          px={'1rem'}
          color={'#94A3B8'}
          fontWeight={'300'}
          bg={'white'}
          border={'0.0625rem solid #CBD5E1'}
          isLoading={loading}
          leftIcon={
            JSON.parse(talentInfo?.notifications ?? '[]').includes(type) ? (
              <TiTick />
            ) : (
              <BellIcon />
            )
          }
          onClick={async () => {
            if (!userInfo?.talent) {
              onOpen();
            }
            if (
              JSON.parse(talentInfo?.notifications as string).includes(type)
            ) {
              setLoading(true);
              const notification: string[] = [];

              JSON.parse(talentInfo?.notifications as string).forEach(
                (e: any) => {
                  if (e !== type) {
                    notification.push(e);
                  }
                }
              );
              await updateNotification(talentInfo?.id as string, notification);
              await updateTalent();
              setLoading(false);
            }
            setLoading(true);
            await updateNotification(talentInfo?.id as string, [
              ...JSON.parse(talentInfo?.notifications as string),
              type,
            ]);
            await updateTalent();
            setLoading(false);
          }}
          variant="solid"
        >
          Notify Me
        </Button>
        <Toaster />
      </Flex>
    </>
  );
};