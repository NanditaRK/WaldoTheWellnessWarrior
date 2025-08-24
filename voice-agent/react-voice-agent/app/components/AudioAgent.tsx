

import { headers } from 'next/headers';
import { App } from '@/components/app';
import { getAppConfig } from '@/lib/utils';



export default async function AudioAgent() {
  const hdrs = await headers();
  const appConfig = await getAppConfig(hdrs);


  return (
<div className='flex-1 my-8 mx-auto'>
    <App appConfig={appConfig} />
  </div>

  )
}
