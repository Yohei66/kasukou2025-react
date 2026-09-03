import styles from "./Top.module.css";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  useTheme,
} from "@mui/material";
// Adjust the path as necessary
// Adjust the path as necessary
import PaymentsIcon from "@mui/icons-material/Payments";
import { PieChart } from "@mui/x-charts";
// Adjusts the path as necessary
import { memberData } from "./dataset/memberData.ts"; // Adjusts the path as necessary
import useMemberCategory from "./dataset/memberCategory.ts";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Link } from "react-router-dom";
import TodayCourts from "./TodayCourts";
const memberCategory = useMemberCategory;
const chartSetting = {
  xAxis: [{}],
};
const colorPerItem = [
  { ...memberData[0], color: "orange" },
  { ...memberData[1], color: "gray" },
];
const Top = () => {
  const theme = useTheme();
  return (
    <>
      <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
        私たちと一緒にテニスしましょう！
      </Typography>
      <Container
        sx={{
          mt: 2,
          mb: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Swiper
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          centeredSlides={true}
          loop={true}
          modules={[Autoplay, Pagination, Navigation]}
          pagination={{ clickable: true }}
          navigation={true}
          className={styles.swiperTest}
          style={{
            "--swiper-navigation-color": theme.palette.action.active,
            "--swiper-pagination-color": theme.palette.action.active,
          }}
          // className="mySwiper"
        >
          {(() => {
            // 動的に画像をインポート
            const images = import.meta.glob(
              "./assets/topPicture/*.{png,jpg,jpeg,gif,webp}",
              { eager: true, import: "default" }
            );
            return Object.values(images).map((src, idx) => (
              <SwiperSlide key={idx}>
                <img src={src as string} alt="" className={styles.TopPicture} />
              </SwiperSlide>
            ));
          })()}
        </Swiper>
      </Container>
      <Container>
        <TodayCourts />
      </Container>
      {/* <img src={TopPicture} alt="" className={styles.TopPicture} /> */}
      {/* <Typography
        variant="h4"
        color="black"
        sx={{ mt: 2, mb: 2, textAlign: "center" }}
      >
        一緒にテニスを楽しみましょう！
        <br />
        初心者から経験者まで、どなたでも大歓迎です！
      </Typography> */}
      <Container>
        <Grid container spacing={2}>
          <Grid size={4}>
            <Card variant="outlined">
              <CardContent sx={{ position: "relative" }}>
                <Typography variant="h6" sx={{ textAlign: "center" }}>
                  会費
                </Typography>
                <Typography
                  variant="h4"
                  fontSize={30}
                  fontWeight="bold"
                  mt={2}
                  color="primary.main"
                  sx={{ textAlign: "center" }}
                >
                  1,000円/月
                </Typography>
                <PaymentsIcon
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    opacity: 0.1,
                    fontSize: 90,
                    pointerEvents: "none",
                    zIndex: 0,
                    color: "primary.main",
                  }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: "end", mt: 2 }}
                >
                  ※6ヶ月毎のお支払い
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={4}>
            <Card variant="outlined">
              <CardContent>
                {/* <Typography fontSize={15} sx={{ textAlign: "center" }}>
                  クラス内訳
                </Typography>
                <BarChart
                  dataset={classData}
                  yAxis={[{ scaleType: "band", dataKey: "class", width: 50 }]}
                  xAxis={[{ position: "none" }]}
                  layout="horizontal"
                  series={[
                    { dataKey: "rate", valueFormatter, color: "#3b444e" },
                  ]}
                  colors={["#1976d2"]}
                  barLabel={(item) => valueFormatter(item.value)}
                  slotProps={{
                    tooltip: {
                      trigger: "none", // ← ここでツールチップを無効化
                    },
                  }}
                  sx={{
                    "& .MuiBarLabel-root": {
                      // SVG テキストの塗りつぶし色を指定
                      fill: "#ffffff", // 例：赤
                      display: "flex",
                      alignItems: "end",
                      textAlign: "end",
                      justifyContent: "end",
                      position: "end",
                    },
                  }}
                /> */}
                <Typography fontSize={15} sx={{ textAlign: "center" }}>
                  会員種別
                </Typography>
                {(() => {
                  // Calculate total value for percentage calculation
                  const pieData = memberCategory().map((item) => ({
                    value: item.value,
                    label: item.category,
                    color: item.color,
                  }));
                  const total =
                    pieData.reduce((sum, d) => sum + d.value, 0) || 1;
                  return (
                    <PieChart
                      width={180}
                      height={180}
                      series={[
                        {
                          data: pieData,
                          arcLabel: (item: { value: number }) => {
                            const percent = (
                              (item.value / total) *
                              100
                            ).toFixed(1);
                            return `${percent}%`;
                          },
                        },
                      ]}
                      slotProps={{
                        tooltip: {
                          trigger: "none", // ← ここでツールチップを無効化
                        },
                      }}
                      // hideLegend={true}
                      sx={{
                        "& .MuiPieArcLabel-root": {
                          // SVG テキストの塗りつぶし色を指定
                          fill: "#ffffff", // 例：赤
                          display: "flex",
                          alignItems: "end",
                          textAlign: "end",
                          justifyContent: "end",
                          position: "end",
                        },
                      }}
                    />
                  );
                })()}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography fontSize={15} sx={{ textAlign: "center" }}>
                  男女比
                </Typography>
                {/* <PieChart
                  width={180}
                  height={180}
                  series={[
                    {
                      data: memberData.map((item) => ({
                        value: item.value,
                        label: item.gender,
                        color: item.color,
                      })),
                      // arcLabel: (item) => `${item.label}\n${item.value}`,
                      
                    },
                  ]}
                  slotProps={{
                    tooltip: {
                      trigger: "none", // ← ここでツールチップを無効化
                    },
                  }}
                  // hideLegend={true}
                  sx={{
                    "& .MuiPieArcLabel-root": {
                      // SVG テキストの塗りつぶし色を指定
                      fill: "#ffffff", // 例：赤
                      display: "flex",
                      alignItems: "end",
                      textAlign: "end",
                      justifyContent: "end",
                      position: "end",
                    },
                  }}
                /> */}
                {(() => {
                  // Calculate total value for percentage calculation
                  const pieData = memberData.map((item) => ({
                    value: item.value,
                    label: item.gender,
                    color: item.color,
                  }));
                  const total =
                    pieData.reduce((sum, d) => sum + d.value, 0) || 1;
                  return (
                    <PieChart
                      width={180}
                      height={180}
                      series={[
                        {
                          data: pieData,
                          arcLabel: (item: { value: number }) => {
                            const percent = (
                              (item.value / total) *
                              100
                            ).toFixed(1);
                            return `${percent}%`;
                          },
                        },
                      ]}
                      slotProps={{
                        tooltip: {
                          trigger: "none", // ← ここでツールチップを無効化
                        },
                      }}
                      // hideLegend={true}
                      sx={{
                        "& .MuiPieArcLabel-root": {
                          // SVG テキストの塗りつぶし色を指定
                          fill: "#ffffff", // 例：赤
                          display: "flex",
                          alignItems: "end",
                          textAlign: "end",
                          justifyContent: "end",
                          position: "end",
                        },
                      }}
                    />
                  );
                })()}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Typography variant="h6" color="black">
        春日部硬式テニスクラブについて
      </Typography>
      <Typography variant="subtitle1" color="black" sx={{ ml: 2 }}>
        月曜以外のほぼ毎日、春日部市のテニスコートで活動しています。
        <br />
        ジュニア・20代～70代まで、老若男女問わず、100人近い会員が在籍しています。
        <br />
        当クラブの活動内容については
        <Link
          to="/activity"
          style={{
            color: theme.palette.primary.main,
            textDecoration: "none",
            cursor: "pointer",
          }}
        >
          こちら
        </Link>
        から
      </Typography>
    </>
  );
};

export default Top;
