import { useRouter } from 'next/router' 
import { useEffect, useState } from 'react';
export default function Checkout () {
  const router = useRouter();
  const [successState, setSuccess] = useState(false)
  useEffect(() => {
    const {session_id, success, canceled} = router.query;
    if(!success && !canceled && router.isReady) {
      router.push('/dashboard');
    }
    if(success){
      setSuccess(true);
    }

  },[router.isReady])

  return(
    <div>
      {router.isReady ? (<>
        {successState == true? (
          <span>Sucesso, agora vc é premium</span>
        ):(
          <span>Cancelou pq é cuzao</span>
        )}
      </>):(
        <>...</>
      )}
    </div>
  )
}