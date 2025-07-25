import { useEffect, useState } from "react";
export function useSocket() {
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<WebSocket>();
  const token = localStorage.getItem("token");
  useEffect(() => {
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_URL_WS_URL}?token=${token}`);
    ws.onopen = () => {
      setLoading(false);
      setSocket(ws);
    };
    return () => {
      ws.close();
    };
  }, []);

  return {
    socket,
    loading,
  };
}
