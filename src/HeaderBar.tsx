import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import React from "react";
import styles from "./HeaderBar.module.css";
import { Link, useLocation } from "react-router-dom";
import KasukouMarkG from "./assets/images/kasukoumarkG.jpg";
import { fonts, tokens } from "./top/tokens";

type Props = {
  isAdmin?: boolean;
  onLogout?: () => void;
  window?: () => Window;
};

const drawerWidth = 280;

type NavItem = { label: string; path: string };

/** クラブの活動を知るための主要ページ */
const mainNav: NavItem[] = [
  { label: "活動内容", path: "/activity" },
  { label: "コート予約", path: "/court" },
  { label: "行事予定表", path: "/schedule" },
];

/** 資料と外部サイト */
const subNav: NavItem[] = [
  { label: "ドキュメント", path: "/documents" },
  { label: "伝言板", path: "https://kasukabekoshiki.bbs.fc2.com/" },
  { label: "リンク", path: "/links" },
];

const adminNav: NavItem = { label: "管理者", path: "/login" };

const isExternal = (path: string) => path.startsWith("http");

/** 内部リンクと外部リンクで component / to / href を出し分ける */
const linkProps = (path: string) =>
  isExternal(path)
    ? {
        component: "a" as const,
        href: path,
        target: "_blank",
        rel: "noopener noreferrer",
      }
    : { component: Link, to: path };

export const HeaderBar = (props: Props) => {
  const { window, isAdmin, onLogout } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const location = useLocation();

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

  const isSelected = (path: string) =>
    !isExternal(path) && location.pathname === path;

  /** ドロワー内の1項目 */
  const drawerItem = (item: NavItem) => (
    <ListItem key={item.label} disablePadding>
      <ListItemButton
        {...linkProps(item.path)}
        sx={{
          py: 1.25,
          borderLeft: "3px solid",
          borderLeftColor: isSelected(item.path) ? tokens.green : "transparent",
          backgroundColor: isSelected(item.path) ? tokens.greenPale : "transparent",
        }}
      >
        <ListItemText
          primary={item.label}
          slotProps={{
            primary: {
              sx: {
                fontFamily: fonts.display,
                fontWeight: isSelected(item.path) ? 700 : 500,
                color: isSelected(item.path) ? tokens.greenDeep : tokens.ink,
              },
            },
          }}
        />
        {isExternal(item.path) && (
          <OpenInNewIcon sx={{ fontSize: 16, color: tokens.muted }} />
        )}
      </ListItemButton>
    </ListItem>
  );

  const sectionLabel = (text: string) => (
    <Typography
      sx={{
        px: 2,
        pt: 2.5,
        pb: 0.5,
        fontFamily: fonts.data,
        fontSize: ".75rem",
        letterSpacing: ".14em",
        color: tokens.muted,
      }}
    >
      {text}
    </Typography>
  );

  const drawer = (
    <Box
      onClick={handleDrawerToggle}
      sx={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${tokens.line}`,
        }}
      >
        <Typography
          sx={{
            fontFamily: fonts.display,
            fontWeight: 700,
            color: tokens.green,
            fontSize: "1rem",
          }}
        >
          春日部硬式テニスクラブ
        </Typography>
        <IconButton aria-label="メニューを閉じる" size="small" sx={{ color: tokens.muted }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {sectionLabel("クラブについて")}
        <List disablePadding>{mainNav.map(drawerItem)}</List>

        <Divider sx={{ mt: 1.5 }} />
        {sectionLabel("資料・リンク")}
        <List disablePadding>{subNav.map(drawerItem)}</List>
      </Box>

      <Box sx={{ p: 2, borderTop: `1px solid ${tokens.line}` }}>
        <Button
          component={Link}
          to="/contact"
          fullWidth
          sx={{
            fontFamily: fonts.display,
            fontWeight: 700,
            borderRadius: 999,
            py: 1.25,
            backgroundColor: tokens.green,
            color: "#fff",
            "&:hover": { backgroundColor: tokens.greenDeep, color: "#fff" },
          }}
        >
          見学・体験を申し込む
        </Button>
        <Box sx={{ textAlign: "center", mt: 1.5 }}>
          <Box
            component={Link}
            to={adminNav.path}
            sx={{
              fontFamily: fonts.data,
              fontSize: ".8rem",
              color: tokens.muted,
              textDecoration: "none",
            }}
          >
            {adminNav.label}
          </Box>
        </Box>
      </Box>
    </Box>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar component="nav" sx={{ backgroundColor: "#fff" }} elevation={0}>
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            borderBottom: `1px solid ${tokens.line}`,
          }}
        >
          <Box
            component={Link}
            to="/"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              textDecoration: "none",
            }}
          >
            <img src={KasukouMarkG} alt="" className={styles.kasukoumarkG} />
            <Typography
              sx={{
                fontFamily: fonts.display,
                fontWeight: 700,
                fontSize: { xs: "1rem", sm: "1.05rem" },
                color: tokens.green,
              }}
            >
              春日部硬式テニスクラブ
            </Typography>
          </Box>

          {/* デスクトップ：本文ナビ＋申し込みボタン */}
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 0.5 }}>
            {[...mainNav, ...subNav].map((item) => (
              <Button
                key={item.label}
                {...linkProps(item.path)}
                sx={{
                  fontFamily: fonts.display,
                  fontSize: ".92rem",
                  fontWeight: isSelected(item.path) ? 700 : 500,
                  color: isSelected(item.path) ? tokens.greenDeep : tokens.muted,
                  backgroundColor: isSelected(item.path) ? tokens.greenPale : "transparent",
                  borderRadius: "8px",
                  px: 1.25,
                  "&:hover": { backgroundColor: tokens.greenPale, color: tokens.greenDeep },
                }}
              >
                {item.label}
              </Button>
            ))}
            <Button
              component={Link}
              to="/contact"
              sx={{
                ml: 1,
                fontFamily: fonts.display,
                fontWeight: 700,
                fontSize: ".92rem",
                borderRadius: 999,
                px: 2.25,
                backgroundColor: tokens.green,
                color: "#fff",
                "&:hover": { backgroundColor: tokens.greenDeep, color: "#fff" },
              }}
            >
              見学・体験
            </Button>
            {isAdmin ? (
              <Button onClick={onLogout} sx={{ fontSize: ".8rem", color: tokens.muted }}>
                ログアウト
              </Button>
            ) : (
              <Button
                component={Link}
                to={adminNav.path}
                sx={{ fontSize: ".8rem", color: tokens.muted, minWidth: 0 }}
              >
                {adminNav.label}
              </Button>
            )}
          </Box>

          {/* モバイル：ハンバーガーは右手で届く右端に置く */}
          <IconButton
            aria-label="メニューを開く"
            edge="end"
            onClick={handleDrawerToggle}
            sx={{ display: { md: "none" }, color: tokens.green }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <nav>
        <Drawer
          container={container}
          variant="temporary"
          anchor="right"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              backgroundColor: tokens.paper,
            },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
    </Box>
  );
};
