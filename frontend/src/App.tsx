import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { WorkspaceHeader } from './components/Header';
import { ContentWorkspace } from './pages/workspace/ContentWorkspace';
import { Profile } from './pages/profile/UserProfile';
import { HelpCenter } from './pages/help/HelpCenter';
import { BalanceTopUp } from './pages/payment/BalanceTopUp';
import { TermsPage } from './pages/help/TermsPage';
import { PolicyPage } from './pages/help/PolicyPage';
import { Login } from './pages/sign/SignIn';
import { SignUp } from './pages/sign/SignUp';
import type { SidebarView } from './types';
import { ApiProvider } from './api/ApiProvider';
import { useApi } from './api/useApi';
import { useTranslation } from 'react-i18next';
import { DEBUG } from './config';

export type AITool = 'chatgpt' | 'sora' | 'dalle';
export type SocialPlatform = 'youtube' | 'telegram' | 'instagram';
export type ContentCategory = 'text' | 'video' | 'media';

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface AIToolConfig {
  id: AITool;
  name: string;
  category: ContentCategory;
}

export interface SocialConnection {
  id: SocialPlatform;
  name: string;
  connected: boolean;
}

export interface Post {
  id: string;
  content: {
    text?: string;
    image?: string;
    video?: string;
  };
  tools: AITool[];
  platforms: SocialPlatform[];
  status: 'generated' | 'sent';
  createdAt: Date;
}

