import "./App.css";
import {
  Box,
  Container,
  createTheme,
  CssBaseline,
  ThemeProvider,
  Toolbar,
} from "@mui/material";
import type { ReactNode } from "react";
import { fonts, layout, tokens } from "./top/tokens";
import { HeaderBar } from "./HeaderBar";
import Top from "./Top";
import { HashRouter, Route, Routes } from "react-router-dom";
import Activity from "./Activity";
import Links from "./Links";
import Documents from "./Documents";
import Court from "./Court";
import Schedule from "./Schedule";
import Login from "./Login";
import Contact from "./Contact";
import Admin from "./Admin";
import RequireAuth from "./RequireAuth";

/**
 * トップページ以外の下層ページの外枠。
 * トップの Section と同じ「paper 地・最大 1120px・左右 24px・上下 sectionPy」に
 * 揃えることで、ページを移動しても紙面の幅と余白が変わらないようにしている。
 */
const PageContainer = ({ children }: { children: ReactNode }) => (
  <Box sx={{ py: layout.sectionPy, backgroundColor: tokens.paper }}>
    <Container
      sx={{
        maxWidth: `${layout.maxWidth}px !important`,
        px: 3,
        display: "flex",
        flexDirection: "column",
        gap: 5,
      }}
    >
      {children}
    </Container>
  </Box>
);

/**
 * サイト全体のテーマ。
 * 配色は src/top/tokens.ts を唯一の出典とし、ここでは MUI の各パレットに
 * 割り当てるだけにする（素の MUI 部品もトークンの色で出てくるようにするため）。
 */
const theme = createTheme({
  palette: {
    primary: {
      main: tokens.green,
      dark: tokens.greenDeep,
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: tokens.ball,
      // 蛍光イエローの上は白だと読めないので、文字は黒に固定する
      contrastText: tokens.ink,
    },
    error: { main: tokens.danger },
    background: {
      default: tokens.paper,
      paper: tokens.surface,
    },
    // Divider と TableCell の罫線をサイト共通の線色にする
    divider: tokens.line,
    text: {
      primary: tokens.ink, // 真っ黒ではなく緑みを帯びた黒
      secondary: tokens.muted,
      disabled: "#9AA79F",
    },
    action: {
      active: tokens.muted,
      // ホバー・フォーカスはブランドの緑を薄く敷く
      hover: "rgba(14,153,90,.06)",
      hoverOpacity: 0.06,
      selected: tokens.greenPale,
      selectedOpacity: 0.08,
      focus: "rgba(14,153,90,.12)",
      focusOpacity: 0.12,
      disabled: "#AFBCB4",
      disabledOpacity: 0.38,
      disabledBackground: "#E6EBE7",
      activatedOpacity: 0.24,
    },
  },
  // 既定の角丸。トップのカード(14px)とパネル(12px)の中間に置き、
  // Paper・Accordion・Button・TextField が素のままでも角の立ち方を揃える
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: fonts.body,
    // 見出しは Zen Kaku Gothic New、本文は Noto Sans JP
    h1: { fontFamily: fonts.display, fontWeight: 900 },
    h2: { fontFamily: fonts.display, fontWeight: 900 },
    h3: { fontFamily: fonts.display, fontWeight: 700 },
    h4: { fontFamily: fonts.display, fontWeight: 700 },
    h5: { fontFamily: fonts.display, fontWeight: 700 },
    h6: { fontFamily: fonts.display, fontWeight: 700 },
    body1: { lineHeight: 1.85 },
    body2: { lineHeight: 1.8 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none" },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <HashRouter>
        <CssBaseline />
        <HeaderBar />
        <Box component="main" sx={{ width: "100%" }}>
          {/* 固定 AppBar 分の余白 */}
          <Toolbar />
          <Routes>
            {/* トップ・活動内容・問い合わせは全幅レイアウトのため Container を挟まない */}
            <Route path="/" element={<Top />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/activity" element={<Activity />} />
            <Route
              path="/documents"
              element={
                <PageContainer>
                  <Documents />
                </PageContainer>
              }
            />
            <Route
              path="/links"
              element={
                <PageContainer>
                  <Links />
                </PageContainer>
              }
            />
            <Route
              path="/court"
              element={
                <PageContainer>
                  <Court />
                </PageContainer>
              }
            />
            <Route
              path="/schedule"
              element={
                <PageContainer>
                  <Schedule />
                </PageContainer>
              }
            />
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <PageContainer>
                    <Admin />
                  </PageContainer>
                </RequireAuth>
              }
            />
            <Route
              path="/login"
              element={
                <PageContainer>
                  <Login />
                </PageContainer>
              }
            />
            {/* ここに他のルートを追加 */}
          </Routes>
        </Box>
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
