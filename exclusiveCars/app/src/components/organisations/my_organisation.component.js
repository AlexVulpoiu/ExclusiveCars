import React, {Component, useEffect, useState} from "react";
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    CardText,
    CardTitle,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane
} from 'reactstrap';
import classnames from 'classnames';

import * as GrIcons from "react-icons/gr";
import * as IoIcons from "react-icons/io";
import * as ImIcons from "react-icons/im";
import * as BsIcons from "react-icons/bs";

import {Link} from "react-router-dom";

import "../../styles/pagination.css";
import AuthService from "../../services/auth.service";
import authHeader from '../../services/auth-header';

function AutoServiceRepresentation(props) {
    const {id, name, city, address, startHour, endHour, numberOfStations, email, phone, organisation} = props.data
    return (
        <Card style={{padding: "0px"}}>
            <CardHeader style={{backgroundColor: "#e6f3ff"}} component="h5">{name}</CardHeader>
            <CardBody>
                <CardTitle><GrIcons.GrMapLocation/>&nbsp;{city + ", " + address}</CardTitle>
                <CardText><BsIcons.BsFillClockFill/>&nbsp;{startHour.substring(0, 5) + " - " + endHour.substring(0, 5)}</CardText>
                <CardText><IoIcons.IoMdMail/>&nbsp;{email}</CardText>
                <CardText><ImIcons.ImPhone/>&nbsp;{phone}</CardText>
                <br/>
                <Button color={"primary"} tag={Link} to={`/autoServices/${id}`}>Accesează pagina service-ului</Button>
            </CardBody>
        </Card>
    );
}

function compare(a, b) {
    if(a.name < b.name) {
        return -1;
    }
    if(a.name > b.name) {
        return 1;
    }
    return 0;
}

function RentalCenterRepresentation(props) {
    const {id, name, city, address, email, phone, organisation} = props.data
    return (
        <Card style={{padding: "0px"}}>
            <CardHeader style={{backgroundColor: "#e6f3ff"}} component="h5">{name}</CardHeader>
            <CardBody>
                <CardTitle><GrIcons.GrMapLocation/>&nbsp;{city + ", " + address}</CardTitle>
                <CardText><IoIcons.IoMdMail/>&nbsp;{email}</CardText>
                <CardText><ImIcons.ImPhone/>&nbsp;{phone}</CardText>
                <br/>
                <Button color={"primary"} tag={Link} to={`/rentalCenters/${id}`}>Accesează pagina centrului de închirieri</Button>
            </CardBody>
        </Card>
    );
}

