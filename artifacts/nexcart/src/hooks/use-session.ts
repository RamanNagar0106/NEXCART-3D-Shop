import { useState, useEffect } from 'react';

export function useSession() {
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    let id = localStorage.getItem('nexcart_session');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('nexcart_session', id);
    }
    setSessionId(id);
  }, []);

  return sessionId;
}
