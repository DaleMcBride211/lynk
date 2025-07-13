'use client'
import { useState, useEffect } from 'react'
import { supabase } from "@/supabase-client"
import HomePage from '@/components/homepage'



function Page() {
  const [session, setSession] = useState<any>(null);

  const fetchSession = async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    setSession(currentSession);
  }

  useEffect(() => {
    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe(); 
    };
  }, []);

  // This function will be called by the Header when logout is successful
  const handleLogoutSuccess = () => {
    setSession(null); // Explicitly clear the session state to trigger re-render
  };

  return (
    <>
        <HomePage />
    </>
  )
}

export default Page;