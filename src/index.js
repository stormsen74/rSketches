import React from 'react';
import ReactDOM from 'react-dom';
import { GlobalStyle } from './common/styles';
import Routes from './Routes';

const App = () => (
  <>
    <GlobalStyle />
    <Routes />
  </>
);

const root = document.createElement('div');
document.body.appendChild(root);

ReactDOM.render(<App />, root);

export default App;
