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
                    pagina anterioar??
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
                    pagina urm??toare
                </button>
            </div>
        </div>
    );
}

function SellingAnnouncementRepresentation(props) {
    const {id, car, user, location} = props.data;
    return (
        <div className="jumbotron" style={{paddingTop: "20px", paddingBottom: "20px"}}>
            <div className={"row"}>
                <div className={"column"} style={{width: "35%"}}>
                    <img height={"220px"} width={"300px"} src={`${process.env.PUBLIC_URL}/assets/images/${car["images"][0]["name"]}`} alt={":("} />
                </div>

                <div className={"column"}>
                    <h2>{car["model"]["manufacturer"] + " " + car["model"]["model"] + " " + car["year"]}</h2>
                    <div className={"row"}>
                        <div className={"column"} style={{width: "50%"}}>
                            <ul>
                                <li>Categoria: {car["model"]["category"]}</li>
                                <li>Kilometraj: {car["kilometers"]}</li>
                                <li>Pre??: {car["price"]} ???</li>
                                <li>Capacitate motor: {car["engine"]} cm<sup>3</sup></li>
                                <li>Putere motor: {car["power"]} CP</li>
                            </ul>
                        </div>

                        <div className={"column"} style={{width: "50%"}}>
                            <ul>
                                <li>Nume: {user["firstName"] + " " + user["lastName"]}</li>
                                <li>Localitate: {location}</li>
                                <li>Telefon: {user["phone"]}</li>
                                <li>Email: {user["email"]}</li>
                            </ul>
                        </div>

                        <Button style={{width: "100%"}} color={"info"} tag={Link} to={`/sellingAnnouncements/${id}`}>Deschide anun??ul</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default class MySellingAnnouncements extends Component {

    constructor(props) {
        super(props);

        this.state = {
            sellingAnnouncements: [],
            approvedAnnouncements: [],
            unapprovedAnnouncements: [],
            loading: true,
            activeTab: '1'
        };

        this.currentUser = AuthService.getCurrentUser();
    }

    componentDidMount() {
        document.title = "Anun??urile mele";
        this.setState({loading: true});
        fetch("http://localhost:8090/api/sellingAnnouncements/mine", {
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
                this.setState({sellingAnnouncements: data, loading: false});
            });
    }

    hasAccess(user) {
        return user !== null && user.roles.length === 1;
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
                    <h1>Nu ave??i dreptul de a accesa aceast?? pagin??!</h1>
                    <h1>Ve??i fi redirec??ionat...</h1>
                </div>
            );
        }

        const loading = this.state.loading;

        if(loading) {
            return (
                <h1>Se ??ncarc??...</h1>
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
                    <h1 style={{float: "left"}}>Anun??urile mele</h1>
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
                                Anun??uri aprobate
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                className={classnames({ active: this.state.activeTab === '2' })}
                                onClick={() => { this.toggle('2'); }}
                            >
                                Anun??uri neaprobate
                            </NavLink>
                        </NavItem>
                    </Nav>

                    <br/>



                    <TabContent activeTab={this.state.activeTab}>
                        <TabPane tabId="1">

                            {this.state.approvedAnnouncements.length > 0 ? (
                                <>
                                    <div style={{height: "40px"}}>
                                        <h1 style={{float: "left"}}>Anun??uri aprobate</h1>
                                    </div>

                                    <br/>

                                    <Pagination
                                        data={this.state.approvedAnnouncements}
                                        RenderComponent={SellingAnnouncementRepresentation}
                                        title="Anun??uri aprobate"
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
                                    <h2 style={{float: "left"}}>Nu exist?? niciun anun?? aprobat!</h2>
                                </div>
                            )}
                        </TabPane>


                        <TabPane tabId="2">

                            {this.state.unapprovedAnnouncements.length > 0 ? (
                                <>
                                    <div style={{height: "40px"}}>
                                        <h1 style={{float: "left"}}>Anun??uri neaprobate</h1>
                                    </div>

                                    <br/>

                                    <Pagination
                                        data={this.state.unapprovedAnnouncements}
                                        RenderComponent={SellingAnnouncementRepresentation}
                                        title="Anun??uri neaprobate"
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
                                    <h2 style={{float: "left"}}>Nu exist?? niciun anun?? neaprobat!</h2>
                                </div>
                            )}
                        </TabPane>
                    </TabContent>
                </div>
            </div>
        );
    }
}