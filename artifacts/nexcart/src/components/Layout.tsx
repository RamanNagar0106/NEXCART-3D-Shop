import React from 'react';
import { NavBar } from './NavBar';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-secondary/30 selection:text-primary">
      <NavBar />
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
      
      {/* Global decorative background elements */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[120px]" />
      </div>
    </div>
  );
}
