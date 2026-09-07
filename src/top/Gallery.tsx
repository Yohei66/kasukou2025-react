import { Grid } from "@mui/material";
import Section from "./Section";
import SectionHead from "./SectionHead";
import PhotoSlot from "./PhotoSlot";
import { photoSlots } from "../dataset/topContent";

const Gallery = () => (
  <Section band>
    <SectionHead
      eyebrow="クラブの様子"
      heading="コートでは、こんな時間が流れています"
      description="ここは写真の掲載枠です。撮影した写真に差し替えると、そのままギャラリーになります。枠の中は撮影メモです。"
    />
    <Grid container spacing={2.5} sx={{ mt: 3.5 }}>
      {photoSlots.map((slot) => (
        <Grid key={slot.name} size={{ xs: 12, md: 4 }}>
          <PhotoSlot slot={slot} />
        </Grid>
      ))}
    </Grid>
  </Section>
);

export default Gallery;
