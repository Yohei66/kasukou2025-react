import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

/**
 * 管理ページのガード。
 * localStorage の値ではなく、サーバーのセッションを確認する。
 * （localStorage だけだと、ブラウザから値を書き換えるだけで通れてしまうため）
 */
const RequireAuth = ({ children }: { children: React.ReactElement }) => {
  const [status, setStatus] = useState<"checking" | "ok" | "ng">("checking");

  useEffect(() => {
    let alive = true;
    fetch("/api/auth_check.php", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (alive) setStatus(json?.authenticated ? "ok" : "ng");
      })
      .catch(() => {
        if (alive) setStatus("ng");
      });
    return () => {
      alive = false;
    };
  }, []);

  if (status === "checking") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (status === "ng") {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default RequireAuth;
