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

import AutoService from "./components/auto_services/autoService.component";
import AddAutoService from "./components/auto_services/add_autoService.component";

import RentalCenter from "./components/rental_centers/rentalCenter.component";

import MakeServiceAppointment from "./components/service_appointments/make_service_appointment.component";
import MyServiceAppointments from "./components/service_appointments/my_service_appointments.component";

import AddRentalAnnouncement from "./components/rental_announcements/add_rental_announcement.component";
import RentalAnnouncement from "./components/rental_announcements/rental_announcement.component";

import SellingAnnouncement from "./components/selling_announcements/selling_announcement.component";
import PendingAnnouncements from "./components/selling_announcements/pending_announcements";

import DeleteProfile from "./components/authentication/delete_profile.component";

import UserReport from "./components/users/user_report.component";

import OrganisationStats from "./components/organisations/organisation_stats.component";
import EditAutoService from "./components/auto_services/edit_autoService.component";

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

                        <li className="nav-item">
                            <span style={{color: "white", fontSize: "30px"}}>ExclusiveCars</span>
                        </li>
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
                        <Route exact path="/profile/delete" component={DeleteProfile} />

                        <Route exact path={["/", "/news"]} component={News} />
                        <Route exact path={"/news/add"} component={AddNews} />
                        <Route exact path={"/news/edit/:id"} component={EditNews} />
                        <Route exact path={"/news/:id"} component={NewsArticle} />

                        <Route exact path={"/organisations"} component={AllOrganisations} />
                        <Route exact path={"/organisations/add"} component={AddOrganisation} />
                        <Route exact path={"/organisations/edit"} component={EditOrganisation} />
                        <Route exact path={"/organisations/myOrganisation"} component={MyOrganisation} />
                        <Route exact path={"/organisations/myStats"} component={OrganisationStats} />
                        <Route exact path={"/organisations/:id"} component={Organisation} />

                        <Route exact path={"/autoServices/add"} component={AddAutoService} />
                        <Route exact path={"/autoServices/edit/:id"} component={EditAutoService} />
                        <Route exact path={"/autoServices/:id"} component={AutoService} />

                        <Route exact path={"/rentalCenters/:id"} component={RentalCenter} />

                        <Route exact path={"/rentalAnnouncements/add/:rentalCenterId"} component={AddRentalAnnouncement} />
                        <Route exact path={"/rentalAnnouncements/:id"} component={RentalAnnouncement} />

                        <Route exact path={"/announcements/pending"} component={PendingAnnouncements} />

                        <Route exact path={"/sellingAnnouncements/:id"} component={SellingAnnouncement} />

                        <Route exact path={"/serviceAppointments"} component={MyServiceAppointments} />
                        <Route exact path={"/serviceAppointments/makeAppointment/:serviceId"} component={MakeServiceAppointment} />

                        <Route exact path={"/users/report/:userId"} component={UserReport} />
                    </Switch>
                </div>
            </div>
        );
    }
}

export default App;
