import React from "react";
import { StyledCell } from "../styles/StyledCell";
import { TETROMINOES } from "../tetrominos";

const Cell = ({ type }) => (
  <StyledCell type={type} color={TETROMINOES[type].color}></StyledCell>
);
export default React.memo(Cell);
