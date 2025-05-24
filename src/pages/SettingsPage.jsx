import React from 'react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Switch } from '@/components/ui/switch';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Bell, Palette, ShieldCheck, UploadCloud as CloudUpload, Headphones, Moon, Sun, LogIn, LogOut, UserCircle } from 'lucide-react';
    import { useTheme } from '@/components/ThemeProvider';
    import { supabase } from '@/lib/supabaseClient';
    import { useToast } from '@/components/ui/use-toast';

    const SettingsPage = ({ session }) => {
      const { theme, setTheme } = useTheme();
      const { toast } = useToast();

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
    
      const handleLogout = async () => {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          toast({
            title: "Logged Out",
            description: "You have been successfully logged out.",
          });
        } catch (error) {
          toast({
            title: "Logout Failed",
            description: error.error_description || error.message,
            variant: "destructive",
          });
        }
      };

      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto p-2 md:p-0"
        >
          <h1 className="text-4xl font-bold mb-8 futuristic-gradient-text">Settings</h1>

          <div className="space-y-8">
            <Card className="glassmorphism shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-primary glowing-text flex items-center">
                  <UserCircle className="mr-3 h-6 w-6" /> Account
                </CardTitle>
                <CardDescription className="text-slate-400">Manage your account and login status.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {session ? (
                  <>
                    <p className="text-slate-300">Logged in as: <span className="font-semibold text-primary">{session.user.email}</span></p>
                    <Button onClick={handleLogout} variant="outline" className="w-full border-red-500 text-red-500 hover:bg-red-500/10 flex items-center space-x-2">
                      <LogOut className="h-5 w-5" />
                      <span>Log Out</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-slate-300">You are not logged in. Log in to sync your data.</p>
                    <Button onClick={handleLogin} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center space-x-2">
                      <LogIn className="h-5 w-5" />
                      <span>Log In with Google</span>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>


            <Card className="glassmorphism shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-primary glowing-text flex items-center">
                  <Palette className="mr-3 h-6 w-6" /> Appearance
                </CardTitle>
                <CardDescription className="text-slate-400">Customize the look and feel of EchoVault.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="theme-toggle" className="text-lg text-slate-300">
                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Sun className={`h-5 w-5 ${theme === 'light' ? 'text-yellow-400' : 'text-slate-500'}`} />
                    <Switch
                      id="theme-toggle"
                      checked={theme === 'dark'}
                      onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                      aria-label="Toggle theme"
                    />
                    <Moon className={`h-5 w-5 ${theme === 'dark' ? 'text-blue-400' : 'text-slate-500'}`} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="calm-bg-toggle" className="text-lg text-slate-300">Calming Background Sounds</Label>
                  <Switch id="calm-bg-toggle" aria-label="Toggle calming background sounds" />
                </div>
                 <div className="flex items-center justify-between">
                  <Label htmlFor="night-mode-toggle" className="text-lg text-slate-300">Nighttime Journaling Mode</Label>
                  <Switch id="night-mode-toggle" aria-label="Toggle nighttime journaling mode" />
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-primary glowing-text flex items-center">
                  <ShieldCheck className="mr-3 h-6 w-6" /> Security & Privacy
                </CardTitle>
                <CardDescription className="text-slate-400">Manage your data and privacy settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-300">Client-side encryption is planned for future updates to further protect your memories.</p>
                <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10" disabled>Export All Memories (Coming Soon)</Button>
              </CardContent>
            </Card>
            
            <Card className="glassmorphism shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-primary glowing-text flex items-center">
                  <Bell className="mr-3 h-6 w-6" /> Notifications & Features
                </CardTitle>
                <CardDescription className="text-slate-400">Control how EchoVault interacts with you.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="ai-insights-toggle" className="text-lg text-slate-300">AI-Powered Insights</Label>
                  <Switch id="ai-insights-toggle" defaultChecked aria-label="Toggle AI-powered insights" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="whisper-mode-toggle" className="text-lg text-slate-300 flex items-center">
                    <Headphones className="mr-2 h-5 w-5" /> Whisper Mode
                  </Label>
                  <Switch id="whisper-mode-toggle" aria-label="Toggle whisper mode" />
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-primary glowing-text flex items-center">
                  <CloudUpload className="mr-3 h-6 w-6" /> Data Sync
                </CardTitle>
                <CardDescription className="text-slate-400">Your memories are synced with Supabase when logged in.</CardDescription>
              </CardHeader>
              <CardContent>
                {session ? (
                   <p className="text-sm text-green-400 text-center">Data sync is active. Your memories are being saved to the cloud.</p>
                ) : (
                  <Button 
                    onClick={handleLogin} 
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    Connect to Cloud Sync (Log In)
                  </Button>
                )}
                <p className="mt-2 text-xs text-slate-400 text-center">
                  {session ? "You can access your memories from any device by logging in." : "Log in to enable cloud sync and protect your data."}
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      );
    };

    export default SettingsPage;