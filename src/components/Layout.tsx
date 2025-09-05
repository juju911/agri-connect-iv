import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sprout, BarChart3, Users, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ChatBot from './ChatBot';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-primary">AgriChain+</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                to="/" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Accueil
              </Link>
              
              {user && profile ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      location.pathname === '/dashboard' ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    Tableau de bord
                  </Link>
                  
                  <span className="text-sm text-muted-foreground">
                    {profile.name} ({profile.role})
                  </span>
                  
                  {profile.role !== 'admin' && (
                    <Link 
                      to="/subscription"
                      className={`text-sm font-medium transition-colors hover:text-primary ${
                        location.pathname === '/subscription' ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      <Settings className="w-4 h-4 inline mr-1" />
                      Abonnement
                    </Link>
                  )}
                  
                  <Button onClick={handleSignOut} variant="outline" size="sm">
                    <LogOut className="w-4 h-4 mr-2" />
                    Déconnexion
                  </Button>
                </>
              ) : (
                <>
                  <Link 
                    to="/auth"
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      location.pathname === '/auth' ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    Connexion
                  </Link>
                  <Button variant="default" size="sm" asChild>
                    <Link to="/auth">S'inscrire</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              {user ? (
                <Button onClick={handleSignOut} variant="ghost" size="sm">
                  <LogOut className="w-4 h-4" />
                </Button>
              ) : (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">
                    <User className="w-4 h-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>

      {/* AI Chatbot */}
      <ChatBot />

      {/* WhatsApp Float Button */}
      <a
        href="https://wa.me/2250566997785?text=Bonjour%2C%20je%20viens%20du%20site%20AgriChain%2B."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Contacter via WhatsApp"
      >
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.89 3.097z"/>
        </svg>
      </a>
    </div>
  );
};

export default Layout;