function Pagination({ data, RenderComponent, title, pageLimit, dataLimit, tabName}) {
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

export default class MyOrganisation extends Component {
    constructor(props) {
        super(props);

        this.state = {
            organisation: null,
            autoServices: [],
            rentalCenters: [],
            activeTab: sessionStorage.getItem("filter") === "rentals" ? '2' : '1',
            loading: true,
            serviceName: sessionStorage.getItem("serviceName"),
            rentalCenterName: sessionStorage.getItem("rentalCenterName")
        };

        sessionStorage.setItem("serviceName", "");
        sessionStorage.setItem("rentalCenterName", "");

        this.toggle = this.toggle.bind(this);

        this.currentUser = AuthService.getCurrentUser();

        this.onChangeRentalCenterName = this.onChangeRentalCenterName.bind(this);
        this.onChangeServiceName = this.onChangeServiceName.bind(this);
    }

    componentDidMount() {

        document.title = "Organizația mea";
        this.setState({loading: true});

        fetch(`http://localhost:8090/api/organisations/myOrganisation`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => response.json())
            .then((data) => {

                const filter = sessionStorage.getItem("filter");
                let filteredAutoServices = data["auto_services"];
                let filteredRentalCenters = data["rental_centers"];

                if(filter === "services") {
                    filteredAutoServices = JSON.parse(sessionStorage.getItem("filteredAutoServices"));
                    sessionStorage.setItem("filteredAutoServices", JSON.stringify([]));
                    sessionStorage.setItem("filter", "");
                } else if(filter === "rentals") {
                    filteredRentalCenters = JSON.parse(sessionStorage.getItem("filteredRentalCenters"));
                    sessionStorage.setItem("filteredRentalCenters", JSON.stringify([]));
                    sessionStorage.setItem("filter", "");
                }
                this.setState({organisation: data, autoServices: filteredAutoServices,
                    rentalCenters: filteredRentalCenters, loading: false});
            })
            .catch((error) => {
                console.log(error);
            });
    }

    hasAccess(user) {
        return user !== null && user.roles.includes('ROLE_ORGANISATION');
    }

    toggle(tab) {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    onChangeServiceName = (e) => {
        this.setState({serviceName: e.target.value});
    };

    onChangeRentalCenterName = (e) => {
        this.setState({rentalCenterName: e.target.value});
    }

    filterAutoServices = () => {
        if(this.state.serviceName !== null && this.state.serviceName !== "") {
            fetch(`http://localhost:8090/api/autoServices/filter?filter=${this.state.serviceName}`,{
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: authHeader().Authorization
                }
            })
                .then((response) => response.json())
                .then((data) => {
                    if(typeof(data) === "string") {
                        sessionStorage.setItem("filteredAutoServices", JSON.stringify([]));
                    } else {
                        sessionStorage.setItem("filteredAutoServices", JSON.stringify(data));
                    }
                    sessionStorage.setItem("filter", "services");
                    sessionStorage.setItem("serviceName", this.state.serviceName);
                    window.location.reload();
                })
                .catch((error) => console.log(error));
        } else {
            window.location.reload();
        }
    }

    filterRentalCenters = () => {
        if(this.state.rentalCenterName !== null && this.state.rentalCenterName !== "") {
            fetch(`http://localhost:8090/api/rentalCenters/filter?filter=${this.state.rentalCenterName}`,{
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: authHeader().Authorization
                }
            })
                .then((response) => response.json())
                .then((data) => {
                    if(typeof(data) === "string") {
                        sessionStorage.setItem("filteredRentalCenters", JSON.stringify([]));
                    } else {
                        sessionStorage.setItem("filteredRentalCenters", JSON.stringify(data));
                    }
                    sessionStorage.setItem("filter", "rentals");
                    sessionStorage.setItem("rentalCenterName", this.state.rentalCenterName);
                    window.location.reload();
                })
                .catch((error) => console.log(error));
        } else {
            window.location.reload();
        }
    }

    hideAlert() {
        const notification = document.getElementById("notification");
        notification.style.display = "none";
        localStorage.setItem("infoMessage", "");
    }

    render() {

        const loading = this.state.loading;

        if(loading) {
            return (
                <h1>Se încarcă...</h1>
            );
        }

        const organisation = this.state.organisation;
        const user = AuthService.getCurrentUser();

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
                    <h1 style={{float: "left"}}>{organisation["name"]}</h1>
                    <div style={{float: "right"}}>
                        {(organisation["owner_id"] === this.currentUser["id"]) &&
                            (<Button color={"warning"} tag={Link} to={`/organisations/edit`}>Editează organizația</Button>)}
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        {((organisation["owner_id"] === this.currentUser["id"] || user.roles.includes('ROLE_ADMIN')) &&
                            (<Button color={"danger"} tag={Link} to={`/organisations/delete/${organisation["id"]}`}>
                                Șterge organizația
                            </Button>))}
                    </div>
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
                                Service-uri auto
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                className={classnames({ active: this.state.activeTab === '2' })}
                                onClick={() => { this.toggle('2'); }}
                            >
                                Centre de închiriere
                            </NavLink>
                        </NavItem>
                    </Nav>

                    <br/>



                    <TabContent activeTab={this.state.activeTab}>
                        <TabPane tabId="1">

                            <div style={{height: "40px"}}>
                                <h1 style={{float: "left"}}>Service-uri auto</h1>

                                <Button color={"success"} tag={Link} to={`/autoServices/add`} style={{float: "right"}}>
                                    Adaugă un service auto
                                </Button>
                            </div>

                            <br/>

                            <div className="input-group mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Caută după nume"
                                    value={this.state.serviceName}
                                    onChange={this.onChangeServiceName}
                                />
                                <div className="input-group-append">
                                    <button
                                        className="btn btn-outline-secondary"
                                        type="button"
                                        onClick={this.filterAutoServices}
                                    >
                                        Căutare &nbsp;<BsIcons.BsSearch/>
                                    </button>
                                </div>
                            </div>

                            {this.state.autoServices.length > 0 ? (
                                <>
                                    <Pagination
                                        data={this.state.autoServices.sort(compare)}
                                        RenderComponent={AutoServiceRepresentation}
                                        title="Service-uri auto"
                                        pageLimit={5}
                                        dataLimit={5}
                                        tabName={"auto services"}
                                    />
                                    <br/>
                                    <br/>
                                    <br/>
                                </>
                            ) : (
                                <div>
                                    {this.state.rentalCenterName !== null && this.state.rentalCenterName !== "" ?
                                        (<h2 style={{float: "left"}}>Nu există niciun service auto cu aceste
                                                informații!</h2>
                                        ) : (
                                            <h2 style={{float: "left"}}>Nu ai adăugat niciun service auto!</h2>
                                        )
                                    }
                                </div>
                            )}
                        </TabPane>


                        <TabPane tabId="2">

                            <div style={{height: "40px"}}>
                                <h1 style={{float: "left"}}>Centre de închirieri auto</h1>

                                <Button color={"success"} tag={Link} to={`/rentalCenters/add`} style={{float: "right"}}>
                                    Adaugă un centru de închiriere
                                </Button>
                            </div>

                            <br/>

                            <div className="input-group mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Caută după nume"
                                    value={this.state.rentalCenterName}
                                    onChange={this.onChangeRentalCenterName}
                                />
                                <div className="input-group-append">
                                    <button
                                        className="btn btn-outline-secondary"
                                        type="button"
                                        onClick={this.filterRentalCenters}
                                    >
                                        Căutare &nbsp;<BsIcons.BsSearch/>
                                    </button>
                                </div>
                            </div>

                            {this.state.rentalCenters.length > 0 ? (
                                <>
                                    <Pagination
                                        data={this.state.rentalCenters.sort(compare)}
                                        RenderComponent={RentalCenterRepresentation}
                                        title="Centre de închirieri auto"
                                        pageLimit={5}
                                        dataLimit={5}
                                        tabName={"rental centers"}
                                    />
                                    <br/>
                                    <br/>
                                    <br/>
                                </>
                            ) : (
                                <div>
                                    {this.state.rentalCenterName !== null && this.state.rentalCenterName !== "" ?
                                        (<h2 style={{float: "left"}}>Nu există niciun centru de închirieri cu aceste
                                            informații!</h2>
                                        ) : (
                                            <h2 style={{float: "left"}}>Nu ai adăugat niciun centru de închirieri!</h2>
                                        )
                                    }
                                </div>
                            )}
                        </TabPane>
                    </TabContent>
                </div>
            </>
        );
    }
}
