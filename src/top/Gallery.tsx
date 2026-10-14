import { Grid } from "@mui/material";
import Section from "./Section";
import SectionHead from "./SectionHead";
import PhotoSlot from "./PhotoSlot";
import { photoSlots } from "../dataset/topContent";

const Gallery = () => (
  <Section band>
    <SectionHead
      eyebrow="クラブの様子"
      heading="実際の活動の様子です"
      description=" "
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
