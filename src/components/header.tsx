'use client'
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from "@/supabase-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from 'next/link';

// 1. Import the Session type directly from Supabase
import { Session } from '@supabase/supabase-js'; // Or '@supabase/auth-js', depending on your exact setup

function Header() {
  // 2. Use the imported Session type
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const fetchAndSetSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      console.log(session);
    };

    fetchAndSetSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const handleLogoutClick = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 bg-gradient-to-r from-purple-800 to-indigo-700 text-white shadow-lg">
      <Link href="/">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src="lynklogo.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <span className="text-3xl font-extrabold tracking-tight">
            Lynk
          </span>
        </div>
      </Link>

      <div>
        {session ? (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-indigo-100 hidden sm:block">
              Welcome, {session.user?.email || 'User'}!
            </span>
            <Link href="/notes">
              <Button variant="secondary" className="hover:bg-purple-700 cursor-pointer">To Tasks</Button>
            </Link>
            <Button onClick={handleLogoutClick} variant="secondary" className="hover:bg-purple-700 cursor-pointer">
              Log Out
            </Button>
          </div>
        ) : (
          <div>
            <Link href='/signin'>
              <Button className="hover: cursor-pointer">
                Log In
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;