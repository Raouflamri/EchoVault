import React, { useState, useEffect, useCallback } from 'react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Search, SlidersHorizontal } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/supabaseClient';
    import EntryCard from '@/components/dashboard/EntryCard';
    import EmptyState from '@/components/dashboard/EmptyState';
    import AuthNeeded from '@/components/dashboard/AuthNeeded';

    const DashboardPage = () => {
      const [entries, setEntries] = useState([]);
      const [searchTerm, setSearchTerm] = useState('');
      const [viewMode, setViewMode] = useState('timeline'); 
      const [user, setUser] = useState(null);
      const [loading, setLoading] = useState(true);
      const { toast } = useToast();

      const fetchEntries = useCallback(async (userId) => {
        setLoading(true);
        const { data, error } = await supabase
          .from('entries')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });

        if (error) {
          console.error('Error fetching entries:', error);
          toast({
            title: "Error",
            description: "Could not fetch your memories. " + error.message,
            variant: "destructive",
          });
        } else {
          setEntries(data || []);
        }
        setLoading(false);
      }, [toast]);

      useEffect(() => {
        const checkUser = async () => {
          const { data: { session } } = await supabase.auth.getSession();
          setUser(session?.user ?? null);
          if (session?.user) {
            fetchEntries(session.user.id);
          } else {
            setLoading(false);
          }
        };

        checkUser();
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
          const currentUser = session?.user ?? null;
          setUser(currentUser);
          if (currentUser) {
            fetchEntries(currentUser.id);
          } else {
            setEntries([]);
            setLoading(false);
          }
        });

        return () => {
          authListener?.subscription.unsubscribe();
        };
      }, [fetchEntries]);

      const filteredEntries = entries.filter(entry =>
        entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );

      const handleDeleteEntry = async (id) => {
        const { error } = await supabase
          .from('entries')
          .delete()
          .eq('id', id);

        if (error) {
          toast({
            title: "Error Deleting Entry",
            description: error.message,
            variant: "destructive",
          });
        } else {
          setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
          toast({
            title: "Entry Deleted",
            description: "Your memory entry has been successfully deleted.",
          });
        }
      };
      
      const handleLogin = async () => {
        try {
          const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
          if (error) throw error;
        } catch (error) {
          toast({
            title: "Login Failed",
            description: error.error_description || error.message,
            variant: "destructive",
          });
        }
      };

      if (loading) {
        return <div className="flex justify-center items-center h-64"><p className="text-lg text-primary">Loading your memories...</p></div>;
      }

      if (!user) {
        return <AuthNeeded onLogin={handleLogin} />;
      }

      return (
        <div className="space-y-6 p-1 md:p-0">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-semibold text-foreground"
          >
            Memory Stream
          </motion.h1>

          <div className="flex flex-col sm:flex-row justify-between items-center mb-5 space-y-3 sm:space-y-0">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search memories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9 text-sm bg-card border-border focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="flex space-x-1.5">
              <Button variant={viewMode === 'timeline' ? 'secondary' : 'ghost'} onClick={() => setViewMode('timeline')} size="sm">
                Timeline
              </Button>
              <Button variant={viewMode === 'mindmap' ? 'secondary' : 'ghost'} onClick={() => setViewMode('mindmap')} size="sm">
                Mind Map
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </Button>
            </div>
          </div>
          
          {filteredEntries.length === 0 && !loading && (
            <EmptyState />
          )}

          {viewMode === 'timeline' && (
            <div className="space-y-4">
              {filteredEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                  <EntryCard entry={entry} onDelete={handleDeleteEntry} />
                </motion.div>
              ))}
            </div>
          )}

          {viewMode === 'mindmap' && (
            <div className="p-5 border border-dashed border-border rounded-lg bg-card text-center h-80 flex items-center justify-center">
              <p className="text-muted-foreground text-md">Mind Map view coming soon! Visualise your connected thoughts.</p>
            </div>
          )}
        </div>
      );
    };

    export default DashboardPage;