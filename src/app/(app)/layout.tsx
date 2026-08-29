import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="app-main-content-wrapper">
        <Header />
        <main className="app-main-body">
          <div className="app-content-container">
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
