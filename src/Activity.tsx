import {
  Container,
  Table,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { green } from "@mui/material/colors";
import React from "react";

const Activity = () => {
  const greenBack = green[700];
  return (
    <>
      <Container
        sx={{ mt: 2, mb: 2, gap: 2, display: "flex", flexDirection: "column" }}
      >
        <Typography variant="h4">各種レッスン</Typography>
        <Typography sx={{ pl: 2 }}>
          当クラブでは、各種レッスンコースを設けており、会員は自分のレベルや参加できる曜日・時間などに合わせ、好きなコースに参加することが出来ます。
          <br />
          レッスン料は不要で、会員の中から適任者がコーチとして、懇切丁寧な指導に当たっています。
        </Typography>
      </Container>
      <Container
        sx={{ mt: 2, mb: 2, gap: 2, display: "flex", flexDirection: "column" }}
      >
        <Typography variant="h6">日曜一般レッスン</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: greenBack, color: "white" }}>
                区分
              </TableCell>
              <TableCell sx={{ backgroundColor: greenBack, color: "white" }}>
                内容
              </TableCell>
              <TableCell sx={{ backgroundColor: greenBack, color: "white" }}>
                対象
              </TableCell>
              <TableCell sx={{ backgroundColor: greenBack, color: "white" }}>
                場所
              </TableCell>
              <TableCell sx={{ backgroundColor: greenBack, color: "white" }}>
                曜日
              </TableCell>
              <TableCell sx={{ backgroundColor: greenBack, color: "white" }}>
                時間
              </TableCell>
            </TableRow>
          </TableHead>
          <TableRow>
            <TableCell>初・中級</TableCell>
            <TableCell>
              初めての人、やさしいラリーが出来る程度の人を対象に、テニスの基本を練習します。
            </TableCell>
            <TableCell>一般男女</TableCell>
            <TableCell>立沼コート</TableCell>
            <TableCell>日曜日</TableCell>
            <TableCell>10:30~13:00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>中級</TableCell>
            <TableCell>
              基本的なテニス技術のレベルアップを図るとともに、ゲームに必要なフォーメーションなどを練習します。
            </TableCell>
            <TableCell>一般男女</TableCell>
            <TableCell>大沼コート</TableCell>
            <TableCell>日曜日</TableCell>
            <TableCell>9:00~10:30</TableCell>
          </TableRow>
        </Table>
      </Container>
      <Container
        sx={{ mt: 2, mb: 2, gap: 2, display: "flex", flexDirection: "column" }}
      >
        <Typography variant="h6">平日一般レッスン</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: greenBack, color: "white" }}>
                区分
              </TableCell>
              <TableCell sx={{ backgroundColor: greenBack, color: "white" }}>
                内容
              </TableCell>
              <TableCell sx={{ backgroundColor: greenBack, color: "white" }}>
                対象
              </TableCell>
              <TableCell sx={{ backgroundColor: greenBack, color: "white" }}>
                場所
              </TableCell>
              <TableCell sx={{ backgroundColor: greenBack, color: "white" }}>
                曜日
              </TableCell>
              <TableCell sx={{ backgroundColor: greenBack, color: "white" }}>
                時間
              </TableCell>
            </TableRow>
          </TableHead>
          <TableRow>
            <TableCell>初級</TableCell>
            <TableCell>
              初めての人、やさしいラリーが出来る程度の人を対象に、テニスの基本を練習します。
            </TableCell>
            <TableCell>主に女性</TableCell>
            <TableCell>立沼コート</TableCell>
            <TableCell>火曜日</TableCell>
            <TableCell>10:00~12:00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>中級</TableCell>
            <TableCell>
              基本的なテニス技術のレベルアップを図るとともに、ゲームに必要なフォーメーションなどを練習します。
            </TableCell>
            <TableCell>主に女性</TableCell>
            <TableCell>立沼コート</TableCell>
            <TableCell>水曜日</TableCell>
            <TableCell>9:30~11:30</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>実戦クラス</TableCell>
            <TableCell>
              ゲームにおけるセオリーや各種状況に応じた対処法などを主体とした練習で、実戦力を養います。
            </TableCell>
            <TableCell>女性</TableCell>
            <TableCell>大沼コート</TableCell>
            <TableCell>金曜日</TableCell>
            <TableCell>13:00~15:00</TableCell>
          </TableRow>
        </Table>
      </Container>

      <Container
        sx={{ mt: 2, mb: 2, gap: 2, display: "flex", flexDirection: "column" }}
      >
        <Typography variant="h6">ジュニア一般レッスン</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: greenBack, color: "white" }}>
                区分
              </TableCell>
              <TableCell sx={{ backgroundColor: greenBack, color: "white" }}>
                内容
              </TableCell>
              <TableCell sx={{ backgroundColor: greenBack, color: "white" }}>
                対象
              </TableCell>
              <TableCell sx={{ backgroundColor: greenBack, color: "white" }}>
                場所
              </TableCell>
              <TableCell sx={{ backgroundColor: greenBack, color: "white" }}>
                曜日
              </TableCell>
              <TableCell sx={{ backgroundColor: greenBack, color: "white" }}>
                時間
              </TableCell>
            </TableRow>
          </TableHead>
          <TableRow>
            <TableCell>ジュニアAクラス</TableCell>
            <TableCell>
              ボールに慣れさせることから始め、基本フォームの習得を目指します。合わせて運動能力の向上や、やり遂げる強い意志力を養います。
            </TableCell>
            <TableCell>
              小学生（2年生以上、　またはコーチが承認した１年生）
            </TableCell>
            <TableCell>立沼コート</TableCell>
            <TableCell>日曜日</TableCell>
            <TableCell>9:00~10:30</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>ジュニアBクラス</TableCell>
            <TableCell>
              基本フォームの充実やゲームの基本を練習します。また、ゲームも取り入れ実戦力も養います。
            </TableCell>
            <TableCell>
              小学生（2年生以上、　またはコーチが承認した１年生）
            </TableCell>
            <TableCell>立沼コート</TableCell>
            <TableCell>日曜日</TableCell>
            <TableCell>9:00~10:30</TableCell>
          </TableRow>
        </Table>
      </Container>
      <Container
        sx={{ mt: 2, mb: 2, gap: 2, display: "flex", flexDirection: "column" }}
      >
        <Typography variant="h4">ダブルスゲーム</Typography>
        <Typography sx={{ pl: 2 }}>
          親睦を主目的として、会員相互のダブルスゲームを楽しんでいます。当会は、老若男女、在勤者から退職者、初心者からベテランと様々な会員が在籍していますので、全員でコートの確保に努め、それぞれの都合に合わせ何時でもテニスが楽しめるようにしています。
          <br />
          会員であれば、レッスンを受けている方でも自由に参加することが出来ます。
        </Typography>
      </Container>
      <Container
        sx={{ mt: 2, mb: 2, gap: 2, display: "flex", flexDirection: "column" }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell sx={{ backgroundColor: greenBack, color: "white" }}>
                火
              </TableCell>
              <TableCell sx={{ backgroundColor: greenBack, color: "white" }}>
                水
              </TableCell>
              <TableCell sx={{ backgroundColor: greenBack, color: "white" }}>
                木・金
              </TableCell>
              <TableCell sx={{ backgroundColor: greenBack, color: "white" }}>
                土・日・祝
              </TableCell>
              <TableCell
                sx={{ backgroundColor: greenBack, color: "white" }}
              ></TableCell>
            </TableRow>
          </TableHead>
          <TableRow>
            <TableCell sx={{ backgroundColor: greenBack, color: "white" }}>
              場所
            </TableCell>
            <TableCell>立沼コート</TableCell>
            <TableCell>立沼コート</TableCell>
            <TableCell>大沼コート</TableCell>
            <TableCell>立沼コート</TableCell>
            <TableCell>大沼コート</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ backgroundColor: greenBack, color: "white" }}>
              時間
            </TableCell>
            <TableCell>12:00~17:00</TableCell>
            <TableCell>9:00~13:00</TableCell>
            <TableCell>9:00~13:00</TableCell>
            <TableCell>9:00~17:00</TableCell>
            <TableCell>9:00~17:00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ backgroundColor: greenBack, color: "white" }}>
              備考
            </TableCell>
            <TableCell>ー</TableCell>
            <TableCell>1面はレッスン</TableCell>
            <TableCell>ー</TableCell>
            <TableCell>
              日曜日のみ
              <br />
              12:00~17:00
            </TableCell>
            <TableCell>
              土日のみ
              <br />
              12:00～13:00は
              <br />
              初級者優先
            </TableCell>
          </TableRow>
        </Table>
      </Container>
    </>
  );
};

export default Activity;
