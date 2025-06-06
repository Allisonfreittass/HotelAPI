import React from 'react';
import Header from './Header';
import Footer from './Footer';
import ChatBot from '../chatbot/ChatBot';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-20 bg-gray-100 dark:bg-gray-800">
        {children}
      </main>
      <ChatBot />
      <Footer />
    </div>
  );
};

export default Layout;
