import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { isUserEmailVerified } from "../../lib/supabase";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [profileRole, setProfileRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session && !isUserEmailVerified(session.user)) {
        await supabase.auth.signOut();
        setSession(null);
        setLoading(false);
        return;
      }
      setSession(session);
      if (session?.user?.id) {
        const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
        if (data) setProfileRole(data.role);
      }
      setLoading(false);
    }).catch(err => {
      console.error("Supabase getSession error:", err);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session && !isUserEmailVerified(session.user)) {
        setSession(null);
        setProfileRole(null);
        return;
      }
      setSession(session);
      if (session?.user?.id) {
        const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
        if (data) setProfileRole(data.role);
      } else {
        setProfileRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session || !isUserEmailVerified(session.user)) {
    return <Navigate to="/login" replace />;
  }

  // Restrict based on profile role, fallback to metadata if profile not fetched yet
  const isFounderEmail = session.user?.email?.toLowerCase().trim() === 'sudhamshu1411@gmail.com';
  const role = isFounderEmail ? 'founder' : (profileRole || session.user?.user_metadata?.role);

  if (role === "new user" && location.pathname !== "/dashboard" && location.pathname !== "/login") {
    return <Navigate to="/dashboard" replace />;
  }

  if (location.pathname.startsWith('/founder') && role !== 'founder') {
    return <Navigate to="/dashboard" replace />;
  }

  if (location.pathname.startsWith('/admin') && role !== 'admin' && role !== 'founder') {
    return <Navigate to="/dashboard" replace />;
  }

  if (location.pathname.startsWith('/faculty') && role !== 'faculty' && role !== 'founder' && role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
