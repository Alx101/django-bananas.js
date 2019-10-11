import { List, ListSubheader } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import PropTypes from "prop-types";
import React from "react";

import AdminContext from "./context";
import MenuItem from "./MenuItem";

const styles = theme => ({
  root: {
    "&$verticalRoot > $list + $list": {
      borderTopWidth: 1,
      borderTopStyle: "solid",
      borderTopColor: theme.palette.action.selected,
    },
    "&$horizontalRoot": {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
      "& $list:first-child": {
        marginLeft: "auto",
      },
      "& $list:last-child": {
        marginRight: "auto",
      },
    },
  },
  verticalRoot: {},
  horizontalRoot: {},

  // List
  list: {
    "&:first-child": {
      paddingTop: 0,
    },
    "&:last-child": {
      paddingBottom: 0,
    },
  },
  horizontal: {
    display: "flex",
    flexDirection: "row",
  },
  vertical: {
    "&multiple": {
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
    },
  },
  dense: {},
  multiple: {},

  // Subheader
  subheader: {
    backgroundColor: theme.palette.background.paper,
    textTransform: "uppercase",
    fontSize: `${0.75}rem`,
    overflow: "hidden",
    height: 32,
    display: "flex",
    alignItems: "center",
  },
  subheaderCollapsed: {
    height: 0,
    transition: theme.transitions.create("height", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  subheaderExpanded: {
    transition: theme.transitions.create("height", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
});

class Navigation extends React.Component {
  static contextType = AdminContext;

  render() {
    const currentUrl = this.context.router.history.location.pathname;
    const {
      routes,
      collapsed,
      horizontal,
      dense,
      nav,
      showIcons,
      classes,
    } = this.props;

    const navKeys = Object.keys(nav);

    // Put items listed in `nav` first, then keep the original (alphabetical) order.
    const indexMap = routes.reduce((result, route, index) => {
      const navIndex = navKeys.indexOf(route.id);
      result[route.id] = navIndex >= 0 ? navIndex : index + navKeys.length;
      return result;
    }, {});

    const sortedRoutes = routes
      .slice()
      .sort((a, b) => indexMap[a.id] - indexMap[b.id]);

    const groupedRoutes = sortedRoutes.reduce((result, route) => {
      const { app } = route;
      let appRoutes = result[app];
      if (appRoutes === undefined) {
        appRoutes = [];
        result[app] = appRoutes;
      }
      appRoutes.push(route);
      return result;
    }, {});

    const apps = Object.keys(groupedRoutes);
    const multipleApps = apps.length > 2;

    return (
      <div
        className={classNames(classes.root, {
          [classes.verticalRoot]: !horizontal,
          [classes.horizontalRoot]: horizontal,
        })}
      >
        {apps.map(app => {
          const appRoutes = groupedRoutes[app];
          return (
            <List
              key={app}
              disablePadding
              className={classNames(classes.list, {
                [classes.horizontal]: horizontal,
                [classes.vertical]: !horizontal,
                [classes.dense]: horizontal && dense,
                [classes.multiple]: multipleApps,
              })}
              subheader={
                app &&
                multipleApps &&
                !horizontal && (
                  <ListSubheader
                    className={classNames(classes.subheader, {
                      [classes.subheaderCollapsed]: collapsed,
                      [classes.subheaderExpanded]: !collapsed,
                    })}
                  >
                    {app}
                  </ListSubheader>
                )
              }
            >
              {appRoutes.map(
                ({ id, path, title }) =>
                  // Only show "Dashboard" item in vertical+icon mode
                  ((!horizontal &&
                    (showIcons || (!showIcons && id !== "home"))) ||
                    (horizontal && id !== "home")) && (
                    <MenuItem
                      key={id}
                      route={id}
                      variant={horizontal ? "appbar" : "drawer"}
                      title={title}
                      icon={showIcons ? nav[id] : null}
                      dense={dense}
                      selected={
                        path.length > 1
                          ? currentUrl.startsWith(path)
                          : currentUrl === path
                      }
                      collapsed={collapsed}
                    />
                  )
              )}
            </List>
          );
        })}
      </div>
    );
  }
}

Navigation.propTypes = {
  classes: PropTypes.object.isRequired,
  routes: PropTypes.array.isRequired,
  collapsed: PropTypes.bool,
  horizontal: PropTypes.bool,
  dense: PropTypes.bool,
  nav: PropTypes.object.isRequired,
  showIcons: PropTypes.bool,
};
Navigation.defaultProps = {
  collapsed: false,
  horizontal: false,
  dense: true,
  showIcons: false,
};

export default withStyles(styles)(Navigation);
