import styled from "styled-components";

export const StyledDisplay = styled.div`
  display: flex;
  align-items: center;
  margin: 0 0 20px 0;
  min-height: 30px;
  width: fit-content;
  color: ${(props) => (props.gameOver ? "red" : "black")};
  font-size: 3rem;
  font-weight: bold;
`;
