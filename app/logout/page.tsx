// app/logout/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // TODO: Clear session, tokens, etc.
     localStorage.clear();
        sessionStorage.clear();
    // Redirect to login page after cleanup
    router.replace('/login');
  }, [router]);

  return (
    <div className="h-screen flex items-center justify-center">
      <p className="text-lg font-medium text-gray-600">Logging out...</p>
    </div>
  );
}
