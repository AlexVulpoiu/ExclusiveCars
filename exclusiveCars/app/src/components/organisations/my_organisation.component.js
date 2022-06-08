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
import axios from "axios";

function AutoServiceRepresentation(props) {
    const {id, name, city, address, numberOfStations, email, phone, organisation} = props.data
    return (
        <Card style={{padding: "0px"}}>
            <CardHeader style={{backgroundColor: "#e6f3ff"}} component="h5">{name}</CardHeader>
            <CardBody>
                <CardTitle><GrIcons.GrMapLocation/>&nbsp;{city + ", " + address}</CardTitle>
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
                <Button color={"primary"} tag={Link} to={`/rentalCenters/${id}`}>Accesează pagina service-ului</Button>
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
            activeTab: '1',
            loading: true,
            serviceName: "",
            rentalCenterName: ""
        };

        this.toggle = this.toggle.bind(this);

        this.currentUser = AuthService.getCurrentUser();
    }

    componentDidMount() {
        this.setState({loading: true});
        axios.get(`http://localhost:8090/api/organisations/myOrganisation`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((data) => {
                this.setState({organisation: data["data"], loading: false});
                console.log(data);
                console.log(data["data"]);
            })
            .catch((error) => {
                console.log(error);
            })
    }

    async deleteOrganisation(id) {
        await fetch(`/api/organisations/delete/${id}`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            },
        }).then(() => {
            localStorage.setItem("infoMessage", "Organizația a fost ștearsă cu succes!");
            // todo schimbă redirecționarea
            this.props.history.push("/news");
        });
    }

    hasAccess(user, organisation) {
        return true;
        // todo: check permissions here
        return organisation["owner_id"] === user["id"] || user.roles.includes('ROLE_ADMIN');
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

    render() {
        const organisation = this.state.organisation;
        const loading = this.state.loading;
        const user = AuthService.getCurrentUser();

        if(loading) {
            return (
                <h1>Se încarcă...</h1>
            );
        }

        if(!this.hasAccess(this.currentUser, organisation)) {
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
                <div style={{height: "50px"}}>
                    <h1 style={{float: "left"}}>{organisation["name"]}</h1>
                    <div style={{float: "right"}}>
                        {(organisation["owner_id"] === this.currentUser["id"]) &&
                            (<Button color={"warning"} tag={Link} to={`/organisations/edit`}>Editează organizația</Button>)}
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        {((organisation["owner_id"] === this.currentUser["id"] || user.roles.includes('ROLE_ADMIN')) &&
                            (<Button color={"danger"} onClick={() => this.deleteOrganisation(organisation["id"])}>
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

                            {organisation["auto_services"].length > 0 ? (
                                <>
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
                                                onClick={() => {}}
                                            >
                                                Căutare &nbsp;<BsIcons.BsSearch/>
                                            </button>
                                        </div>
                                    </div>

                                    <Pagination
                                        data={organisation["auto_services"].sort(compare)}
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
                                    <h2 style={{float: "left"}}>Nu ai adăugat niciun service auto!</h2>

                                    <Button color={"success"} tag={Link} to={`/autoServices/add`} style={{float: "right"}}>
                                        Adaugă un service auto
                                    </Button>
                                </div>
                            )}
                        </TabPane>


                        <TabPane tabId="2">

                            {organisation["rental_centers"].length > 0 ? (
                                <>
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
                                                onClick={() => {}}
                                            >
                                                Căutare &nbsp;<BsIcons.BsSearch/>
                                            </button>
                                        </div>
                                    </div>

                                    <Pagination
                                        data={organisation["rental_centers"].sort(compare)}
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
                                    <h2 style={{float: "left"}}>Nu ai adăugat niciun centru de închirieri!</h2>

                                    <Button color={"success"} tag={Link} to={`/rentalCenters/add`} style={{float: "right"}}>
                                        Adaugă un centru de închiriere
                                    </Button>
                                </div>
                            )}
                        </TabPane>
                    </TabContent>
                </div>
            </>
        );
    }
}
