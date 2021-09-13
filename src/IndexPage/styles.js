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
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: auto;
`

export const Container = styled.div`
  position: absolute;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  padding: 10px;
`
