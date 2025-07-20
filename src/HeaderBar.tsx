import {
  AppBar,
  Box,
  Button,
  Container,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import React from "react";
import styles from "./HeaderBar.module.css";
import { Link, useLocation } from "react-router-dom"; // ← useLocationを追加
import KasukouMarkG from "./assets/images/kasukoumarkG.jpg"; // Adjust the path as necessary

// interface Props {
//   /**
//    * Injected by the documentation to work in an iframe.
//    * You won't need it on your project.
//    */
//   window?: () => Window;
//   isAdmin?: boolean;
//   onLogout?: () => void;
// }
type Props = {
  isAdmin?: boolean;
  onLogout?: () => void;
  window?: () => Window;
};
const drawerWidth = 240;

const navItems = [
  { label: "活動内容", path: "/activity" },
  { label: "伝言板", path: "https://kasukabekoshiki.bbs.fc2.com/" },
  { label: "コート予約", path: "/court" },
  { label: "行事予定表", path: "/schedule" },
  { label: "ドキュメント", path: "/documents" },
  { label: "リンク", path: "/links" },
  { label: "管理者", path: "/login" },
];

export const HeaderBar = (props: Props) => {
  const theme = useTheme(); // MUIのテーマを取得
  const { window, isAdmin, onLogout } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const location = useLocation(); // ← 追加

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const isSelected = (path: string) => {
    // 外部リンクは選択状態にしない
    if (path.startsWith("http")) return false;
    return location.pathname === path;
  };

  const drawer = (
    <Box onClick={handleDrawerToggle}>
      <Typography variant="h6" sx={{ my: 2 }}>
        春日部硬式テニスクラブ
      </Typography>
      <Divider />
      <List sx={{ textAlign: "end" }}>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              sx={{
                textAlign: "center",
                backgroundColor: isSelected(item.path) ? "#e0e0e0" : "inherit", // 選択時の色
              }}
              component={item.path.startsWith("http") ? "a" : Link}
              to={!item.path.startsWith("http") ? item.path : undefined}
              href={item.path.startsWith("http") ? item.path : undefined}
              target={item.path.startsWith("http") ? "_blank" : undefined}
              rel={
                item.path.startsWith("http") ? "noopener noreferrer" : undefined
              }
              className={isSelected(item.path) ? styles.selected : ""}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-around",
      }}
    >
      <AppBar component="nav" sx={{ backgroundColor: "white" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <IconButton
            color="primary"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Link to="/">
            <Container sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <img
                src={KasukouMarkG}
                alt="test"
                className={styles.kasukoumarkG}
              />
              <Typography
                variant="h6"
                sx={{
                  flexGrow: 1,
                  display: { xs: "none", sm: "block" },
                  color: theme.palette.primary.main,
                }}
              >
                春日部硬式テニスクラブ
              </Typography>
            </Container>
          </Link>
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            {navItems.map((item) => (
              <Button
                key={item.label}
                sx={{
                  // color: "#c31616",
                  backgroundColor: isSelected(item.path)
                    ? theme.palette.action.selected // 選択時の色
                    : "inherit", // 選択時の色
                  fontWeight: isSelected(item.path) ? "bold" : "normal",
                }}
                component={item.path.startsWith("http") ? "a" : Link}
                to={!item.path.startsWith("http") ? item.path : undefined}
                href={item.path.startsWith("http") ? item.path : undefined}
                target={item.path.startsWith("http") ? "_blank" : undefined}
                rel={
                  item.path.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                className={isSelected(item.path) ? styles.selected : ""}
              >
                {item.label}
              </Button>
            ))}
            {isAdmin && <Button onClick={onLogout}>ログアウト</Button>}
          </Box>
        </Toolbar>
      </AppBar>
      <nav>
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
    </Box>
  );
};
