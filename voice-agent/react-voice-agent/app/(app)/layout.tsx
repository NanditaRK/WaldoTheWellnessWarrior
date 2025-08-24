import { headers } from 'next/headers';
import { getAppConfig } from '@/lib/utils';
import { SessionProvider } from 'next-auth/react';
interface AppLayoutProps {
  children: React.ReactNode;
}

export default async function AppLayout({ children }: AppLayoutProps) {
  const hdrs = await headers();
  const { companyName, logo, logoDark } = await getAppConfig(hdrs);

  return (
    <>
      <SessionProvider>
      {children}
      </SessionProvider>
    </>
  );
}
