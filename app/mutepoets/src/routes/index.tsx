import { MemoryRouter, Redirect, Route, Switch } from "react-router-dom";
import About from "../pages/About";
import Claim from "../pages/Claim";
import Vows from "../pages/Vows";

const Routes = () => {
  return (
    <MemoryRouter>
      <Switch>
        <Route exact path="/vows">
          <Vows />
        </Route>
        <Route exact path="/claim">
          <Claim />
        </Route>
        <Route exact path="/about">
          <About />
        </Route>
        <Route exact path="/">
          <Redirect to="/vows" />
        </Route>
      </Switch>
    </MemoryRouter>
  );
};

export default Routes;