function AppInner() {
  const { t } = useTranslation();

  const { apiRequest } = useApi();

  const [isVerify, setIsVerify] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [view, setView] = useState<SidebarView>('workspace');
  const [selectedTools, setSelectedTools] = useState<AITool[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([]);
  const [coinBalance, setCoinBalance] = useState(500);
  const [selectedToolsCoins, setSelectedToolsCoins] = useState(0);

  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';

  const [aiTools] = useState<AIToolConfig[]>([
    { id: 'chatgpt', name: 'ChatGPT', category: 'text' },
    { id: 'sora', name: 'Sora', category: 'video' },
    { id: 'dalle', name: 'DALL·E', category: 'media' },
  ]);

  const [socialNetworks, setSocialNetworks] = useState<SocialConnection[]>([
    { id: 'youtube', name: 'YouTube', connected: true },
    { id: 'telegram', name: 'Telegram', connected: false },
    { id: 'instagram', name: 'Instagram', connected: true },
  ]);
  
  const titlesByView: Partial<Record<SidebarView, string>> = {
    workspace: "global-content-workspace",
    profile: "global-your-profile",
    payment: "global-top-up",
    help: "global-help-center",
  };


  const [, setPosts] = useState<Post[]>([]);

  const toggleToolSelection = (toolId: AITool) => {
    setSelectedTools(prev =>
      prev.includes(toolId) ? prev.filter(id => id !== toolId) : [...prev, toolId]
    );
  };

  const togglePlatformSelection = (platformId: SocialPlatform) => {
    const network = socialNetworks.find(n => n.id === platformId);
    if (!network) return;

    if (!network.connected) {
      setSocialNetworks(prev => prev.map(n => (n.id === platformId ? { ...n, connected: true } : n)));
      return;
    }

    setSelectedPlatforms(prev =>
      prev.includes(platformId) ? prev.filter(id => id !== platformId) : [...prev, platformId]
    );
  };

  const togglePlatformConnection = (platformId: SocialPlatform) => {
    setSocialNetworks(prev => prev.map(n => (n.id === platformId ? { ...n, connected: !n.connected } : n)));

    const wasConnected = socialNetworks.find(n => n.id === platformId)?.connected;
    if (wasConnected) {
      setSelectedPlatforms(prev => prev.filter(id => id !== platformId));
    }
  };

  const savePost = (content: Post['content'], status: 'generated' | 'sent') => {
    const newPost: Post = {
      id: Date.now().toString(),
      content,
      tools: selectedTools,
      platforms: status === 'sent' ? selectedPlatforms : [],
      status,
      createdAt: new Date(),
    };
    setPosts(prev => [newPost, ...prev]);
  };

  const handleCoinsUpdate = (_coinsByTool: Record<AITool, number>, totalSelectedCoins: number) => {
    setSelectedToolsCoins(totalSelectedCoins);
  };

  const handleSpendCoins = (coins: number) => {
    setCoinBalance(prev => Math.max(0, prev - coins));
  };

  const handleTopUpCoins = (coins: number) => {
    setCoinBalance(prev => prev + Math.max(0, coins));
  };

  const setUserInfo = (data: { 
    user_id: string; 
    user_name: string; 
    user_email: string; 
    user_avatar: string;
  }) => {
    setUser({
      id: data.user_id,
      name: data.user_name,
      email: data.user_email,
      avatar: data.user_avatar,
    })
  }

  useEffect(() => {
    const getTitle = () => {
      const appTitle = t("global-app");

      if (isVerify) {
        return appTitle;
      }

      if (pathname == '/terms') {
        return `${t("global-terms")} — ${appTitle}`;
      }

      if (pathname == '/policy') {
        return `${t("global-policy")} — ${appTitle}`;
      }
      
      if (!isAuthenticated) {
        if (authView === 'login') {
          return `${t("global-signin")} — ${appTitle}`;
        }
        return `${t("global-signup")} — ${appTitle}`;
      }

      const titleKey = titlesByView[view];
      if (titleKey) {
        return `${t(titleKey)} — ${appTitle}`;
      }

      return appTitle;
    };

    document.title = DEBUG ? `[DEV] ${getTitle()}` : getTitle();
  }, [view, isAuthenticated, authView, isVerify, t]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const tokenParam = url.searchParams.get('t');

    url.searchParams.delete('t');
    window.history.replaceState({}, '', url.toString());

    if (tokenParam) {
      const verifyWithTokenParam = async () => {
        await apiRequest({
          query: 'verify_token',
          token: tokenParam,
          data: { change: true },

          onSuccess: (res) => {
            if (res.data.user_token) {
              localStorage.setItem('userToken', res.data.user_token);
            }

            setUserInfo(res.data);

            setIsAuthenticated(true);
            setView('workspace');

            setIsVerify(false);
          },
        });
      };

      verifyWithTokenParam();
      return;
    }

    const token = localStorage.getItem('userToken');
    if (!token) {
      setIsAuthenticated(false);
      setIsVerify(false);
      return;
    }

    const checkAuth = async () => {
      await apiRequest({
        query: 'verify_token',
        token: token,

        onSuccess: (res) => {
          setUserInfo(res.data);

          setIsAuthenticated(true);
          setView('workspace');

          setIsVerify(false);
        },

        onError: (err) => {
          if (err.status == 'error') {
            localStorage.removeItem('userToken');
            setIsAuthenticated(false);
            setIsVerify(false);
          }
        },
      });
    };

    checkAuth();
  }, []);

  const handleSignUp = async (formData: {
    name: string;
    email: string;
    password: string;
    policy: boolean;
    subscribe: boolean;
  }) => {
    await apiRequest({
      query: 'register',
      data: formData,

      onSuccess: (res) => {
        localStorage.setItem('userToken', res.data.user_token);

        setUserInfo(res.data);

        setIsAuthenticated(true);
        setView('workspace');
      },

      onError: (err) => {
        alert(err?.message || 'Sign up failed');
      },
    });
  };

  const handleLogin = async (formData: { 
    email: string;
    password: string;
  }) => {
    await apiRequest({
      query: 'auth',
      data: formData,

      onSuccess: (res) => {
        localStorage.setItem('userToken', res.data.user_token);

        setUserInfo(res.data);

        setIsAuthenticated(true);
        setView('workspace');
      },

      onError: (err) => {
        alert(err?.message || 'Sign in failed');
      },
    });
  };

  const handleLogOut = async () => {
    await apiRequest({
      query: 'exit',
      token: localStorage.getItem('userToken'),

      onSuccess: () => {
        localStorage.removeItem('userToken');
        
        setIsAuthenticated(false);
        setAuthView('login');
      },

      onError: (err) => {
        alert(err?.message || 'Log out failed');
      },
    });
  };

  return (
    <div>
      {/* VERIFY */}
      <div className={isVerify ? 'block' : 'hidden'}>
        <div className="flex h-screen app-bg-pattern" />
      </div>

      {/* TERMS */}
      <div className={!isVerify && pathname === '/terms' ? 'block' : 'hidden'}>
        <TermsPage />
      </div>

      {/* POLICY */}
      <div className={!isVerify && pathname === '/policy' ? 'block' : 'hidden'}>
        <PolicyPage />
      </div>

      {/* AUTH */}
      <div
        className={
          !isVerify && !isAuthenticated && pathname !== '/terms' && pathname !== '/policy'
            ? 'block h-full'
            : 'hidden'
        }
      >
        <div className={authView === 'login' ? 'block h-full' : 'hidden'}>
          <Login
            onLogin={handleLogin}
            onSwitchToSignUp={() => setAuthView('signup')}
          />
        </div>

        <div className={authView === 'signup' ? 'block h-full' : 'hidden'}>
          <SignUp
            onSignUp={handleSignUp}
            onSwitchToLogin={() => setAuthView('login')}
          />
        </div>
      </div>

      {/* APP */}
      <div
        className={
          !isVerify && isAuthenticated && pathname !== '/terms' && pathname !== '/policy'
            ? 'flex h-screen app-bg-pattern'
            : 'hidden'
        }
      >
        <Sidebar currentView={view} onViewChange={setView} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <WorkspaceHeader
            view={view}
            coinBalance={coinBalance}
            userInfo={user}
            onProfileClick={() => setView('profile')}
          />

          <div className={view === 'workspace' ? 'flex-1 flex flex-col overflow-hidden' : 'hidden'}>
            <ContentWorkspace
              aiTools={aiTools}
              socialNetworks={socialNetworks}
              selectedTools={selectedTools}
              selectedPlatforms={selectedPlatforms}
              coinBalance={coinBalance}
              selectedToolsCoins={selectedToolsCoins}
              onToggleTool={toggleToolSelection}
              onTogglePlatform={togglePlatformSelection}
              onCoinsUpdate={handleCoinsUpdate}
              onSavePost={savePost}
              onSpendCoins={handleSpendCoins}
            />
          </div>

          <div className={view === 'profile' ? 'block' : 'hidden'}>
            <Profile
              userInfo={user}
              socialNetworks={socialNetworks}
              onTogglePlatformConnection={togglePlatformConnection}
              onLogout={handleLogOut}
            />
          </div>

          <div className={view === 'payment' ? 'block' : 'hidden'}>
            <BalanceTopUp onTopUpCoins={handleTopUpCoins} />
          </div>

          <div className={view === 'help' ? 'block' : 'hidden'}>
            <HelpCenter />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ApiProvider>
      <AppInner />

      {DEBUG && (
        <div className="fixed bottom-2 left-2 z-50 rounded-md bg-red-600 px-2 py-1 text-xs font-bold text-white shadow-lg select-none">DEV</div>
      )}
    </ApiProvider>
  );
}
