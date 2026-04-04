import BottomTabBar from './BottomTabBar';
import TopNav from './TopNav';
import { useAuthStore } from '../../stores/authStore';

export default function Layout({ children, title, showBack = false, hideTabBar = false }) {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-space-900 flex flex-col">
      <TopNav title={title} showBack={showBack} user={user} />

      <main className={`flex-1 page-container ${hideTabBar ? '' : 'pb-16'} pt-14`}>
        <div className="max-w-lg mx-auto h-full">
          {children}
        </div>
      </main>

      {!hideTabBar && <BottomTabBar />}
    </div>
  );
}
