import React, {Component, useEffect, useState} from "react";
import {Button, Nav, NavItem, NavLink, TabContent, TabPane} from "reactstrap";
import {Link} from "react-router-dom";
import AuthService from "../../services/auth.service";
import authHeader from "../../services/auth-header";
import classnames from "classnames";

function Pagination({ data, RenderComponent, pageLimit, dataLimit}) {
    const [pages] = useState(Math.round(data.length / dataLimit));
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        window.scrollTo({ behavior: 'smooth', top: '0px' });
    }, [currentPage]);

    function goToNextPage() {
        setCurrentPage((page) => {
            if(page < pageLimit) {
                return page + 1;
            }
            return page;
        });
    }

    function goToPreviousPage() {
        setCurrentPage((page) => {
            if(page > 1) {
                return page - 1;
            }
            return page;
        });
    }

    function changePage(event) {
        const pageNumber = Number(event.target.textContent);
        setCurrentPage(pageNumber);
    }

    const getPaginatedData = () => {
        const startIndex = currentPage * dataLimit - dataLimit;
        const endIndex = startIndex + dataLimit;
        return data.slice(startIndex, endIndex);
    };

    const getPaginationGroup = () => {
        let start = Math.floor((currentPage - 1) / pageLimit) * pageLimit;
        return new Array(pageLimit).fill().map((_, idx) => start + idx + 1);
    };

    return (
        <div>
            <div className="dataContainer">
                {getPaginatedData().map((d, idx) => (
                    <RenderComponent key={idx} data={d} />
                ))}
            </div>

            <div className="pagination" style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                {/* previous button */}
                <button
                    onClick={goToPreviousPage}
                    className={`prev ${currentPage === 1 ? 'disabled' : ''}`}
                >
                    pagina anterioară
                </button>

                {/* show page numbers */}
                {getPaginationGroup().map((item, index) => (
                    <button
                        key={index}
                        onClick={changePage}
                        className={`paginationItem ${currentPage === item ? 'active' : null}`}
                    >
                        <span>{item}</span>
                    </button>
                ))}

                {/* next button */}
                <button
                    onClick={goToNextPage}
                    className={`next ${currentPage === pages ? 'disabled' : ''}`}
                >
                    pagina următoare
                </button>
            </div>
        </div>
    );
}

