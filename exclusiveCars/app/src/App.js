import React, { Component } from "react";
import { Switch, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import Image from "./app_logo.jpg";

import AuthService from "./services/auth.service";

import Login from "./components/authentication/login.component";
import Register from "./components/authentication/register.component";
import Profile from "./components/authentication/profile.component";
import DeleteProfile from "./components/authentication/delete_profile.component";

import News from "./components/news/news.component";
import NewsArticle from "./components/news/news_article.component";
import AddNews from "./components/news/add_news.component";
import EditNews from "./components/news/edit_news.component";

import AllOrganisations from "./components/organisations/all_organisations.component";
import AddOrganisation from "./components/organisations/add_organisation.component";
import EditOrganisation from "./components/organisations/edit_organisation.component";
import Organisation from "./components/organisations/organisation.component";
import MyOrganisation from "./components/organisations/my_organisation.component";
import OrganisationStats from "./components/organisations/organisation_stats.component";
import DeleteOrganisation from "./components/organisations/delete_organisation.component";

import Navbar from "./components/side_menu/Navbar";

import AutoService from "./components/auto_services/autoService.component";
import AddAutoService from "./components/auto_services/add_autoService.component";
import EditAutoService from "./components/auto_services/edit_autoService.component";
import AllAutoServices from "./components/auto_services/autoServices.component";
import MyAutoServices from "./components/auto_services/my_auto_services.component";

import RentalCenter from "./components/rental_centers/rentalCenter.component";
import AllRentalCenters from "./components/rental_centers/rental_centers.component";
import AddRentalCenter from "./components/rental_centers/add_rental_center.component";
import EditRentalCenter from "./components/rental_centers/edit_rental_center.component";
import MyRentalCenters from "./components/rental_centers/my_rental_centers.component";

import MakeServiceAppointment from "./components/service_appointments/make_service_appointment.component";
import MyServiceAppointments from "./components/service_appointments/my_service_appointments.component";
import ServiceAppointmentsForAutoService from "./components/service_appointments/service_appointments_for_autoService.component";
import ServiceAppointmentsForMyOrganisation
    from "./components/service_appointments/service_appointments_for_my_organisation";

import MyRentals from "./components/rental_announcements/my_rentals.component";
import AddRentalAnnouncement from "./components/rental_announcements/add_rental_announcement.component";
import RentalAnnouncement from "./components/rental_announcements/rental_announcement.component";
import RentalAnnouncementsFromRentalCenter
    from "./components/rental_announcements/rental_announcements_from_rental_center";
import MyRentalAnnouncements from "./components/rental_announcements/my_rental_announcements.component";
import EditRentalAnnouncement from "./components/rental_announcements/edit_rental_announcement.component";
import MyRentalRequests from "./components/rental_announcements/my_rental_requests.component";
import RentalsForCar from "./components/rental_announcements/rentals_for_car.component";
import RentalAnnouncements from "./components/rental_announcements/rental_announcements.component";

import SellingAnnouncement from "./components/selling_announcements/selling_announcement.component";
import PendingAnnouncements from "./components/selling_announcements/pending_announcements";
import AddSellingAnnouncement from "./components/selling_announcements/add_selling_announcement.component";
import SellingAnnouncements from "./components/selling_announcements/selling_announcements.component";
import MySellingAnnouncements from "./components/selling_announcements/my_selling_announcements.component";
import EditSellingAnnouncement from "./components/selling_announcements/edit_selling_announcement.component";

import FavoriteAnnouncements from "./components/favorite_announcements/favorite_announcements.component";

import UserReport from "./components/users/user_report.component";
import EditProfile from "./components/users/edit_profile.component";
import UsersManagement from "./components/users/users_management.component";
import DeleteUser from "./components/users/delete_user.component";

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
                        <Route exact path={"/profile/edit"} component={EditProfile} />
                        <Route exact path="/profile/delete" component={DeleteProfile} />

                        <Route exact path={["/", "/news"]} component={News} />
                        <Route exact path={"/news/add"} component={AddNews} />
                        <Route exact path={"/news/edit/:id"} component={EditNews} />
                        <Route exact path={"/news/:id"} component={NewsArticle} />

                        <Route exact path={"/organisations"} component={AllOrganisations} />
                        <Route exact path={"/organisations/add"} component={AddOrganisation} />
                        <Route exact path={"/organisations/edit"} component={EditOrganisation} />
                        <Route exact path={"/organisations/delete/:id"} component={DeleteOrganisation} />
                        <Route exact path={"/organisations/myOrganisation"} component={MyOrganisation} />
                        <Route exact path={"/organisations/myStats"} component={OrganisationStats} />
                        <Route exact path={"/organisations/:id"} component={Organisation} />

                        <Route exact path={"/myAutoServices"} component={MyAutoServices} />
                        <Route exact path={"/autoServices"} component={AllAutoServices} />
                        <Route exact path={"/autoServices/add"} component={AddAutoService} />
                        <Route exact path={"/autoServices/edit/:id"} component={EditAutoService} />
                        <Route exact path={"/autoServices/:id"} component={AutoService} />

                        <Route exact path={"/myRentalCenters"} component={MyRentalCenters} />
                        <Route exact path={"/rentalCenters"} component={AllRentalCenters} />
                        <Route exact path={"/rentalCenters/add"} component={AddRentalCenter} />
                        <Route exact path={"/rentalCenters/edit/:id"} component={EditRentalCenter} />
                        <Route exact path={"/rentalCenters/:id"} component={RentalCenter} />

                        <Route exact path={"/myRentals"} component={MyRentals} />
                        <Route exact path={"/rentCars/rentals/:rentalAnnouncementId"} component={RentalsForCar} />
                        <Route exact path={"/myRentalRequests"} component={MyRentalRequests} />

                        <Route exact path={"/myRentalAnnouncements"} component={MyRentalAnnouncements} />
                        <Route exact path={"/rentalAnnouncements"} component={RentalAnnouncements} />
                        <Route exact path={"/rentalAnnouncements/fromRentalCenter/:id"} component={RentalAnnouncementsFromRentalCenter} />
                        <Route exact path={"/rentalAnnouncements/add/:rentalCenterId"} component={AddRentalAnnouncement} />
                        <Route exact path={"/rentalAnnouncements/edit/:id"} component={EditRentalAnnouncement} />
                        <Route exact path={"/rentalAnnouncements/:id"} component={RentalAnnouncement} />

                        <Route exact path={"/pendingAnnouncements"} component={PendingAnnouncements} />

                        <Route exact path={"/mySellingAnnouncements"} component={MySellingAnnouncements} />
                        <Route exact path={"/sellingAnnouncements"} component={SellingAnnouncements} />
                        <Route exact path={"/sellingAnnouncements/add"} component={AddSellingAnnouncement} />
                        <Route exact path={"/sellingAnnouncements/edit/:id"} component={EditSellingAnnouncement} />
                        <Route exact path={"/sellingAnnouncements/:id"} component={SellingAnnouncement} />

                        <Route exact path={"/favoriteAnnouncements"} component={FavoriteAnnouncements} />

                        <Route exact path={"/myServiceAppointments"} component={ServiceAppointmentsForMyOrganisation} />
                        <Route exact path={"/serviceAppointments"} component={MyServiceAppointments} />
                        <Route exact path={"/serviceAppointments/makeAppointment/:serviceId"} component={MakeServiceAppointment} />
                        <Route exact path={"/serviceAppointments/:serviceId"} component={ServiceAppointmentsForAutoService} />

                        <Route exact path={"/users/delete/:id"} component={DeleteUser} />
                        <Route exact path={"/users/report/:userId"} component={UserReport} />
                        <Route exact path={"/users/management"} component={UsersManagement} />
                    </Switch>
                </div>
            </div>
        );
    }
}

export default App;
