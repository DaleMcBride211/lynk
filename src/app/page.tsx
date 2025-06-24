
'use client'
import MainPage from '@/components/mainpage'
import { useState, useEffect } from 'react'
import { supabase } from "@/supabase-client"
import Auth from "@/components/auth"
import { Button } from "@/components/ui/button"

function page() {
  const [session, setSession] = useState<any>(null);

  const fetchSession = async () => {
    const currentSession = await supabase.auth.getSession();
    console.log(currentSession);
    setSession(currentSession.data.session)
  }

  useEffect(() => {
    fetchSession();
  }, [])

  const logout = async () => {
    await supabase.auth.signOut();
  }
  return (
    <>
    {session ? (
      <>
        <Button onClick={logout}>LogOut</Button>
        <MainPage />
      </>

    ) : (
      <Auth />
    )}
    </>
  )
}

export default page