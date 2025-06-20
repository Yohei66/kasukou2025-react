import { Paper, Table, TableCell, TableHead, TableRow } from "@mui/material";
import React from "react";

const Schedule = () => {
  return (
    <>
      <Table component={Paper}>
        <TableHead>
          <TableRow>
            <TableCell>日付</TableCell>
            <TableCell>曜日</TableCell>
            <TableCell width={200}>行事</TableCell>
            <TableCell>場所</TableCell>
          </TableRow>
        </TableHead>
        <TableRow>
          <TableCell>6月1日</TableCell>
          <TableCell>土</TableCell>
          <TableCell width={200}>テストです</TableCell>
          <TableCell>大沼</TableCell>
        </TableRow>
      </Table>
    </>
  );
};

export default Schedule;
