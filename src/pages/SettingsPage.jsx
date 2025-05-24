import React from 'react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Switch } from '@/components/ui/switch';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Bell, Palette, ShieldCheck, UploadCloud as CloudUpload, Headphones, Moon, Sun, LogIn, LogOut, UserCircle, ZapOff } from 'lucide-react';
    import { useTheme } from '@/components/ThemeProvider';
    import { supabase } from '@/lib/supabaseClient';
    import { useToast } from '@/components/ui/use-toast';

    const SettingsCard = ({ icon, title, description, children }) => (
      <Card className="bg-card shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium text-foreground flex items-center">
            {React.cloneElement(icon, { className: "mr-2.5 h-5 w-5 text-primary" })} {title}
          </CardTitle>
          {description && <CardDescription className="text-xs text-muted-foreground pt-1">{description}</CardDescription>}
        </CardHeader>
        <CardContent className="text-sm">
          {children}
        </CardContent>
      </Card>
    );
    
    const SettingsItem = ({ label, control, htmlFor }) => (
       <div className="flex items-center justify-between py-2.5">
        <Label htmlFor={htmlFor} className="text-foreground">
          {label}
        </Label>
        {control}
      </div>
    );


    const SettingsPage = ({ session }) => {
      const { theme, setTheme, isNightMode, setIsNightMode } = useTheme();
      const { toast } = useToast();

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

      const handleNightModeToggle = (checked) => {
        setIsNightMode(checked);
        if (checked && theme !== 'dark') {
          setTheme('dark'); // Night mode implies dark theme
          toast({ title: "Night Mode Enabled", description: "Switched to dark theme for optimal night viewing."});
        } else if (!checked && theme === 'dark' && document.documentElement.classList.contains('night')) {
          // If night mode is disabled, but theme was dark (due to night mode), revert to system or previous light.
          // This logic might need refinement based on desired behavior. For now, just turn off 'night' class.
          // The ThemeProvider will handle applying 'dark' or 'light' based on 'theme' state.
        }
      };


      return (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto p-1 md:p-0"
        >
          <h1 className="text-3xl font-semibold mb-6 text-foreground">Settings</h1>

          <div className="space-y-6">
            <SettingsCard icon={<UserCircle />} title="Account" description="Manage your account and login status.">
              {session ? (
                <div className="space-y-3">
                  <p className="text-muted-foreground">Logged in as: <span className="font-medium text-foreground">{session.user.email}</span></p>
                  <Button onClick={handleLogout} variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive/10 flex items-center space-x-2">
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-muted-foreground">You are not logged in. Log in to sync your data.</p>
                  <Button onClick={handleLogin} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center space-x-2">
                    <LogIn className="h-4 w-4" />
                    <span>Log In with Google</span>
                  </Button>
                </div>
              )}
            </SettingsCard>

            <SettingsCard icon={<Palette />} title="Appearance" description="Customize the look and feel of EchoVault.">
              <SettingsItem 
                htmlFor="theme-toggle"
                label={theme === 'system' ? 'System Theme' : (theme === 'dark' ? 'Dark Mode' : 'Light Mode')}
                control={
                  <div className="flex items-center space-x-2">
                    <Sun className={`h-4 w-4 ${theme === 'light' || (theme === 'system' && !window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                    <Switch
                      id="theme-toggle"
                      checked={theme === 'dark'}
                      onCheckedChange={(checked) => {
                        setTheme(checked ? 'dark' : 'light');
                        if (!checked && isNightMode) setIsNightMode(false); // Turn off night mode if switching to light
                      }}
                      aria-label="Toggle theme"
                    />
                    <Moon className={`h-4 w-4 ${theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'text-blue-400' : 'text-muted-foreground'}`} />
                  </div>
                }
              />
              <SettingsItem 
                htmlFor="night-mode-toggle"
                label="Nighttime Journaling Mode"
                control={<Switch 
                            id="night-mode-toggle" 
                            aria-label="Toggle nighttime journaling mode"
                            checked={isNightMode}
                            onCheckedChange={handleNightModeToggle}
                         />}
              />
            </SettingsCard>

            <SettingsCard icon={<ShieldCheck />} title="Security & Privacy" description="Manage your data and privacy settings.">
              <p className="text-muted-foreground pb-3">Client-side encryption is planned for future updates to further protect your memories.</p>
              <Button variant="outline" className="w-full text-primary border-primary/50 hover:bg-primary/10" disabled>Export All Memories (Soon)</Button>
            </SettingsCard>
            
            <SettingsCard icon={<Bell />} title="Notifications & Features" description="Control how EchoVault interacts with you.">
              <SettingsItem 
                htmlFor="whisper-mode-toggle"
                label={<span className="flex items-center"><Headphones className="mr-1.5 h-4 w-4" /> Whisper Mode</span>}
                control={<Switch id="whisper-mode-toggle" aria-label="Toggle whisper mode" disabled />}
              />
               <div className="flex items-center justify-between py-2.5 text-muted-foreground">
                <Label className="flex items-center"><ZapOff className="mr-1.5 h-4 w-4 text-muted-foreground" /> AI-Powered Insights</Label>
                <span>Removed</span>
              </div>
            </SettingsCard>

            <SettingsCard icon={<CloudUpload />} title="Data Sync" description="Your memories are synced with Supabase when logged in.">
              {session ? (
                 <p className="text-sm text-green-500 text-center py-2">Data sync is active. Your memories are being saved to the cloud.</p>
              ) : (
                <Button 
                  onClick={handleLogin} 
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                >
                  Connect to Cloud Sync (Log In)
                </Button>
              )}
              <p className="mt-1.5 text-xs text-muted-foreground text-center">
                {session ? "You can access your memories from any device by logging in." : "Log in to enable cloud sync and protect your data."}
              </p>
            </SettingsCard>
          </div>
        </motion.div>
      );
    };

    export default SettingsPage;