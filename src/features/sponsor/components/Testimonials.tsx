import {
  Box,
  Center,
  Divider,
  Flex,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react';

import { maxW, padding } from '../utils';
import { HighQualityImage } from './HighQualityImage';
import { Stars } from './Stars';
import { TestimonialCard, type TestimonialProps } from './TestimonialCard';

const testimonials: TestimonialProps[] = [
  {
    stars: 5,
    message: `I'll say it again, Earn is going to become one of the most important non-protocol products in the Solana ecosystem. Connecting developers (amongst others) to opportunity and protocols to talent.`,
    logo: '/landingsponsor/sponsors/solana.webp',
    pfp: '/landingsponsor/users/chasedBarker.webp',
    name: 'Chase Barker',
    position: 'Global Developer Growth, Solana',
  },
  {
    stars: 5,
    message: `I have a 💙 affair with 
@SuperteamEarn. Our team uses it to scout crypto-native talent. 
<br />
<br />
Perfect hiring workflow:
<br /> bounty -> trial period -> full-time offer.`,
    logo: '/landingsponsor/sponsors/ISC.webp',
    pfp: '/landingsponsor/users/eno.webp',
    name: 'Eno Sim',
    position: 'Co-Founder, ISC',
  },
  {
    stars: 4,
    message: `Superteam Earn is one of the most underrated and valuable platforms for both Solana protocols and 
users`,
    logo: '/landingsponsor/sponsors/parcl.webp',
    pfp: '/landingsponsor/users/evanSolomon.webp',
    name: 'Evan Solomon',
    position: 'BD Lead, Parcl',
  },
];

export function Testimonials() {
  return (
    <VStack
      align="start"
      gap={8}
      w="full"
      maxW={maxW}
      mb="4rem"
      px={padding}
      id="customers"
    >
      <Divider mb="2rem" />
      <Flex
        justify={'space-between'}
        direction={{ base: 'column', md: 'row-reverse' }}
        flex={1}
        gap={8}
        w="full"
        h="100%"
        border="1px solid"
        borderColor="brand.slate.300"
        rounded={4}
      >
        <Center
          w={{ base: '100%', md: '40%' }}
          h={{ base: '14.754rem', md: 'auto' }}
          bg="black"
          rounded={4}
        >
          <Box w={{ base: '5rem', md: '8rem' }}>
            <HighQualityImage
              src={'/landingsponsor/sponsors/tensor.webp'}
              alt="Tensor HQ USer"
              className="h-full w-full"
            />
          </Box>
        </Center>
        <VStack align="start" gap={4} p={{ base: '1rem', md: '2.5rem' }}>
          <Stars count={5} filled={5} />
          <Text
            color="brand.slate.600"
            fontSize={{ base: '1.4rem', md: '1.87rem' }}
            lineHeight={1.1}
          >
            Superteam are chads. <br />
            Superteam Earn is awesome. <br />
            Everybody should use it 💜
          </Text>
          <HStack gap={8}>
            <VStack align="start" gap={0}>
              <Text
                color="brand.slate.800"
                fontSize={'1.9rem'}
                fontWeight={600}
              >
                520k
              </Text>
              <Text
                color="brand.slate.500"
                fontSize={{ base: '0.625rem', md: '0.925rem' }}
                fontWeight={500}
              >
                Page Views
              </Text>
            </VStack>
            <VStack align="start" gap={0}>
              <Text
                color="brand.slate.800"
                fontSize={'1.9rem'}
                fontWeight={600}
              >
                369
              </Text>
              <Text
                color="brand.slate.500"
                fontSize={{ base: '0.625rem', md: '0.925rem' }}
                fontWeight={500}
              >
                Total Submissions
              </Text>
            </VStack>
          </HStack>
          <HStack gap={6}>
            <Box
              gap={6}
              w={{ base: '2.1rem', md: '3.1rem' }}
              h={{ base: '2.1rem', md: '3.1rem' }}
            >
              <HighQualityImage
                src={'/landingsponsor/users/tensor.webp'}
                alt="TensorHQ"
                className="h-full w-full"
              />
            </Box>
            <Text color="black" fontSize={{ base: '1rem', md: '1.5rem' }}>
              Tensor HQ, on Twitter
            </Text>
          </HStack>
        </VStack>
      </Flex>
      <Flex wrap={'wrap'} gap={8} mt="auto">
        {testimonials.map((t) => (
          <TestimonialCard key={t.name} {...t} />
        ))}
      </Flex>
    </VStack>
  );
}
