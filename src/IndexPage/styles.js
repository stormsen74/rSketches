import styled from 'styled-components';

export const Icon = styled.div`
  background-color: #353333;
  padding: 15px;
  max-height: 300px;
  margin: 10px;
  color: #b58d64;
  text-decoration: none;
  user-select: none;
  cursor: pointer;
  border-radius: 5px;
  border: 1px solid rgba(255, 255, 255, 0);

  &:hover {
    border: 1px solid rgba(255, 255, 255, 0.5);
    transition: all 0.25s ease-out;
  }
`;

export const Wrapper = styled.div`
  display: flex;
  flex: 0 0;
  overflow: auto;
  margin: 15px 0;
`;

export const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  //align-items: center;
  align-content: flex-start;
  justify-content: center;
  height: 100vh;
  width: 100%;
`;
