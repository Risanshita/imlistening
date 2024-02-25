import React, { Component } from "react";
import {
  Collapse,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  NavItem,
  NavLink,
} from "reactstrap";
import {
  AiFillHome,
  AiOutlineHistory,
  AiOutlineTeam,
  AiOutlinePaperClip,
  AiOutlineLogin,
} from "react-icons/ai";
import { BarChartOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import logo from "./../assets/logo.png";
import "./NavMenu.css";
import { logout } from "../Util";
import { isLogin } from "../Util";
import event from "../event";

export class NavMenu extends Component {
  static displayName = NavMenu.name;
  constructor(props) {
    super(props);

    this.toggleNavbar = this.toggleNavbar.bind(this);
    this.state = {
      collapsed: true,
      isLoggedIn: isLogin(),
    };

    event.on("onLoggedIn", () => {
      this.setState({ ...this.state, isLoggedIn: true });
    });
    event.on("onLoggedOut", () => {
      this.setState({ ...this.state, isLoggedIn: false });
    });
  }

  toggleNavbar() {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
  render() {
    return (
      <header>
        <Navbar
          style={{ backgroundColor: "white" }}
          className="navbar-expand-sm navbar-toggleable-sm ng-white border-bottom box-shadow mb-3"
          container
          light
        >
          <NavbarBrand tag={Link} to="/">
            <img src={logo} alt="Logo" className="header-logo" />
          </NavbarBrand>
          <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
          <Collapse
            className="d-sm-inline-flex flex-sm-row-reverse"
            isOpen={!this.state.collapsed}
            navbar
          >
            <ul className="navbar-nav flex-grow">
              <NavLink tag={Link} className="menu" to="/">
                <AiFillHome className="menuIcon" /> Home
              </NavLink>
              <NavLink tag={Link} className="menu" to="/history">
                <AiOutlineHistory className="menuIcon" />
                History/Live
              </NavLink>
              <NavLink tag={Link} className="menu" to="/loadGraph">
                {/* <AreaChartOutlined  className="menuIcon"  /> */}
                <BarChartOutlined className="menuIcon" />
                Live Graph
              </NavLink>
              <NavLink tag={Link} className="menu" to="/Users">
                <AiOutlineTeam className="menuIcon" />
                Users
              </NavLink>
              <NavLink tag={Link} className="menu" to="/urls">
                <AiOutlinePaperClip className="menuIcon" />
                Urls
              </NavLink>
              <NavLink tag={Link} onClick={logout} className="menu" to="/login">
                <AiOutlineLogin className="menuIcon" />
                {this.state.isLoggedIn ? "Logout" : "Login"}
              </NavLink>
            </ul>
          </Collapse>
        </Navbar>
      </header>
    );
  }
}
