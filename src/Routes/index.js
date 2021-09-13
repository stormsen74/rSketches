import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import IndexPage from '../IndexPage'
import Overlay from '../Overlay'
import { sketches } from '../IndexPage/sketches'

export default function Routes() {
  return (
    <>
      <Router>
        <Switch>
          {sketches.map(sketch => {
            return <Route key={sketch.route} path={sketch.route} component={sketch.component} />
          })}
          <Route path="/" component={IndexPage} />
        </Switch>
        <Overlay />
      </Router>
    </>
  )
}
