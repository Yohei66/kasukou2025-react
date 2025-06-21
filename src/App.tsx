import "./App.css";
import {
  Container,
  createTheme,
  CssBaseline,
  ThemeProvider,
} from "@mui/material";
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

function App() {
  const theme = createTheme({
    palette: {
      primary: {
        main: "#00897b", // Primary color
      },
      secondary: {
        main: "#fff176", // Secondary color
      },
      background: {
        default: "#f5f5f5", // Default background color
      },
      text: {
        primary: "#000000", // Primary text color
        secondary: "#555555", // Secondary text color
      },
      action: {
        active: "#126e65b5", // Active color for actions
        hover: "#890000", // Hover color for actions
        hoverOpacity: 0.08, // Opacity for hover actions
        selected: "#136c63", // Selected color for actions
        selectedOpacity: 0.08, // Opacity for selected actions
        disabled: "#bdbdbd", // Disabled color for actions
        disabledOpacity: 0.38, // Opacity for disabled actions
        disabledBackground: "#e0e0e0", // Background color for disabled actions
        focus: "#f2b2b2", // Focus color for actions
        focusOpacity: 0.12, // Opacity for focus actions
        activatedOpacity: 0.24, // Opacity for activated actions
      },
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
          <Container
            maxWidth="lg"
            sx={{
              mt: 9,
              display: "flex",
              flexDirection: "column",
              justifyContent: "start",
              gap: 5,
            }}
          >
            <Routes>
              <Route path="/" element={<Top />} />
              <Route path="/activity" element={<Activity />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/links" element={<Links />} />
              <Route path="/court" element={<Court />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route
                path="/admin"
                element={
                  <RequireAuth>
                    <Admin />
                  </RequireAuth>
                }
              />
              <Route path="/login" element={<Login />} />
              {/* ここに他のルートを追加 */}
              <></>
            </Routes>
          </Container>
          {/* </BrowserRouter> */}
        </HashRouter>
      </ThemeProvider>
    </>
  );
}

export default App;
