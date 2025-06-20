import { Alert, Box, Button, TextField } from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async () => {
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
    <Box sx={{ width: 300, mx: "auto", mt: 8 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        fullWidth
        label="ユーザー名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        margin="normal"
      />
      <TextField
        fullWidth
        label="パスワード"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        margin="normal"
      />
      <Button
        fullWidth
        variant="contained"
        sx={{ mt: 2 }}
        onClick={handleSubmit}
      >
        ログイン
      </Button>
    </Box>
  );
};

export default Login;
