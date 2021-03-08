import React from 'react';
import { useHistory } from 'react-router-dom';
import { sketches } from './sketches';
import { Container, Icon } from './styles';

export default function IndexPage() {
  const history = useHistory();

  return (
    <Container>
      {sketches.map((sketch) => {
        return (
          <Icon
            key={sketch.route}
            onClick={() => {
              history.push(sketch.route);
            }}
          >
            {sketch.title}
          </Icon>
        );
      })}
    </Container>
  );
}
