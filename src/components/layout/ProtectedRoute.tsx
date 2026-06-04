import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../../supabaseClient";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [profileRole, setProfileRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user?.id) {
        const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
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
      setSession(session);
      if (session?.user?.id) {
        const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
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

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Restrict based on profile role, fallback to metadata if profile not fetched yet
  const isFounderEmail = session.user?.email?.toLowerCase().trim() === 'sudhamshu1411@gmail.com';
  const role = isFounderEmail ? 'founder' : (profileRole || session.user?.user_metadata?.role);

  if (role === "new user" && location.pathname !== "/dashboard" && location.pathname !== "/login") {
    // Only founders can access founder dashboard
    if (location.pathname.startsWith('/founder')) return <Navigate to="/dashboard" replace />;
    if (location.pathname.startsWith('/admin')) return <Navigate to="/dashboard" replace />;
    if (location.pathname.startsWith('/faculty')) return <Navigate to="/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  
  if (location.pathname.startsWith('/founder') && role !== 'founder') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
