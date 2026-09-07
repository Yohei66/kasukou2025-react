import { Box } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Section from "./Section";
import SectionHead from "./SectionHead";
import PhotoSlot from "./PhotoSlot";
import { fonts, tokens } from "./tokens";
import { checklist, foryouPhoto } from "../dataset/topContent";

const ForYou = () => (
  <Section band>
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1.05fr .95fr" },
        gap: { xs: 4, md: 6 },
        alignItems: "start",
      }}
    >
      <Box>
        <SectionHead
          eyebrow="こんな方に"
          heading={
            <>
              ひとつでも当てはまれば、
              <br />
              ぜひ見学にお越しください。
            </>
          }
        />
        <Box component="ul" sx={{ listStyle: "none", m: 0, mt: 4, p: 0 }}>
          {checklist.map((item, i) => (
            <Box
              component="li"
              key={item}
              sx={{
                display: "flex",
                gap: 1.75,
                alignItems: "flex-start",
                py: 1.875,
                px: 0.5,
                fontSize: "1rem",
                lineHeight: 1.7,
                borderBottom: `1px solid ${tokens.line}`,
                ...(i === 0 && { borderTop: `1px solid ${tokens.line}` }),
              }}
            >
              <CheckIcon sx={{ fontSize: 19, color: tokens.green, mt: "5px", flex: "none" }} />
              {item}
            </Box>
          ))}
        </Box>

        <Box
          component="a"
          href="#contact"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            mt: 3.25,
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: ".98rem",
            color: tokens.green,
            textDecoration: "none",
            borderBottom: "2px solid transparent",
            pb: "2px",
            transition: "border-color .18s ease",
            "&:hover": { borderBottomColor: tokens.green },
          }}
        >
          見学・体験を申し込む
          <ArrowForwardIcon sx={{ fontSize: 16 }} />
        </Box>
      </Box>

      <PhotoSlot slot={foryouPhoto} />
    </Box>
  </Section>
);

export default ForYou;
