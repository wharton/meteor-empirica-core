import React from "react";
import PropTypes from "prop-types";

import { NavLink, Route, Switch } from "react-router-dom";
import { Helmet } from "react-helmet";

const configurationPaths = [
  "/admin/treatments",
  "/admin/treatments/archived",
  "/admin/factors",
  "/admin/factors/archived",
  "/admin/lobby-configurations",
  "/admin/lobby-configurations/archived"
];

import {
  Button,
  ButtonGroup,
  Classes,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  NavbarDivider,
  Tooltip,
  Position,
  Intent
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";

import AdminBatchesContainer from "../containers/admin/AdminBatchesContainer.jsx";
import AdminFactorsContainer from "../containers/admin/AdminFactorsContainer.jsx";
import AdminGames from "./admin/AdminGames.jsx";
import AdminLobbyConfigsContainer from "../containers/admin/AdminLobbyConfigsContainer.jsx";
import AdminPlayers from "./admin/AdminPlayers.jsx";
import AdminTreatmentsContainer from "../containers/admin/AdminTreatmentsContainer.jsx";
import { withStaticProps } from "./Helpers.jsx";

const NavBarLink = ({ path, name, exact = false }) => (
  <NavLink
    exact={exact}
    to={path}
    activeClassName={Classes.ACTIVE}
    className={[Classes.BUTTON, Classes.MINIMAL].join(" ")}
  >
    {name}
  </NavLink>
);

export default class Admin extends React.Component {
  constructor(props) {
    super(props);

    const mode = configurationPaths.includes(props.location.pathname)
      ? "configuration"
      : "monitoring";
    this.state = { mode };
  }

  componentDidMount() {
    this.redirectLoggedOut(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.redirectLoggedOut(nextProps);

    if (this.props.location.pathname !== nextProps.location.pathname) {
      const mode = configurationPaths.includes(nextProps.location.pathname)
        ? "configuration"
        : "monitoring";
      if (mode !== this.state.mode) {
        this.setState({ mode });
      }
    }
  }

  setMode = mode => {
    const { router } = this.context;

    let path;
    switch (mode) {
      case "monitoring":
        path = "/admin";
        break;
      case "configuration":
        path = "/admin/treatments";
        break;
      default:
        console.error(`unknown mode: ${mode}`);
        return;
    }

    this.setState({ mode });
    router.history.push(path);
  };

  resetDatabaseIsActived() {
    return Meteor.isDevelopment || Meteor.settings.public.debug_resetDatabase;
  }

  handleLogout = () => {
    Meteor.logout();
  };

  handleClear = () => {
    if (!this.resetDatabaseIsActived()) {
      return;
    }
    Meteor.call("adminResetDB", true);
  };

  handleReset = () => {
    const confirmed = confirm(
      "You are about to delete all data in the DB, are you sure you want to do that?"
    );
    if (!confirmed) {
      return;
    }
    const confirmed2 = confirm("Are you really sure?");
    if (!confirmed2) {
      return;
    }
    if (!this.resetDatabaseIsActived()) {
      return;
    }
    Meteor.call("adminResetDB");
  };

  redirectLoggedOut(props) {
    const { user, loggingIn, loginPath } = props;
    const { router } = this.context;

    if (!loggingIn && !user) {
      router.history.push(loginPath || `/login`);
    }
  }

  render() {
    const { user, loggingIn } = this.props;
    const { mode } = this.state;

    if (loggingIn || !user) {
      return null;
    }

    const navbarClasses = ["header"];

    const isConfigMode = mode === "configuration";
    if (isConfigMode) {
      navbarClasses.push(Classes.DARK);
    }

    return (
      <div className="admin">
        <Helmet>
          <title>Empirica Admin</title>
        </Helmet>
        <Navbar className={navbarClasses.join(" ")}>
          <NavbarGroup align="left">
            <NavbarHeading>Empirica Admin</NavbarHeading>
            {isConfigMode ? (
              <>
                <NavBarLink path="/admin/treatments" name="Treatments" />
                <NavBarLink path="/admin/factors" name="Factors" />
                <NavBarLink
                  path="/admin/lobby-configurations"
                  name="Lobby Configurations"
                />
              </>
            ) : (
              <>
                <NavBarLink exact path="/admin" name="Batches" />
                <NavBarLink path="/admin/games" name="Games" />
                <NavBarLink path="/admin/players" name="Players" />
              </>
            )}
          </NavbarGroup>

          <NavbarGroup align="right">
            <Button
              className={Classes.MINIMAL}
              icon={IconNames.LOG_OUT}
              text="Logout"
              onClick={this.handleLogout}
            />
          </NavbarGroup>

          {this.resetDatabaseIsActived() ? (
            <NavbarGroup align="right">
              <Tooltip
                content="This will remove batches/games/players and keep treatments/factors"
                position={Position.BOTTOM}
              >
                <Button
                  className={Classes.MINIMAL}
                  icon={IconNames.ERASER}
                  text="Clear Games"
                  onClick={this.handleClear}
                />
              </Tooltip>
              <Tooltip
                content="This clears the entire database!"
                position={Position.BOTTOM}
                intent={Intent.DANGER}
              >
                <Button
                  className={Classes.MINIMAL}
                  icon={IconNames.TRASH}
                  text="Reset App"
                  onClick={this.handleReset}
                />
              </Tooltip>
              <NavbarDivider />
            </NavbarGroup>
          ) : (
            ""
          )}

          <NavbarGroup align="right">
            <ButtonGroup>
              <Button
                active={!isConfigMode}
                icon={IconNames.PLAY}
                onClick={this.setMode.bind(this, "monitoring")}
              >
                Monitoring
              </Button>
              <Button
                active={isConfigMode}
                icon={IconNames.COG}
                onClick={this.setMode.bind(this, "configuration")}
              >
                Configuration
              </Button>
            </ButtonGroup>
            <NavbarDivider />
          </NavbarGroup>
        </Navbar>

        <main>
          <Switch>
            <Route path="/admin" exact component={AdminBatchesContainer} />
            <Route
              path="/admin/batches/archived"
              component={withStaticProps(AdminBatchesContainer, {
                archived: true
              })}
            />
            <Route path="/admin/games" component={AdminGames} />
            <Route path="/admin/players" component={AdminPlayers} />
            <Route
              path="/admin/treatments/archived"
              component={withStaticProps(AdminTreatmentsContainer, {
                archived: true
              })}
            />
            <Route
              path="/admin/treatments"
              component={withStaticProps(AdminTreatmentsContainer, {
                archived: false
              })}
            />
            <Route
              path="/admin/lobby-configurations/archived"
              component={withStaticProps(AdminLobbyConfigsContainer, {
                archived: true
              })}
            />
            <Route
              path="/admin/lobby-configurations"
              component={withStaticProps(AdminLobbyConfigsContainer, {
                archived: false
              })}
            />
            <Route
              path="/admin/factors/archived"
              component={withStaticProps(AdminFactorsContainer, {
                archived: true
              })}
            />
            <Route path="/admin/factors" component={AdminFactorsContainer} />
          </Switch>
        </main>
      </div>
    );
  }
}

Admin.propTypes = {
  user: PropTypes.object, // Current meteor user
  loggingIn: PropTypes.bool, // Current meteor user logging in
  loading: PropTypes.bool // Subscription status
};

Admin.contextTypes = {
  router: PropTypes.object
};
