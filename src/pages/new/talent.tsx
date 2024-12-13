import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { create } from 'zustand';

import { Steps } from '@/components/shared/steps';
import { AboutYou, type UserStoreType, YourLinks } from '@/features/talent';
import { Default } from '@/layouts/Default';
import { Meta } from '@/layouts/Meta';
import { useUser } from '@/store/user';

const useFormStore = create<UserStoreType>()((set) => ({
  form: {
    username: '',
    location: undefined,
    photo: '',
    skills: [],
    discord: '',
    twitter: '',
    github: '',
    linkedin: '',
    website: '',
    telegram: '',
    publicKey: '',
    firstName: '',
    lastName: '',
  },
  emailVerified: false,
  updateState: (data) => {
    set((state) => {
      state.form = { ...state.form, ...data };
      return { ...state };
    });
  },
}));

const StepsCon = () => {
  const [currentStep, setSteps] = useState<number>(1);
  const stepList = [
    {
      label: 'About You',
      number: 1,
    },
    {
      label: 'Links',
      number: 2,
    },
  ];

  const router = useRouter();
  const { user } = useUser();
  const isForcedRedirect = useMemo(() => {
    return router.query.type === 'forced';
  }, [router, user]);

  const TitleArray = [
    {
      title: isForcedRedirect ? 'Finish Your Profile' : 'Create Your Profile',
      subTitle: isForcedRedirect
        ? 'It takes less than a minute to start earning in global standards. '
        : "If you're ready to start contributing to crypto projects, you're in the right place.",
    },
    {
      title: 'Socials & Proof of Work',
      subTitle: 'Where can people learn more about your work?',
    },
  ];

  return (
    <div className="flex w-auto flex-col gap-4 px-4 md:w-[36rem]">
      <div className="mt-8 flex flex-col gap-2">
        <h1 className="font-sans text-lg font-bold text-[#334254] md:text-2xl">
          {TitleArray[currentStep - 1]?.title}
        </h1>
        <p className="text-center text-base font-medium text-[#94A3B8] md:text-lg">
          {TitleArray[currentStep - 1]?.subTitle}
        </p>
      </div>
      <div className="flex w-full items-center gap-2 px-4 md:px-0">
        {stepList.map((step, stepIndex) => {
          return (
            <Fragment key={stepIndex}>
              <Steps
                setStep={setSteps}
                currentStep={currentStep}
                label={step.label}
                thisStep={step.number}
              />
              {step.number !== stepList.length && (
                <hr
                  style={{
                    width: '100%',
                    outline:
                      currentStep >= step.number
                        ? '1px solid #6562FF'
                        : '1px solid #CBD5E1',
                    border: 'none',
                  }}
                />
              )}
            </Fragment>
          );
        })}
      </div>
      {currentStep === 1 && (
        <AboutYou setStep={setSteps} useFormStore={useFormStore} />
      )}
      {currentStep === 2 && (
        <YourLinks setStep={setSteps} useFormStore={useFormStore} />
      )}
    </div>
  );
};

export default function Talent() {
  const { user } = useUser();
  const { status } = useSession();

  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && user && user?.isTalentFilled) {
      const originUrl = params.get('originUrl');
      if (!!originUrl && typeof originUrl === 'string') {
        router.push(originUrl);
      } else {
        router.push('/');
      }
    }
  }, [user, router]);

  return (
    <Default
      meta={
        <Meta
          title="Create Your Profile to Access Bounties & Grants | Superteam Earn"
          description="Become part of Superteam's talent network, where you can present your skills and collaborate on various crypto bounties, grants, and projects."
          canonical="https://earn.superteam.fun/new/talent/"
        />
      }
    >
      <div className="flex flex-col items-center justify-center gap-2">
        <StepsCon />
      </div>
    </Default>
  );
}
