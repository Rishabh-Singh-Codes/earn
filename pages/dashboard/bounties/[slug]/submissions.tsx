import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  LinkIcon,
} from '@chakra-ui/icons';
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Flex,
  Image,
  Link,
  Select,
  Spinner,
  Tag,
  TagLabel,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import axios from 'axios';
import Avatar from 'boring-avatars';
import type { GetServerSideProps } from 'next';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import ErrorSection from '@/components/shared/ErrorSection';
import LoadingSection from '@/components/shared/LoadingSection';
import type { Bounty } from '@/interface/bounty';
import type { SubmissionWithUser } from '@/interface/submission';
import Sidebar from '@/layouts/Sidebar';
import { userStore } from '@/store/user';
import { truncatePublicKey } from '@/utils/truncatePublicKey';

interface Props {
  slug: string;
}

function BountySubmissions({ slug }: Props) {
  const router = useRouter();
  const { userInfo } = userStore();
  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [submissions, setSubmissions] = useState<SubmissionWithUser[]>([]);
  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionWithUser>();
  const [isSelectingWinner, setIsSelectingWinner] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [rewards, setRewards] = useState<string[]>([]);
  const [isBountyLoading, setIsBountyLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const length = 15;

  const getSubmissions = async (id?: string) => {
    setIsBountyLoading(true);
    try {
      const submissionsDetails = await axios.get(
        `/api/submission/${id || bounty?.id}/`,
        {
          params: {
            skip,
            take: length,
          },
        }
      );
      setTotalSubmissions(submissionsDetails.data.total);
      setSubmissions(submissionsDetails.data.data);
      setSelectedSubmission(submissionsDetails.data.data[0]);
      setIsBountyLoading(false);
    } catch (e) {
      setIsBountyLoading(false);
    }
  };

  const getBounty = async () => {
    setIsBountyLoading(true);
    try {
      const bountyDetails = await axios.get(`/api/bounties/${slug}/`);
      setBounty(bountyDetails.data);
      if (bountyDetails.data.sponsorId !== userInfo?.currentSponsorId) {
        router.push('/dashboard/bounties');
      }
      getSubmissions(bountyDetails.data.id);
      setRewards(Object.keys(bountyDetails.data.rewards || {}));
    } catch (e) {
      setIsBountyLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo?.currentSponsorId) {
      getBounty();
    }
  }, [userInfo?.currentSponsorId]);

  useEffect(() => {
    if (userInfo?.currentSponsorId && !isBountyLoading) {
      getSubmissions();
    }
  }, [skip]);

  const bountyStatus =
    // eslint-disable-next-line no-nested-ternary
    bounty?.status === 'OPEN'
      ? bounty?.isPublished
        ? 'PUBLISHED'
        : 'DRAFT'
      : 'CLOSED';

  const getBgColor = (status: String) => {
    switch (status) {
      case 'PUBLISHED':
        return 'green';
      case 'DRAFT':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const selectWinner = async (position: string, id: string | undefined) => {
    if (!id) return;
    setIsSelectingWinner(true);
    try {
      await axios.post(`/api/submission/update/`, {
        id,
        isWinner: !!position,
        winnerPosition: position || null,
      });
      const submissionIndex = submissions.findIndex((s) => s.id === id);
      if (submissionIndex >= 0) {
        const updatedSubmission: SubmissionWithUser = {
          ...(submissions[submissionIndex] as SubmissionWithUser),
          isWinner: !!position,
          winnerPosition: position || null,
        };
        const newSubmissions = [...submissions];
        newSubmissions[submissionIndex] = updatedSubmission;
        setSubmissions(newSubmissions);
        setSelectedSubmission(updatedSubmission);
      }
      setIsSelectingWinner(false);
    } catch (e) {
      console.log('file: [slug].tsx:136 ~ selectWinner ~ e:', e);
      setIsSelectingWinner(false);
    }
  };

  const exportSubmissionsCsv = async () => {
    setIsExporting(true);
    try {
      const exportURL = await axios.get(
        `/api/submission/${bounty?.id}/export/`
      );
      const url = exportURL?.data?.url || '';
      window.open(url, '_blank');
      setIsExporting(false);
    } catch (e) {
      setIsExporting(false);
    }
  };

  return (
    <Sidebar>
      {isBountyLoading ? (
        <LoadingSection />
      ) : (
        <>
          <Box mb={4}>
            <Breadcrumb color="brand.slate.400">
              <BreadcrumbItem>
                <NextLink href="/dashboard/bounties" passHref>
                  <BreadcrumbLink color="brand.slate.400">
                    <Flex align="center">
                      <ChevronLeftIcon mr={1} w={6} h={6} />
                      Bounties
                    </Flex>
                  </BreadcrumbLink>
                </NextLink>
              </BreadcrumbItem>

              <BreadcrumbItem>
                <Text color="brand.slate.400">Submissions</Text>
              </BreadcrumbItem>
            </Breadcrumb>
          </Box>
          <Flex justify="start" gap={2} mb={4}>
            <Text color="brand.slate.500" fontSize="lg" fontWeight="700">
              {bounty?.title}
            </Text>
            <Tag
              color={'white'}
              bg={getBgColor(bountyStatus)}
              size="sm"
              variant="solid"
            >
              {bountyStatus}
            </Tag>
          </Flex>
          <Flex align="center" justify="space-between" mb={4}>
            <Text color="brand.slate.500">
              {totalSubmissions}{' '}
              <Text as="span" color="brand.slate.400">
                Submissions
              </Text>
            </Text>
            <Button
              isLoading={isExporting}
              loadingText={'Exporting...'}
              onClick={() => exportSubmissionsCsv()}
              variant={'solid'}
            >
              Export Submissions CSV
            </Button>
          </Flex>
          {!submissions?.length ? (
            <ErrorSection
              title="No submissions found!"
              message="View your bounty submissions here once they are submitted"
            />
          ) : (
            <Flex align={'start'} bg="white">
              <Flex flex="1 1 auto" minW={{ base: 'none', md: 96 }}>
                <Box
                  w="full"
                  bg="white"
                  border="1px solid"
                  borderColor={'blackAlpha.200'}
                  roundedLeft="xl"
                >
                  {submissions.map((submission, submissionIndex) => {
                    return (
                      <Flex
                        key={submission?.id}
                        align={'center'}
                        justify={'space-between'}
                        gap={4}
                        px={4}
                        py={3}
                        bg={
                          selectedSubmission?.user?.id === submission?.user?.id
                            ? 'brand.slate.100'
                            : 'transparent'
                        }
                        borderBottom={
                          submissionIndex < submissions.length - 1
                            ? '1px solid'
                            : 'none'
                        }
                        borderBottomColor="blackAlpha.200"
                        _hover={{
                          backgroundColor: 'brand.slate.100',
                        }}
                        cursor="pointer"
                        onClick={() => {
                          setSelectedSubmission(submission);
                        }}
                      >
                        <Flex align="center">
                          {submission?.user?.photo ? (
                            <Image
                              boxSize="32px"
                              borderRadius="full"
                              alt={`${submission?.user?.firstName} ${submission?.user?.lastName}`}
                              src={submission?.user?.photo}
                            />
                          ) : (
                            <Avatar
                              name={`${submission?.user?.firstName} ${submission?.user?.lastName}`}
                              colors={['#92A1C6', '#F0AB3D', '#C271B4']}
                              size={32}
                              variant="marble"
                            />
                          )}
                          <Box display={{ base: 'none', md: 'block' }} ml={2}>
                            <Text color="brand.slate.800" fontSize="sm">
                              {`${submission?.user?.firstName} ${submission?.user?.lastName}`}
                            </Text>
                            <Text color="brand.slate.500" fontSize="xs">
                              {submission?.user?.email}
                            </Text>
                          </Box>
                        </Flex>
                        {submission?.isWinner && submission?.winnerPosition && (
                          <Tag colorScheme="green">
                            <TagLabel>
                              🏆: {submission?.winnerPosition || 'Winner'}
                            </TagLabel>
                          </Tag>
                        )}
                      </Flex>
                    );
                  })}
                </Box>
              </Flex>
              <Flex flex="4 1 auto">
                <Box
                  w="full"
                  bg="white"
                  border="1px solid"
                  borderColor="blackAlpha.200"
                  roundedRight="xl"
                >
                  <Flex
                    align="center"
                    justify={'space-between'}
                    w="full"
                    px={4}
                    py={3}
                    borderBottom="1px solid"
                    borderBottomColor="blackAlpha.200"
                  >
                    <Flex align="center">
                      {selectedSubmission?.user?.photo ? (
                        <Image
                          boxSize="32px"
                          borderRadius="full"
                          alt={`${selectedSubmission?.user?.firstName} ${selectedSubmission?.user?.lastName}`}
                          src={selectedSubmission?.user?.photo}
                        />
                      ) : (
                        <Avatar
                          name={`${selectedSubmission?.user?.firstName} ${selectedSubmission?.user?.lastName}`}
                          colors={['#92A1C6', '#F0AB3D', '#C271B4']}
                          size={32}
                          variant="marble"
                        />
                      )}
                      <Box display={{ base: 'none', md: 'block' }} ml={2}>
                        <Text color="brand.slate.800" fontSize="sm">
                          {`${selectedSubmission?.user?.firstName} ${selectedSubmission?.user?.lastName}`}
                        </Text>
                        <Text color="brand.slate.500" fontSize="xs">
                          {selectedSubmission?.user?.email}
                        </Text>
                      </Box>
                    </Flex>
                    <Flex align="center" justify={'flex-end'} gap={2}>
                      {isSelectingWinner && (
                        <Spinner color="brand.slate.400" size="sm" />
                      )}
                      <Select
                        maxW={48}
                        borderColor="brand.slate.300"
                        _placeholder={{
                          color: 'brand.slate.300',
                        }}
                        focusBorderColor="brand.purple"
                        onChange={(e) =>
                          selectWinner(e.target.value, selectedSubmission?.id)
                        }
                        value={
                          selectedSubmission?.isWinner
                            ? selectedSubmission?.winnerPosition || ''
                            : ''
                        }
                      >
                        <option value={''}>Select Winner</option>
                        {rewards.map((reward) => (
                          <option key={reward} value={reward}>
                            {reward}
                          </option>
                        ))}
                      </Select>
                    </Flex>
                  </Flex>
                  <Box w="full" px={4} py={5}>
                    {bounty?.type === 'open' && (
                      <>
                        <Box mb={4}>
                          <Text
                            mb={1}
                            color="brand.slate.400"
                            fontSize="xs"
                            fontWeight={600}
                            textTransform={'uppercase'}
                          >
                            Main Submission
                          </Text>
                          <Link
                            color="brand.purple"
                            wordBreak={'break-all'}
                            href={selectedSubmission?.link || '#'}
                            isExternal
                          >
                            {selectedSubmission?.link && (
                              <LinkIcon w={4} h={4} mr={2} />
                            )}
                            {selectedSubmission?.link || '-'}
                          </Link>
                        </Box>
                        <Box mb={4}>
                          <Text
                            mb={1}
                            color="brand.slate.400"
                            fontSize="xs"
                            fontWeight={600}
                            textTransform={'uppercase'}
                          >
                            Tweet Link
                          </Text>
                          <Link
                            color="brand.purple"
                            wordBreak={'break-all'}
                            href={selectedSubmission?.tweet || '#'}
                            isExternal
                          >
                            {selectedSubmission?.tweet && (
                              <LinkIcon w={4} h={4} mr={2} />
                            )}
                            {selectedSubmission?.tweet || '-'}
                          </Link>
                        </Box>
                      </>
                    )}
                    {bounty?.type === 'permissioned' &&
                      selectedSubmission?.eligibilityAnswers?.map(
                        (answer: any, answerIndex: number) => (
                          <Box key={answerIndex} mb={4}>
                            <Text
                              mb={1}
                              color="brand.slate.400"
                              fontSize="xs"
                              fontWeight={600}
                              textTransform={'uppercase'}
                            >
                              {answer.question}
                            </Text>
                            <Text
                              color="brand.slate.700"
                              wordBreak={'break-all'}
                            >
                              {answer.answer || '-'}
                            </Text>
                          </Box>
                        )
                      )}
                    <Box mb={4}>
                      <Text
                        mb={2}
                        color="brand.slate.400"
                        fontSize="xs"
                        fontWeight={600}
                        textTransform={'uppercase'}
                      >
                        User Profile
                      </Text>
                      <Flex
                        align="start"
                        justify="start"
                        gap={2}
                        mb={4}
                        fontSize="sm"
                      >
                        <Text w={20} color="brand.slate.400">
                          Bio:
                        </Text>
                        <Text color="brand.slate.700">
                          {selectedSubmission?.user?.bio || '-'}
                        </Text>
                      </Flex>
                      <Flex
                        align="center"
                        justify="start"
                        gap={2}
                        mb={4}
                        fontSize="sm"
                      >
                        <Text w={20} color="brand.slate.400">
                          Wallet:
                        </Text>
                        <Text color="brand.slate.700">
                          {truncatePublicKey(
                            selectedSubmission?.user?.publicKey
                          )}
                          <Tooltip label="Copy Wallet ID" placement="right">
                            <CopyIcon
                              cursor="pointer"
                              ml={1}
                              onClick={() =>
                                navigator.clipboard.writeText(
                                  selectedSubmission?.user?.publicKey || ''
                                )
                              }
                            />
                          </Tooltip>
                        </Text>
                      </Flex>
                      <Flex
                        align="center"
                        justify="start"
                        gap={2}
                        mb={4}
                        fontSize="sm"
                      >
                        <Text w={20} color="brand.slate.400">
                          Discord:
                        </Text>
                        <Text color="brand.slate.700">
                          {selectedSubmission?.user?.discord || '-'}
                        </Text>
                      </Flex>
                      <Flex
                        align="center"
                        justify="start"
                        gap={2}
                        mb={4}
                        fontSize="sm"
                      >
                        <Text w={20} color="brand.slate.400">
                          Twitter:
                        </Text>
                        <Link
                          color="brand.slate.700"
                          href={selectedSubmission?.user?.twitter || undefined}
                          isExternal
                        >
                          {selectedSubmission?.user?.twitter || '-'}
                        </Link>
                      </Flex>
                      <Flex
                        align="center"
                        justify="start"
                        gap={2}
                        mb={4}
                        fontSize="sm"
                      >
                        <Text w={20} color="brand.slate.400">
                          LinkedIn:
                        </Text>
                        <Link
                          color="brand.slate.700"
                          href={selectedSubmission?.user?.linkedin || undefined}
                          isExternal
                        >
                          {selectedSubmission?.user?.linkedin
                            ? `${selectedSubmission?.user?.linkedin?.slice(
                                0,
                                25
                              )}${
                                selectedSubmission?.user?.linkedin?.length >=
                                  25 && '...'
                              }` || '-'
                            : '-'}
                        </Link>
                      </Flex>
                      <Flex
                        align="center"
                        justify="start"
                        gap={2}
                        mb={4}
                        fontSize="sm"
                      >
                        <Text w={20} color="brand.slate.400">
                          GitHub:
                        </Text>
                        <Link
                          color="brand.slate.700"
                          href={selectedSubmission?.user?.github || undefined}
                          isExternal
                        >
                          {selectedSubmission?.user?.github || '-'}
                        </Link>
                      </Flex>
                      <Flex
                        align="center"
                        justify="start"
                        gap={2}
                        mb={4}
                        fontSize="sm"
                      >
                        <Text w={20} color="brand.slate.400">
                          Website:
                        </Text>
                        <Link
                          color="brand.slate.700"
                          href={selectedSubmission?.user?.website || undefined}
                          isExternal
                        >
                          {selectedSubmission?.user?.website || '-'}
                        </Link>
                      </Flex>
                    </Box>
                  </Box>
                </Box>
              </Flex>
            </Flex>
          )}
          <Flex align="center" justify="start" gap={4} mt={4}>
            <Button
              isDisabled={skip <= 0}
              leftIcon={<ChevronLeftIcon w={5} h={5} />}
              onClick={() =>
                skip >= length ? setSkip(skip - length) : setSkip(0)
              }
              size="sm"
              variant="outline"
            >
              Previous
            </Button>
            <Text color="brand.slate.400" fontSize="sm">
              <Text as="span" fontWeight={700}>
                {skip + 1}
              </Text>{' '}
              -{' '}
              <Text as="span" fontWeight={700}>
                {Math.min(skip + length, totalSubmissions)}
              </Text>{' '}
              of{' '}
              <Text as="span" fontWeight={700}>
                {totalSubmissions}
              </Text>{' '}
              Bounties
            </Text>
            <Button
              isDisabled={
                totalSubmissions < skip + length ||
                (skip > 0 && skip % length !== 0)
              }
              onClick={() => skip % length === 0 && setSkip(skip + length)}
              rightIcon={<ChevronRightIcon w={5} h={5} />}
              size="sm"
              variant="outline"
            >
              Next
            </Button>
          </Flex>
        </>
      )}
    </Sidebar>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.query;
  return {
    props: { slug },
  };
};

export default BountySubmissions;