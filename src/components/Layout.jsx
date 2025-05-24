import React from 'react';
    import { Link, useLocation } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { Home, PlusCircle, Settings, Moon, Sun, LogIn, LogOut } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { useTheme } from '@/components/ThemeProvider';
    import { supabase } from '@/lib/supabaseClient';
    import { useToast } from '@/components/ui/use-toast';

    const Layout = ({ children, session }) => {
      const location = useLocation();
      const { theme, setTheme } = useTheme();
      const { toast } = useToast();

      const navItems = [
        { path: '/', icon: <Home className="h-5 w-5" />, label: 'Dashboard' },
        { path: '/add-entry', icon: <PlusCircle className="h-5 w-5" />, label: 'Add Entry' },
        { path: '/settings', icon: <Settings className="h-5 w-5" />, label: 'Settings' },
      ];

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
        <div className="min-h-screen flex flex-col bg-background text-foreground">
          <header className="p-3 border-b border-border/70 sticky top-0 z-50 bg-background/90 backdrop-blur-sm">
            <div className="container mx-auto flex justify-between items-center">
              <Link to="/" className="text-2xl font-semibold text-primary">
                EchoVault
              </Link>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-blue-500" />}
                </Button>
                {session ? (
                  <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
                    <LogOut className="h-5 w-5 text-destructive" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" onClick={handleLogin} aria-label="Log in">
                    <LogIn className="h-5 w-5 text-green-500" />
                  </Button>
                )}
              </div>
            </div>
          </header>

          <div className="flex flex-1 container mx-auto py-5 px-4 sm:px-6 lg:px-8">
            <nav className="w-56 pr-6 hidden md:block">
              <div className="sticky top-20 space-y-1.5">
                {navItems.map((item) => (
                  <Link key={item.path} to={item.path}>
                    <motion.div
                      className={`flex items-center space-x-2.5 p-2.5 rounded-md text-sm font-medium transition-colors duration-150 ${
                        location.pathname === item.path ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                      }`}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </nav>

            <main className="flex-1 min-w-0">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </motion.div>
            </main>
          </div>
          
          <footer className="p-4 text-center text-xs text-muted-foreground border-t border-border/70">
            <p>&copy; {new Date().getFullYear()} EchoVault. Your memories, secured.</p>
          </footer>

          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm border-t border-border/70 p-1.5 flex justify-around items-center z-50">
            {navItems.map((item) => (
              <Link key={`mobile-${item.path}`} to={item.path} className="flex flex-col items-center p-1.5 rounded-md flex-1">
                <motion.div
                  className={`p-2 rounded-md transition-colors duration-150 ${
                    location.pathname === item.path ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.icon}
                </motion.div>
                <span className={`text-[10px] mt-0.5 ${location.pathname === item.path ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
          <div className="md:hidden h-16"></div>
        </div>
      );
    };

    export default Layout;