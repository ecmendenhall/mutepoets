import { MemoryRouter, Redirect, Route, Switch } from "react-router-dom";
import Home from "../pages/Home";

const Routes = () => {
  return (
    <MemoryRouter>
      <Switch>
        <Route exact path="/home">
          <Home />
        </Route>
        <Route exact path="/">
          <Redirect to="/home" />
        </Route>
      </Switch>
    </MemoryRouter>
  );
};

export default Routes;
