import styled from 'styled-components';
import { easings } from 'common/styles';

export const Wrapper = styled.div`
  display: flex;
  position: fixed;
  align-items: flex-start;
  width: 50%;
  justify-content: space-between;
  top: 0;
`;

export const Close = styled.div`
  border-radius: 3px;
  padding: 3px 3px 0 3px;
  margin: 5px;
  background-color: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.25);
  cursor: pointer;

  &:hover {
    svg {
      transform: scale(1.25);
    }
  }

  svg {
    transition: all 0.2s ${easings.easeOutStrong};
  }
`;

export const Display = styled.div`
  position: fixed;
  left: 0;
  bottom: 0;
  border-radius: 3px;
  padding: 15px;
  background-color: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: white;
  font-size: 13px;
  margin: 5px;
  opacity: 0.8;
`;
