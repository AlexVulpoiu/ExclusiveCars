import React, { Component } from "react";
import { Switch, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import Image from "./app_logo.jpg";

import AuthService from "./services/auth.service";

import Login from "./components/authentication/login.component";
import Register from "./components/authentication/register.component";
import Profile from "./components/authentication/profile.component";

import News from "./components/news/news.component";
import NewsArticle from "./components/news/news_article.component";
import AddNews from "./components/news/add_news.component";
import EditNews from "./components/news/edit_news.component";

import AllOrganisations from "./components/organisations/all_organisations.component";
import AddOrganisation from "./components/organisations/add_organisation.component";
import EditOrganisation from "./components/organisations/edit_organisation.component";
import Organisation from "./components/organisations/organisation.component";
import MyOrganisation from "./components/organisations/my_organisation.component";
import Navbar from "./components/side_menu/Navbar";

class App extends Component {
    constructor(props) {
        super(props);
        this.logOut = this.logOut.bind(this);

        this.state = {
            showModeratorBoard: false,
            showAdminBoard: false,
            currentUser: undefined,
        };
    }

    componentDidMount() {
        const user = AuthService.getCurrentUser();

        if (user) {
            this.setState({
                currentUser: user,
                isOnlyUser: user.roles.length === 1,
                isOrganisation: user.roles.includes("ROLE_ORGANISATION"),
                isModerator: user.roles.includes("ROLE_MODERATOR"),
                isAdmin: user.roles.includes("ROLE_ADMIN"),
            });
        }
    }

    logOut() {
        AuthService.logout();
    }

    render() {
        const { currentUser, isModerator, isAdmin } = this.state;
        const imageStyle = {
            width: "70px",
            height: "70px"
        };

        return (
            <div>
                <nav className="navbar navbar-expand navbar-dark bg-dark" style={{position: "sticky", top: 0, zIndex: 5}}>
                    <Navbar />
                    <Link to={"/"} className="navbar-brand">
                        <img src={Image} style={imageStyle} alt={":((("}/>
                    </Link>
                    <div className="navbar-nav mr-auto">
                        {/*<li className="nav-item">*/}
                        {/*    <Link to={"/news"} className="nav-link">*/}
                        {/*        Secțiune știri*/}
                        {/*    </Link>*/}
                        {/*</li>*/}

                        <li className="nav-item">
                            <span style={{color: "white", fontSize: "30px"}}>ExclusiveCars</span>
                        </li>

                        {(isModerator || isAdmin) && (
                            <li className="nav-item">
                                <Link to={"/organisations"} className="nav-link">
                                    Organizații
                                </Link>
                            </li>
                        )}

                        {currentUser && this.state.isOnlyUser && (
                            <li className="nav-item">
                                <Link to={"/organisations/add"} className="nav-link">
                                    Creează organizație
                                </Link>
                            </li>
                        )}

                        {currentUser && this.state.isOrganisation && (
                            <li className="nav-item">
                                <Link to={"/organisations/myOrganisation"} className="nav-link">
                                    Organizația mea
                                </Link>
                            </li>
                        )}
                    </div>

                    {currentUser ? (
                        <div className="navbar-nav ml-auto">
                            <li className="nav-item">
                                <Link to={"/profile"} className="nav-link">
                                    {currentUser.username}
                                </Link>
                            </li>
                            <li className="nav-item">
                                <a href="/login" className="nav-link" onClick={this.logOut}>
                                    LogOut
                                </a>
                            </li>
                        </div>
                    ) : (
                        <div className="navbar-nav ml-auto">
                            <li className="nav-item">
                                <Link to={"/login"} className="nav-link">
                                    Login
                                </Link>
                            </li>

                            <li className="nav-item">
                                <Link to={"/register"} className="nav-link">
                                    Sign Up
                                </Link>
                            </li>
                        </div>
                    )}
                </nav>

                <div className="container mt-3">
                    <Switch>
                        <Route exact path="/login" component={Login} />
                        <Route exact path="/register" component={Register} />
                        <Route exact path="/profile" component={Profile} />

                        <Route exact path={["/", "/news"]} component={News} />
                        <Route exact path={"/news/add"} component={AddNews} />
                        <Route exact path={"/news/edit/:id"} component={EditNews} />
                        <Route exact path={"/news/:id"} component={NewsArticle} />

                        <Route exact path={"/organisations"} component={AllOrganisations} />
                        <Route exact path={"/organisations/add"} component={AddOrganisation} />
                        <Route exact path={"/organisations/edit"} component={EditOrganisation} />
                        <Route exact path={"/organisations/myOrganisation"} component={MyOrganisation} />
                        <Route exact path={"/organisations/:id"} component={Organisation} />
                    </Switch>
                </div>
            </div>
        );
    }
}

export default App;
