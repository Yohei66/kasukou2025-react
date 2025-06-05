import React from "react";
import styles from "./Top.module.css";
import { Typography, Box } from "@mui/material";
import Container from "@mui/material/Container";

const Top = () => {
  return (
    <>
      <img
        src="src/assets/images/TopPicture.png"
        alt=""
        className={styles.TopPicture}
      />
      <Typography
        variant="h4"
        color="black"
        sx={{ mt: 2, mb: 2, textAlign: "center" }}
      >
        一緒にテニスを楽しみましょう！
        <br />
        初心者から経験者まで、どなたでも大歓迎です！
      </Typography>
      <Typography variant="h6" color="black">
        春日部硬式テニスクラブについて
      </Typography>
      <Typography variant="subtitle1" color="black" sx={{ ml: 2 }}>
        月曜以外の日中、9時～ほぼ毎日、春日部市のテニスコートで活動しています。
        <br />
        20代～70代まで、老若男女問わず、100人近い会員が在籍しています。
        <br />
        当クラブの活動内容についてはこちらから{" "}
      </Typography>
    </>
  );
};

export default Top;
