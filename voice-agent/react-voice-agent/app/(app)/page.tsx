

import {Navbar} from '../components/Navbar';
import PastCallsDashboard from '../components/PastCallsDashboard';

import WelcomeMessage from '../components/WelcomeMessage';
import AudioAgent from '../components/AudioAgent';
import { auth } from '@/lib/auth';
import SignInPage from '../signin/page';

export default async function Page() {
  const session = await auth()

  if(!session){
    return <div className='flex h-screen flex-col items-center justify-center'>
      <div className='mb-16 text-4xl font-extrabold'>
       
      <div>Sign In</div>
        </div>
      <SignInPage />
      </div>
  }
  else{
    return <div className='h-screen flex flex-col'>
  <Navbar />
  <WelcomeMessage />
  <PastCallsDashboard />
  
  <AudioAgent />
</div>


  }

  
}
