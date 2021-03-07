import styled, { createGlobalStyle } from 'styled-components';
import styledNormalize from 'styled-normalize';

export const GlobalStyle = createGlobalStyle`
  ${styledNormalize}
   body {
    overflow: hidden;
    background-color: black;
    font-family: 'JetBrains Mono', monospace;
    user-select: none;
  }
`;

export const colors = {
  grey: { light: '#A7A7A7', medium: '#333333', dark: '#191919' },
  green: {
    25: 'rgba(0, 255, 105, 0.25)',
    55: 'rgba(0, 255, 105, 0.55)',
    100: 'rgba(0, 255, 105, 1)',
  },
};

export const easings = {
  easeOutStrong: `cubic-bezier(0.12, 0.2, 0.09, 0.99)`,
};

export const CanvasContainer = styled.div`
  width: 100%;
  height: 100vh;
`;
