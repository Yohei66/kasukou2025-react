import { useTheme } from "@mui/material";

export const useMemberCategory = () => {
  const theme = useTheme();
  return [
    { category: "フリー", value: 88, color: theme.palette.primary.main },
    { category: "レッスン", value: 32, color: theme.palette.primary.light },
    { category: "その他", value: 11, color: "#bdbdbd" },
    { category: "不明", value: 21, color: "#9e9e9e" },
  ];
};

export default useMemberCategory;