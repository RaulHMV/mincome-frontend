import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SidebarNav from './SidebarNav';
import Header from './Header';
import AIChatDrawer from '../common/AIChatDrawer';

export default function MainLayout() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      <SidebarNav />
      <div className="lg:pl-64 flex flex-col min-h-screen bg-[#F7F6F2]">
        <Header onOpenChat={() => setIsChatOpen(true)} />
        <main className="bg-[#F7F6F2] min-h-screen flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10">
            <Outlet />
          </div>
        </main>
      </div>
      <AIChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
