import { Box, Typography } from "@mui/material";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import type { PhotoSlotData } from "../dataset/topContent";
import { fonts, tokens } from "./tokens";

type Props = {
  slot: PhotoSlotData;
};

/**
 * 写真の掲載枠。
 * topContent.ts の src に画像を渡すと写真に切り替わり、無い間は撮影メモを表示する。
 */
const PhotoSlot = ({ slot }: Props) => {
  if (slot.src) {
    return (
      <Box
        component="img"
        src={slot.src}
        alt={slot.name}
        sx={{
          width: "100%",
          aspectRatio: slot.ratio,
          objectFit: "cover",
          borderRadius: "14px",
          display: "block",
        }}
      />
    );
  }

  return (
    <Box
      sx={{
        aspectRatio: slot.ratio,
        border: `1.5px dashed ${tokens.line}`,
        borderRadius: "14px",
        backgroundColor: tokens.greenPale,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        textAlign: "center",
        px: 3,
        py: 3.5,
      }}
    >
      <PhotoCameraOutlinedIcon
        sx={{ fontSize: 38, color: tokens.green, opacity: 0.5, mb: 0.5 }}
      />
      <Typography
        sx={{
          fontFamily: fonts.display,
          fontWeight: 700,
          color: tokens.ink,
          fontSize: ".98rem",
          lineHeight: 1.5,
        }}
      >
        {slot.name}
      </Typography>
      <Typography
        sx={{
          fontFamily: fonts.data,
          fontSize: ".83rem",
          letterSpacing: ".06em",
          color: tokens.muted,
        }}
      >
        {slot.spec}
      </Typography>
    </Box>
  );
};

export default PhotoSlot;
