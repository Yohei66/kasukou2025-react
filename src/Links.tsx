import { Container, Link, Typography } from "@mui/material";
import React from "react";

const linkList = [
  { title: "春日部市テニス協会", url: "https://www.k-t-a.org/" },
  { title: "埼玉県テニス協会", url: "https://sta-tennis.org/" },
  { title: "日本女子テニス連盟埼玉県支部", url: "https://jltf-saitama.org/" },
];
const Links = () => {
  return (
    <>
      <Typography variant="h6">リンク</Typography>
      <Container
        sx={{ mt: 2, mb: 2, gap: 1, display: "flex", flexDirection: "column" }}
      >
        {linkList.map((link, index) => (
          <Link key={index} href={link.url} target="_blank" rel="noopener">
            {link.title}
          </Link>
        ))}
      </Container>
    </>
  );
};

export default Links;
