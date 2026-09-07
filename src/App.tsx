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
import { fonts, tokens } from "./top/tokens";
import { HeaderBar } from "./HeaderBar";
import Top from "./Top";
import { HashRouter, Route, Routes } from "react-router-dom";
import Activity from "./Activity";
import Links from "./Links";
import Documents from "./Documents";
import Court from "./Court";
import Schedule from "./Schedule";
import Login from "./Login";
import Admin from "./Admin";
import RequireAuth from "./RequireAuth";

type Response = {
  message: string;
  time: string;
};

/** トップページ以外の下層ページに共通の余白 */
const PageContainer = ({ children }: { children: ReactNode }) => (
  <Container
    sx={{
      mt: 2,
      mb: 8,
      display: "flex",
      flexDirection: "column",
      justifyContent: "start",
      gap: 5,
      maxWidth: "100%",
    }}
  >
    {children}
  </Container>
);

function App() {
  const theme = createTheme({
    palette: {
      primary: {
        main: "#0e995a", // Primary color
      },
      secondary: {
        main: "#fff176", // Secondary color
      },
      background: {
        default: tokens.paper, // Default background color
        paper: "#ffffff", // Paper background color
      },
      text: {
        primary: "#000000", // Primary text color
        secondary: "#555555", // Secondary text color
        disabled: "#bdbdbd", // Disabled text color
      },
      action: {
        active: "#126e65b5", // Active color for actions
        hover: "#890000", // Hover color for actions
        hoverOpacity: 0.08, // Opacity for hover actions
        selected: "#d6e5e4", // Selected color for actions
        selectedOpacity: 0.08, // Opacity for selected actions
        disabled: "#bdbdbd", // Disabled color for actions
        disabledOpacity: 0.38, // Opacity for disabled actions
        disabledBackground: "#e0e0e0", // Background color for disabled actions
        focus: "#f2b2b2", // Focus color for actions
        focusOpacity: 0.12, // Opacity for focus actions
        activatedOpacity: 0.24, // Opacity for activated actions
      },
    },
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
          root: {
            // 全 Button に適用
            textTransform: "none",
            "&:hover": {
              color: "#169a8db5", // Hover color
            },
          },
          // containedPrimary: {
          //   // contained の primary バリアントだけを変えたい場合
          //   '&:hover': {
          //     backgroundColor: '#e64a19',
          //   },
          // },
        },
      },
    },
  });
  return (
    <>
      <ThemeProvider theme={theme}>
        <HashRouter>
          {/* <BrowserRouter> */}
          <CssBaseline />
          <HeaderBar />
          <Box component="main" sx={{ width: "100%" }}>
            {/* 固定 AppBar 分の余白 */}
            <Toolbar />
            <Routes>
              {/* トップページはヒーローを全幅にするため Container を挟まない */}
              <Route path="/" element={<Top />} />
              <Route
                path="/activity"
                element={
                  <PageContainer>
                    <Activity />
                  </PageContainer>
                }
              />
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
          {/* </BrowserRouter> */}
        </HashRouter>
      </ThemeProvider>
    </>
  );
}

export default App;
