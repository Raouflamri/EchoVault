import React, { useState, useEffect, useRef } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Textarea } from '@/components/ui/textarea';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { useToast } from '@/components/ui/use-toast';
    import { Badge } from '@/components/ui/badge';
    import { X, Mic, Save, Tag, LogIn, Square, Play } from 'lucide-react';
    import { supabase } from '@/lib/supabaseClient';
    import AuthNeeded from '@/components/dashboard/AuthNeeded';

    const AddEntryPage = () => {
      const [content, setContent] = useState('');
      const [tags, setTags] = useState([]);
      const [currentTag, setCurrentTag] = useState('');
      const [user, setUser] = useState(null);
      const [loading, setLoading] = useState(true);
      const navigate = useNavigate();
      const { toast } = useToast();

      const [isRecording, setIsRecording] = useState(false);
      const [audioURL, setAudioURL] = useState('');
      const [audioBlob, setAudioBlob] = useState(null);
      const mediaRecorderRef = useRef(null);
      const audioChunksRef = useRef([]);

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

      const handleStartRecording = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaRecorderRef.current = new MediaRecorder(stream);
          audioChunksRef.current = [];

          mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
          };

          mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            setAudioBlob(audioBlob);
            const audioUrl = URL.createObjectURL(audioBlob);
            setAudioURL(audioUrl);
            // For now, let's add a placeholder to content if user recorded audio
            if (!content.trim()) {
              setContent(prev => prev + (prev ? '\n' : '') + '[Audio Recording Attached]');
            }
          };

          mediaRecorderRef.current.start();
          setIsRecording(true);
          toast({ title: "Recording Started", description: "Speak your thoughts." });
        } catch (err) {
          console.error("Error accessing microphone:", err);
          toast({ title: "Microphone Error", description: "Could not access microphone. Please check permissions.", variant: "destructive" });
        }
      };

      const handleStopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop()); // Stop microphone access
        }
        setIsRecording(false);
        toast({ title: "Recording Stopped", description: "Audio captured." });
      };
      
      const handleToggleRecording = () => {
        if (isRecording) {
          handleStopRecording();
        } else {
          handleStartRecording();
        }
      };


      const handleAddTag = () => {
        if (currentTag.trim() && !tags.includes(currentTag.trim().toLowerCase())) {
          setTags([...tags, currentTag.trim().toLowerCase()]);
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

        if (!content.trim() && !audioBlob) {
          toast({
            title: "Content Required",
            description: "Your memory entry cannot be empty and no audio recorded.",
            variant: "destructive",
          });
          return;
        }
        
        let audioFileName = null;
        if (audioBlob) {
          // In a real app, you'd upload the audioBlob to Supabase Storage
          // For now, we'll just note its presence.
          // Example: audioFileName = `audio_${user.id}_${Date.now()}.webm`;
          // const { data: uploadData, error: uploadError } = await supabase.storage
          //   .from('audio_entries')
          //   .upload(audioFileName, audioBlob);
          // if (uploadError) { ... handle error ... }
          console.log("Audio blob ready for upload (not implemented in this step):", audioBlob);
          toast({ title: "Audio Ready", description: "Audio recording is ready (upload not implemented yet)." });
        }


        const newEntry = {
          user_id: user.id,
          date: new Date().toISOString(),
          content: content.trim(),
          tags: tags,
          // audio_file: audioFileName, // Store the path to the audio file in Supabase Storage
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
          setContent('');
          setTags([]);
          setAudioURL('');
          setAudioBlob(null);
          navigate('/');
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
        return <div className="flex justify-center items-center h-64"><p className="text-lg text-primary">Loading...</p></div>;
      }

      if (!user) {
        return <AuthNeeded onLogin={handleLogin} />;
      }

      return (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto p-1 md:p-0"
        >
          <h1 className="text-3xl font-semibold mb-6 text-foreground">Capture a New Memory</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <Label htmlFor="content" className="text-sm font-medium text-foreground">Your Thoughts, Ideas, or Dreams</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind? Speak or type freely..."
                rows={8}
                className="bg-card border-border focus:ring-primary focus:border-primary text-foreground text-sm p-3 rounded-md shadow-sm"
              />
            </div>

            {audioURL && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">Recorded Audio</Label>
                <audio src={audioURL} controls className="w-full" />
                <Button variant="link" size="sm" onClick={() => { setAudioURL(''); setAudioBlob(null); setContent(content.replace('[Audio Recording Attached]', '').trim())}} className="text-destructive p-0 h-auto">Remove Audio</Button>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="tags" className="text-sm font-medium text-foreground">Tags (Emotions, Topics, Keywords)</Label>
              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="tags"
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); handleAddTag(); }}}
                  placeholder="Add a tag and press Enter or comma"
                  className="h-9 bg-card border-border focus:ring-primary focus:border-primary text-foreground text-sm"
                />
                <Button type="button" onClick={handleAddTag} variant="outline" size="sm" className="text-primary border-primary/50 hover:bg-primary/10">Add Tag</Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs py-1 px-2.5">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1.5 hover:text-destructive">
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-3 pt-3">
               <Button 
                type="button" 
                variant={isRecording ? "destructive" : "outline"} 
                onClick={handleToggleRecording}
                className="w-full sm:w-auto flex items-center justify-center space-x-2"
              >
                {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                <span>{isRecording ? 'Stop Recording' : 'Record Voice'}</span>
              </Button>
              <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center space-x-2">
                <Save className="h-4 w-4" />
                <span>Save to Vault</span>
              </Button>
            </div>
          </form>
        </motion.div>
      );
    };

    export default AddEntryPage;