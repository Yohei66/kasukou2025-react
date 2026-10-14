import { Alert, Box, Button, TextField } from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  /** form の submit 経由で呼ぶ（入力欄で Enter を押してもログインできるように） */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await axios.post("/api/login.php", { username, password });
      if (res.data.success) {
        localStorage.setItem("authenticated", "1");
        alert("ログイン成功");
        navigate("/admin");
      } else {
        setError(res.data.message || "ログインに失敗しました");
      }
    } catch (e: any) {
      setError(e.response?.data?.message || "サーバーエラー");
    }
  };
  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ width: 300, mx: "auto", mt: 8 }}
    >
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        fullWidth
        label="ユーザー名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        margin="normal"
        autoComplete="username"
        autoFocus
      />
      <TextField
        fullWidth
        label="パスワード"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        margin="normal"
        autoComplete="current-password"
      />
      <Button fullWidth type="submit" variant="contained" sx={{ mt: 2 }}>
        ログイン
      </Button>
    </Box>
  );
};

export default Login;