function RentalAnnouncementRepresentation(props) {
    const {id, state, rentalCenter, car} = props.data;
    return (
        <div className="jumbotron" style={{paddingTop: "20px", paddingBottom: "20px"}}>
            <div className={"row"}>
                <div className={"column"} style={{width: "320px"}}>
                    <img height={"220px"} width={"280px"} src={`${process.env.PUBLIC_URL}/assets/images/${car["images"][0]["name"]}`} alt={":("} />
                </div>

                <div className={"column"}>
                    <h2>{car["model"]["manufacturer"] + " " + car["model"]["model"] + " " + car["year"]}</h2>
                    <div className={"row"}>
                        <div className={"column"} style={{width: "50%"}}>
                            <ul>
                                <li>Categoria: {car["model"]["category"]}</li>
                                <li>Kilometraj: {car["kilometers"]}</li>
                                <li>Preț: {car["price"]} €</li>
                                <li>Capacitate motor: {car["engine"]} cm<sup>3</sup></li>
                                <li>Putere motor: {car["power"]} CP</li>
                            </ul>
                        </div>

                        <div className={"column"} style={{width: "50%"}}>
                            <ul>
                                <li>Centrul: {rentalCenter["name"]}</li>
                                <li>Localitate: {rentalCenter["city"] + ", " + rentalCenter["address"]}</li>
                                <li>Telefon: {rentalCenter["phone"]}</li>
                                <li>Email: {rentalCenter["email"]}</li>
                            </ul>
                        </div>

                        <Button style={{width: "100%"}} color={"info"} tag={Link} to={`/rentalAnnouncements/${id}`}>Deschide anunțul</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default class MyRentalAnnouncements extends Component {

    constructor(props) {
        super(props);

        this.state = {
            rentalAnnouncements: [],
            approvedAnnouncements: [],
            unapprovedAnnouncements: [],
            loading: true,
            activeTab: '1'
        };

        this.currentUser = AuthService.getCurrentUser();
    }

    componentDidMount() {
        document.title = "Anunțurile mele";
        this.setState({loading: true});
        fetch("http://localhost:8090/api/rentalAnnouncements/mine", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => response.json())
            .then((data) => {
                for(let i in data) {
                    if(data[i]["state"] === "ACCEPTED") {
                        this.state.approvedAnnouncements.push(data[i]);
                    } else {
                        this.state.unapprovedAnnouncements.push(data[i]);
                    }
                }
                this.setState({rentalAnnouncements: data, loading: false});
            });
    }

    hasAccess(user) {
        return user !== null && user.roles.includes("ROLE_ORGANISATION");
    }

    toggle(tab) {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    hideAlert() {
        const notification = document.getElementById("notification");
        notification.style.display = "none";
        localStorage.setItem("infoMessage", "");
    }

    render() {

        if(!this.hasAccess(this.currentUser)) {
            setTimeout(() => {
                this.props.history.push("/news");
                window.location.reload();
            }, 2000);
            return (
                <div className={"col-md-12"}>
                    <h1>Nu aveți dreptul de a accesa această pagină!</h1>
                    <h1>Veți fi redirecționat...</h1>
                </div>
            );
        }

        const loading = this.state.loading;

        if(loading) {
            return (
                <h1>Se încarcă...</h1>
            );
        }

        return (
            <div className={"col-md-12"}>
                {localStorage.getItem("infoMessage") !== "" && localStorage.getItem("infoMessage") !== null && (
                    <div
                        id={"notification"}
                        role="alert"
                        className={"alert alert-info alert-dismissible"}
                    >
                        <button
                            type="button"
                            className="close"
                            data-dismiss="alert"
                            aria-label="Close"
                            onClick={() => this.hideAlert()}
                        >
                            <span aria-hidden="true">&times;</span>
                        </button>
                        {localStorage.getItem("infoMessage")}
                    </div>
                )}
                <div style={{height: "50px"}}>
                    <h1 style={{float: "left"}}>Anunțurile mele</h1>
                </div>
                <br/>

                <div>
                    <Nav tabs>
                        <NavItem>
                            <NavLink
                                className={classnames({ active: this.state.activeTab === '1' })}
                                onClick={() => { this.toggle('1'); }}
                            >
                                Anunțuri aprobate
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                className={classnames({ active: this.state.activeTab === '2' })}
                                onClick={() => { this.toggle('2'); }}
                            >
                                Anunțuri neaprobate
                            </NavLink>
                        </NavItem>
                    </Nav>

                    <br/>



                    <TabContent activeTab={this.state.activeTab}>
                        <TabPane tabId="1">

                            {this.state.approvedAnnouncements.length > 0 ? (
                                <>
                                    <div style={{height: "40px"}}>
                                        <h1 style={{float: "left"}}>Anunțuri aprobate</h1>
                                    </div>

                                    <br/>

                                    <Pagination
                                        data={this.state.approvedAnnouncements}
                                        RenderComponent={RentalAnnouncementRepresentation}
                                        title="Anunțuri aprobate"
                                        pageLimit={5}
                                        dataLimit={5}
                                        tabName={"approved announcements"}
                                    />
                                    <br/>
                                    <br/>
                                    <br/>
                                </>
                            ) : (
                                <div>
                                    <h2 style={{float: "left"}}>Nu există niciun anunț aprobat!</h2>
                                </div>
                            )}
                        </TabPane>


                        <TabPane tabId="2">

                            {this.state.unapprovedAnnouncements.length > 0 ? (
                                <>
                                    <div style={{height: "40px"}}>
                                        <h1 style={{float: "left"}}>Anunțuri neaprobate</h1>
                                    </div>

                                    <br/>

                                    <Pagination
                                        data={this.state.unapprovedAnnouncements}
                                        RenderComponent={RentalAnnouncementRepresentation}
                                        title="Anunțuri neaprobate"
                                        pageLimit={5}
                                        dataLimit={5}
                                        tabName={"unapproved announcements"}
                                    />
                                    <br/>
                                    <br/>
                                    <br/>
                                </>
                            ) : (
                                <div>
                                    <h2 style={{float: "left"}}>Nu există niciun anunț neaprobat!</h2>
                                </div>
                            )}
                        </TabPane>
                    </TabContent>
                </div>
            </div>
        );
    }
}