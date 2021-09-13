import styled from 'styled-components'

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
`

export const Wrapper = styled.div`
  //display: flex;
  //flex: 1 0;
  overflow: auto;
  height: 80vh;
  margin: 15px 0;
  width: 100%;
`

export const Container = styled.div`
  display: flex;
  //flex-direction: column;
  flex-wrap: wrap;
  align-items: center;
  //align-content: space-around;
  justify-content: center;
  //height: auto;
`
