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
        { path: '/', icon: <Home className="h-6 w-6" />, label: 'Dashboard' },
        { path: '/add-entry', icon: <PlusCircle className="h-6 w-6" />, label: 'Add Entry' },
        { path: '/settings', icon: <Settings className="h-6 w-6" />, label: 'Settings' },
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
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-slate-100">
          <header className="p-4 shadow-lg glassmorphism sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
              <Link to="/" className="text-3xl font-bold futuristic-gradient-text tracking-wider">
                EchoVault
              </Link>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun className="h-6 w-6 text-yellow-400" /> : <Moon className="h-6 w-6 text-blue-400" />}
                </Button>
                {session ? (
                  <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
                    <LogOut className="h-6 w-6 text-red-400" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" onClick={handleLogin} aria-label="Log in">
                    <LogIn className="h-6 w-6 text-green-400" />
                  </Button>
                )}
              </div>
            </div>
          </header>

          <div className="flex flex-1 container mx-auto py-6">
            <nav className="w-64 pr-8 hidden md:block">
              <div className="sticky top-24 space-y-3">
                {navItems.map((item) => (
                  <Link key={item.path} to={item.path}>
                    <motion.div
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 hover:bg-primary/20 ${
                        location.pathname === item.path ? 'bg-primary/30 text-primary font-semibold shadow-md border border-primary/50' : 'text-slate-300 hover:text-slate-100'
                      }`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </nav>

            <main className="flex-1">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            </main>
          </div>
          
          <footer className="p-4 text-center text-sm text-slate-400 border-t border-slate-700/50 glassmorphism">
            <p>&copy; {new Date().getFullYear()} EchoVault. Your memories, secured.</p>
          </footer>

          {/* Mobile Bottom Navigation */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-md border-t border-slate-700/50 p-2 flex justify-around items-center z-50">
            {navItems.map((item) => (
              <Link key={`mobile-${item.path}`} to={item.path} className="flex flex-col items-center p-2 rounded-md">
                <motion.div
                  className={`p-2 rounded-full transition-colors duration-200 ${
                    location.pathname === item.path ? 'bg-primary/30 text-primary' : 'text-slate-400 hover:text-slate-100'
                  }`}
                  whileTap={{ scale: 0.9 }}
                >
                  {item.icon}
                </motion.div>
                <span className={`text-xs mt-1 ${location.pathname === item.path ? 'text-primary font-medium' : 'text-slate-500'}`}>
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
          <div className="md:hidden h-20"></div> {/* Spacer for mobile nav */}
        </div>
      );
    };

    export default Layout;