import React, { useState, useEffect } from 'react';
    import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
    import { Toaster } from '@/components/ui/toaster';
    import { ThemeProvider } from '@/components/ThemeProvider';
    import DashboardPage from '@/pages/DashboardPage';
    import AddEntryPage from '@/pages/AddEntryPage';
    import SettingsPage from '@/pages/SettingsPage';
    import Layout from '@/components/Layout';
    import { supabase } from '@/lib/supabaseClient';


    function App() {
      const [session, setSession] = useState(null);

      useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          setSession(session);
        });

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          setSession(session);
        });

        return () => subscription.unsubscribe();
      }, []);

      return (
        <ThemeProvider defaultTheme="dark" storageKey="echovault-theme">
          <Router>
            <Layout session={session}>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/add-entry" element={<AddEntryPage />} />
                <Route path="/settings" element={<SettingsPage session={session} />} />
              </Routes>
            </Layout>
            <Toaster />
          </Router>
        </ThemeProvider>
      );
    }

    export default App;