import React, {Component, useEffect, useState} from "react";
import authHeader from "../../services/auth-header";
import AuthService from "../../services/auth.service";
import {Button, Nav, NavItem, NavLink, TabContent, TabPane} from "reactstrap";
import {Link} from "react-router-dom";
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


            {/* show the posts, 10 posts at a time */}
            <div className="dataContainer">
                {getPaginatedData().map((d, idx) => (
                    <RenderComponent key={idx} data={d} />
                ))}
            </div>

            {/* show the pagiantion
                it consists of next and previous buttons
                along with page numbers, in our case, 5 page
                numbers at a time
            */}
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
    const {id, car, rentalCenter} = props.data;
    return (
        <div className="jumbotron" style={{paddingTop: "20px", paddingBottom: "20px"}}>
            <div className={"row"}>
                <div className={"column"} style={{width: "35%"}}>
                    <img height={"220px"} src={`${process.env.PUBLIC_URL}/assets/images/${car["images"][0]["name"]}`} alt={":("} />
                </div>

                <div className={"row"}>
                    <div className={"column"} style={{width: "50%"}}>
                        <h2>{car["model"]["manufacturer"] + " " + car["model"]["model"] + " " + car["year"]}</h2>
                        <ul>
                            <li>Categoria: {car["model"]["category"]}</li>
                            <li>Kilometraj: {car["kilometers"]}</li>
                            <li>Preț: {car["price"]} €</li>
                            <li>Capacitate motor: {car["engine"]} cm<sup>3</sup></li>
                            <li>Putere motor: {car["power"]} CP</li>
                        </ul>
                    </div>

                    <div className={"column"} style={{width: "50%"}}>
                        <br/>
                        <br/>
                        <ul>
                            <li>Centru: {rentalCenter["name"]}</li>
                            <li>Locație: {rentalCenter["city"] + ", " + rentalCenter["address"]}</li>
                            <li>Telefon: {rentalCenter["phone"]}</li>
                            <li>Email: {rentalCenter["email"]}</li>
                        </ul>
                    </div>

                    <Button style={{width: "100%"}} color={"info"} tag={Link} to={`/rentalAnnouncements/${id}`}>Deschide anunțul</Button>
                </div>
            </div>
        </div>
    );
}

function SellingAnnouncementRepresentation(props) {
    const {id, car, user} = props.data;
    return (
        <div className="jumbotron" style={{paddingTop: "20px", paddingBottom: "20px"}}>
            <div className={"row"}>
                <div className={"column"} style={{width: "35%"}}>
                    <img height={"220px"} width={"300px"} src={`${process.env.PUBLIC_URL}/assets/images/${car["images"][0]["name"]}`} alt={":("} />
                </div>

                <div className={"row"}>
                    <div className={"column"} style={{width: "50%"}}>
                        <h2>{car["model"]["manufacturer"] + " " + car["model"]["model"] + " " + car["year"]}</h2>
                        <ul>
                            <li>Categoria: {car["model"]["category"]}</li>
                            <li>Kilometraj: {car["kilometers"]}</li>
                            <li>Preț: {car["price"]} €</li>
                            <li>Capacitate motor: {car["engine"]} cm<sup>3</sup></li>
                            <li>Putere motor: {car["power"]} CP</li>
                        </ul>
                    </div>

                    <div className={"column"} style={{width: "50%"}}>
                        <br/>
                        <br/>
                        <ul>
                            <li>Nume: {user["firstName"] + " " + user["lastName"]}</li>
                            <li>Localitate: {car["location"]}</li>
                            <li>Telefon: {user["phone"]}</li>
                            <li>Email: {user["email"]}</li>
                        </ul>
                    </div>

                    <Button style={{width: "100%"}} color={"info"} tag={Link} to={`/sellingAnnouncements/${id}`}>Deschide anunțul</Button>
                </div>
            </div>
        </div>
    );
}

export default class PendingAnnouncements extends Component {

    constructor(props) {
        super(props);

        this.state = {
            pendingSellingAnnouncements: [],
            pendingRentalAnnouncements: [],
            loading: true,
            activeTab: '1'
        };

        this.currentUser = AuthService.getCurrentUser();
    }

    componentDidMount() {
        this.setState({loading: true});
        document.title = "Anunțuri de aprobat";
        fetch("http://localhost:8090/api/sellingAnnouncements/pending", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => response.json())
            .then((data) => this.setState({pendingSellingAnnouncements: data}));

        fetch("http://localhost:8090/api/rentalAnnouncements/pending", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => response.json())
            .then((data) => this.setState({pendingRentalAnnouncements: data, loading: false}));
    }

    hasAccess(user) {
        return user !== null && (user.roles.includes("ROLE_MODERATOR") || user.roles.includes("ROLE_ADMIN"));
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

        return (
            <>
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
                    <h1 style={{float: "left"}}>Anunțuri de aprobat</h1>
                </div>
                <br/>
                <br/>

                <div>
                    <Nav tabs>
                        <NavItem>
                            <NavLink
                                className={classnames({ active: this.state.activeTab === '1' })}
                                onClick={() => { this.toggle('1'); }}
                            >
                                Anunțuri de vânzare
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                className={classnames({ active: this.state.activeTab === '2' })}
                                onClick={() => { this.toggle('2'); }}
                            >
                                Anunțuri de închiriere
                            </NavLink>
                        </NavItem>
                    </Nav>

                    <br/>



                    <TabContent activeTab={this.state.activeTab}>
                        <TabPane tabId="1">

                            {this.state.pendingSellingAnnouncements.length > 0 ? (
                                <>
                                    <div style={{height: "40px"}}>
                                        <h1 style={{float: "left"}}>Anunțuri de vânzare</h1>
                                    </div>

                                    <br/>

                                    <Pagination
                                        data={this.state.pendingSellingAnnouncements}
                                        RenderComponent={SellingAnnouncementRepresentation}
                                        title="Anunțuri de vânzare"
                                        pageLimit={5}
                                        dataLimit={5}
                                        tabName={"selling announcements"}
                                    />
                                    <br/>
                                    <br/>
                                    <br/>
                                </>
                            ) : (
                                <div>
                                    <h2 style={{float: "left"}}>Nu este niciun anunț de vânzare care așteaptă aprobare!</h2>
                                </div>
                            )}
                        </TabPane>


                        <TabPane tabId="2">

                            {this.state.pendingRentalAnnouncements.length > 0 ? (
                                <>
                                    <div style={{height: "40px"}}>
                                        <h1 style={{float: "left"}}>Anunțuri de închiriere</h1>
                                    </div>

                                    <br/>

                                    <Pagination
                                        data={this.state.pendingRentalAnnouncements}
                                        RenderComponent={RentalAnnouncementRepresentation}
                                        title="Anunțuri de închiriere"
                                        pageLimit={5}
                                        dataLimit={5}
                                        tabName={"rental announcements"}
                                    />
                                    <br/>
                                    <br/>
                                    <br/>
                                </>
                            ) : (
                                <div>
                                    <h2 style={{float: "left"}}>Nu este niciun anunț de închiriere care așteaptă aprobare!</h2>
                                </div>
                            )}
                        </TabPane>
                    </TabContent>
                </div>
            </>
        );
    }
}