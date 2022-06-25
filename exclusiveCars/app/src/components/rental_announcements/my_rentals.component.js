import React, {Component, useEffect, useState} from "react";
import {Button, Card, CardBody, CardHeader, Nav, NavItem, NavLink, TabContent, TabPane} from 'reactstrap';
import classnames from 'classnames';

import * as BsIcons from "react-icons/bs";
import * as ImIcons from "react-icons/im";
import * as MdIcons from "react-icons/md";

import {Link} from "react-router-dom";

import "../../styles/pagination.css";
import AuthService from "../../services/auth.service";
import authHeader from '../../services/auth-header';
import axios from "axios";

const formatDate = value => {
    const dateString = String(value);
    const values = dateString.split("-");
    return values.reverse().join(".");
};

async function cancelRental(id) {
    await fetch(`http://localhost:8090/api/rentCars/cancel/${id}`, {
        method: 'DELETE',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: authHeader().Authorization
        },
    }).then(() => {
        localStorage.setItem("infoMessage", "Cererea de închiriere a fost anulată cu succes!");
        window.location.reload();
    });
}

function RentalRepresentation(props) {
    const {id, user, car, endDate, rentalAnnouncementForCar} = props.data;
    return (
        <Card body style={{padding: "0px"}}>
            <CardHeader>
                <div>
                    <Button style={{float: "left", width: "300px"}} color={"primary"} href={`/rentalAnnouncements/${rentalAnnouncementForCar[car["id"]]}`} target={"_blank"}>
                        <BsIcons.BsEyeFill/>&nbsp;Vizualizează anunțul de închiriere
                    </Button>

                    <Button style={{float: "right", width: "300px"}} color={"danger"}
                            onClick={() => {
                                const userId = user["id"];
                                const rentalId = userId + "_" + car["id"] + "_" + id["startDate"];
                                cancelRental(rentalId);
                            }}
                    >
                        Anulează cererea de închiriere&nbsp;<ImIcons.ImCancelCircle/>
                    </Button>
                </div>
            </CardHeader>

            <CardBody>
                <div className={"row"} style={{marginLeft: "10px"}}>
                    <div className={"column"} style={{width: "270px"}}>
                        <img height={"150px"} width={"250px"} src={`${process.env.PUBLIC_URL}/assets/images/${car["images"][0]["name"]}`} alt={":("} />
                    </div>

                    <div className={"column"}>
                        <ul>
                            <li>{car["model"]["manufacturer"] + " " + car["model"]["model"] + " " + car["year"]}</li>
                            <li>Consum: {car["consumption"]} litri / 100 km</li>
                            <li>Perioada: {formatDate(id["startDate"])} - {formatDate(endDate)}</li>
                            <li>Preț: {car["price"]} € / zi</li>
                        </ul>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}

function compare(a, b) {
    if(a.id.startDate > b.id.startDate) {
        return -1;
    }
    if(a.id.startDate < b.id.startDate) {
        return 1;
    }
    return 0;
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
            <div className="dataContainer">
                {getPaginatedData().map((d, idx) => (
                    <RenderComponent key={idx} data={d} />
                ))}
            </div>

            <div className="pagination" style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                <button
                    onClick={goToPreviousPage}
                    className={`prev ${currentPage === 1 ? 'disabled' : ''}`}
                >
                    pagina anterioară
                </button>

                {getPaginationGroup().map((item, index) => (
                    <button
                        key={index}
                        onClick={changePage}
                        className={`paginationItem ${currentPage === item ? 'active' : null}`}
                    >
                        <span>{item}</span>
                    </button>
                ))}

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

export default class MyRentals extends Component {
    constructor(props) {
        super(props);

        this.state = {
            rentals: [],
            rentalAnnouncementForCar: {},
            activeTab: '1',
            loading: true
        };

        this.toggle = this.toggle.bind(this);

        this.currentUser = AuthService.getCurrentUser();
    }

    componentDidMount() {
        document.title = "Închirierile mele";
        this.setState({loading: true});

        axios.get(`http://localhost:8090/api/rentCars/myRentals`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((data) => {
                this.setState({rentals: data["data"]});
            })
            .catch((error) => {
                console.log(error);
            });

        fetch("http://localhost:8090/api/rentalAnnouncements/all", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => response.json())
            .then((data) => {
                const carAnnouncements = {};
                for(let i in data) {
                    carAnnouncements[data[i]["car"]["id"]] = data[i]["id"];
                }
                this.setState({rentalAnnouncementForCar: carAnnouncements});
            });

        this.setState({loading: false});
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

        const loading = this.state.loading;
        if(loading) {
            return (
                <h1>Se încarcă...</h1>
            );
        }

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

        const rentals = this.state.rentals;
        let oldRentals = [];
        let futureRentals = [];

        if(rentals !== [] && rentals !== "Nu ai efectuat nicio programare momentan!") {

            rentals.sort(compare);
            const today = new Date();

            for (let i = 0; i < rentals.length; i++) {
                const currentDate = new Date(rentals[i]["id"]["startDate"]);

                const newRental = rentals[i];
                newRental["rentalAnnouncementForCar"] = this.state.rentalAnnouncementForCar;

                if (currentDate.getTime() > today.getTime()) {
                    futureRentals.push(newRental);
                } else {
                    oldRentals.push(newRental);
                }
            }
            futureRentals.reverse();
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
                    <h1 style={{float: "left"}}>Închirierile mele</h1>

                    <Button color={"success"} tag={Link} to={"/rentalCenters"} style={{float: "right"}}>
                        Închiriază o mașină&nbsp;<MdIcons.MdCarRental/>
                    </Button>
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
                                Închirieri viitoare
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                className={classnames({ active: this.state.activeTab === '2' })}
                                onClick={() => { this.toggle('2'); }}
                            >
                                Închirieri vechi
                            </NavLink>
                        </NavItem>
                    </Nav>

                    <br/>


                    <TabContent activeTab={this.state.activeTab}>
                        <TabPane tabId="1">

                            {futureRentals.length > 0 ? (
                                <>
                                    <div style={{height: "40px"}}>
                                        <h1 style={{float: "left"}}>Închirieri viitoare</h1>
                                    </div>

                                    <Pagination
                                        data={futureRentals}
                                        RenderComponent={RentalRepresentation}
                                        title="Închirieri viitoare"
                                        pageLimit={5}
                                        dataLimit={5}
                                        tabName={"future rentals"}
                                    />
                                    <br/>
                                    <br/>
                                    <br/>
                                </>) : (
                                <div>
                                    <h2 style={{float: "left"}}>Nu ai nicio închiriere viitoare!</h2>
                                </div>
                            )}
                        </TabPane>


                        <TabPane tabId="2">

                            {oldRentals.length > 0 ? (
                                <>
                                    <div style={{height: "40px"}}>
                                        <h1 style={{float: "left"}}>Închirieri vechi</h1>
                                    </div>

                                    <Pagination
                                        data={oldRentals}
                                        RenderComponent={RentalRepresentation}
                                        title="Închirieri vechi"
                                        pageLimit={5}
                                        dataLimit={5}
                                        tabName={"old rentals"}
                                    />
                                    <br/>
                                    <br/>
                                    <br/>
                                </>
                            ) : (
                                <div>
                                    <h2 style={{float: "left"}}>Nu ai nicio închiriere din trecut!</h2>
                                </div>
                            )}
                        </TabPane>
                    </TabContent>
                </div>
            </>
        );
    }
}
