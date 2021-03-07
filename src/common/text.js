import styled, { css } from 'styled-components';

const defaultFontSize = '18px';

export const light = 300;
export const regular = 400;
export const bold = 700;

export const defaultTextStyle = css`
  font-family: 'JetBrains Mono', monospace;
  font-size: ${defaultFontSize};
  font-weight: ${regular};
  line-height: 25px;
`;

export const Headline = styled.div`
  font-size: 22px;
  font-weight: ${regular};
  margin-bottom: 30px;
`;
