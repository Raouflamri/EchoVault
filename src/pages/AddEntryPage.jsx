import React, { useState, useEffect } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Textarea } from '@/components/ui/textarea';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { useToast } from '@/components/ui/use-toast';
    import { Badge } from '@/components/ui/badge';
    import { X, Mic, Save, Tag, LogIn } from 'lucide-react';
    import { supabase } from '@/lib/supabaseClient';

    const AddEntryPage = () => {
      const [content, setContent] = useState('');
      const [tags, setTags] = useState([]);
      const [currentTag, setCurrentTag] = useState('');
      const [user, setUser] = useState(null);
      const [loading, setLoading] = useState(true);
      const navigate = useNavigate();
      const { toast } = useToast();

      useEffect(() => {
        const checkUser = async () => {
          const { data: { session } } = await supabase.auth.getSession();
          setUser(session?.user ?? null);
          setLoading(false);
        };
        checkUser();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user ?? null);
          setLoading(false);
        });

        return () => {
          authListener?.subscription.unsubscribe();
        };
      }, []);

      const handleAddTag = () => {
        if (currentTag && !tags.includes(currentTag.trim())) {
          setTags([...tags, currentTag.trim()]);
          setCurrentTag('');
        }
      };

      const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
          toast({
            title: "Not Logged In",
            description: "Please log in to save your memories.",
            variant: "destructive",
          });
          return;
        }

        if (!content.trim()) {
          toast({
            title: "Uh oh!",
            description: "Content cannot be empty.",
            variant: "destructive",
          });
          return;
        }

        const newEntry = {
          user_id: user.id,
          date: new Date().toISOString(),
          content: content.trim(),
          tags: tags,
        };

        const { error } = await supabase.from('entries').insert([newEntry]);

        if (error) {
          toast({
            title: "Error Saving Memory",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Memory Saved!",
            description: "Your new entry has been securely stored in the vault.",
          });
          navigate('/');
        }
      };
      
      const handleLogin = async () => {
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
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
        return <div className="flex justify-center items-center h-full"><p className="text-xl text-primary">Loading...</p></div>;
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
              <h1 className="text-3xl font-bold mb-4 futuristic-gradient-text">Secure Your Thoughts</h1>
              <p className="text-slate-300 mb-8">
                Log in to add new memories to your EchoVault. Your data will be saved securely.
              </p>
              <Button onClick={handleLogin} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3">
                Log In with Google
              </Button>
              <p className="text-xs text-slate-500 mt-4">Ensure you're logged in to keep your memories safe.</p>
            </motion.div>
          </div>
        );
      }


      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto p-2 md:p-0"
        >
          <h1 className="text-4xl font-bold mb-8 futuristic-gradient-text">Capture a New Memory</h1>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="content" className="text-lg text-slate-300">Your Thoughts, Ideas, or Dreams</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind? Speak or type freely..."
                rows={10}
                className="bg-slate-800/50 border-slate-700 focus:ring-primary focus:border-primary text-slate-100 text-base p-4 rounded-lg shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags" className="text-lg text-slate-300">Tags (Emotions, Topics, Keywords)</Label>
              <div className="flex items-center space-x-2">
                <Tag className="h-5 w-5 text-slate-400" />
                <Input
                  id="tags"
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); handleAddTag(); }}}
                  placeholder="Add a tag and press Enter or comma"
                  className="bg-slate-800/50 border-slate-700 focus:ring-primary focus:border-primary text-slate-100"
                />
                <Button type="button" onClick={handleAddTag} variant="outline" className="border-primary text-primary hover:bg-primary/10">Add Tag</Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="bg-primary/20 text-primary border-primary/30 text-sm py-1 px-3">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-2 hover:text-red-400">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
              <Button type="button" variant="outline" className="w-full sm:w-auto border-primary text-primary hover:bg-primary/10 flex items-center justify-center space-x-2">
                <Mic className="h-5 w-5" />
                <span>Record Voice (Soon)</span>
              </Button>
              <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center space-x-2">
                <Save className="h-5 w-5" />
                <span>Save to Vault</span>
              </Button>
            </div>
          </form>
        </motion.div>
      );
    };

    export default AddEntryPage;