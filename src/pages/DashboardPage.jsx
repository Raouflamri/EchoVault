import React, { useState, useEffect } from 'react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { Input } from '@/components/ui/input';
    import { Badge } from '@/components/ui/badge';
    import { AlertCircle, Search, SlidersHorizontal, Trash2, LogIn } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import {
      AlertDialog,
      AlertDialogAction,
      AlertDialogCancel,
      AlertDialogContent,
      AlertDialogDescription,
      AlertDialogFooter,
      AlertDialogHeader,
      AlertDialogTitle,
      AlertDialogTrigger,
    } from "@/components/ui/alert-dialog";
    import { supabase } from '@/lib/supabaseClient';

    const DashboardPage = () => {
      const [entries, setEntries] = useState([]);
      const [searchTerm, setSearchTerm] = useState('');
      const [viewMode, setViewMode] = useState('timeline');
      const [user, setUser] = useState(null);
      const [loading, setLoading] = useState(true);
      const { toast } = useToast();

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
          setUser(session?.user ?? null);
          if (session?.user) {
            fetchEntries(session.user.id);
          } else {
            setEntries([]);
            setLoading(false);
          }
        });

        return () => {
          authListener?.subscription.unsubscribe();
        };
      }, []);

      const fetchEntries = async (userId) => {
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
      };

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
          setEntries(entries.filter(entry => entry.id !== id));
          toast({
            title: "Entry Deleted",
            description: "Your memory entry has been successfully deleted.",
          });
        }
      };
      
      const handleLogin = async () => {
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google', // Or any other provider like 'github', 'gitlab', etc.
          });
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
        return <div className="flex justify-center items-center h-full"><p className="text-xl text-primary">Loading your memories...</p></div>;
      }

      if (!user) {
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glassmorphism p-8 rounded-lg shadow-xl max-w-md"
            >
              <LogIn className="h-16 w-16 text-primary mx-auto mb-6" />
              <h1 className="text-3xl font-bold mb-4 futuristic-gradient-text">Welcome to EchoVault</h1>
              <p className="text-slate-300 mb-8">
                Please log in to securely store and access your memories across devices.
              </p>
              <Button onClick={handleLogin} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3">
                Log In with Google
              </Button>
               <p className="text-xs text-slate-500 mt-4">Other login options coming soon!</p>
            </motion.div>
          </div>
        );
      }


      return (
        <div className="space-y-8 p-2 md:p-0">
          <motion.h1 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-bold mb-8 futuristic-gradient-text"
          >
            Memory Stream
          </motion.h1>

          <AiSuggestion />

          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search memories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700 focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="flex space-x-2">
              <Button variant={viewMode === 'timeline' ? 'default' : 'outline'} onClick={() => setViewMode('timeline')} className="border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Timeline
              </Button>
              <Button variant={viewMode === 'mindmap' ? 'default' : 'outline'} onClick={() => setViewMode('mindmap')} className="border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Mind Map
              </Button>
              <Button variant="ghost" size="icon">
                <SlidersHorizontal className="h-5 w-5 text-slate-400 hover:text-primary" />
              </Button>
            </div>
          </div>
          
          {filteredEntries.length === 0 && !loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <img  alt="Empty state illustration" className="mx-auto mb-4 w-40 h-40 opacity-50" src="https://images.unsplash.com/photo-1702450900389-1227335cd2c4" />
              <p className="text-xl text-slate-400">Your vault is quiet. Time to add some memories!</p>
            </motion.div>
          )}

          {viewMode === 'timeline' && (
            <div className="space-y-6">
              {filteredEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="glassmorphism shadow-xl hover:shadow-primary/30 transition-shadow duration-300">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-2xl font-semibold text-primary glowing-text">
                          {new Date(entry.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </CardTitle>
                         <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive/70 hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-slate-900 border-slate-700">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-primary">Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription className="text-slate-300">
                                This action cannot be undone. This will permanently delete this memory entry.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-slate-600 hover:bg-slate-700">Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteEntry(entry.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      <CardDescription className="text-slate-400">
                        {new Date(entry.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-200 whitespace-pre-wrap">{entry.content}</p>
                    </CardContent>
                    {entry.tags && entry.tags.length > 0 && (
                      <CardFooter className="flex flex-wrap gap-2 pt-4">
                        {entry.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 cursor-pointer">
                            {tag}
                          </Badge>
                        ))}
                      </CardFooter>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {viewMode === 'mindmap' && (
            <div className="p-6 border border-dashed border-primary/30 rounded-lg glassmorphism text-center h-96 flex items-center justify-center">
              <p className="text-slate-400 text-lg">Mind Map view coming soon! Visualise your connected thoughts.</p>
            </div>
          )}
        </div>
      );
    };

    export default DashboardPage;