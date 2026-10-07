import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from '@/components/AuthContext';
import { ToastContainer } from 'react-toastify';

export const metadata = {
  title: 'DSATrack — College DSA Progress & Assignment Tracking Platform',
  description: 'A comprehensive, modern tracking platform for College DSA Instructors and Students with automated LeetCode and GeeksforGeeks synchronization.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-brand-500 selection:text-white">
        <AuthProvider>
          {children}
          <ToastContainer position="top-right" autoClose={4000} theme="dark" />
        </AuthProvider>
      </body>
    </html>
  );
}
