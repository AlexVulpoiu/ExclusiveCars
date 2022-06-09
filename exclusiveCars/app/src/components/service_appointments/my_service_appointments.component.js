import React, {Component, useEffect, useState} from "react";
import {
    Button,
    Card,
    CardBody, CardHeader,
    CardText,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane
} from 'reactstrap';
import classnames from 'classnames';

import * as GoIcons from "react-icons/go";
import * as BsIcons from "react-icons/bs";
import * as ImIcons from "react-icons/im";

import {Link} from "react-router-dom";

import "../../styles/pagination.css";
import AuthService from "../../services/auth.service";
import authHeader from '../../services/auth-header';
import axios from "axios";

const formatDate = value => {
    const dateString = String(value);
    const values = dateString.split("-");
    return values.reverse().join("-");
};

async function deleteServiceAppointment(id) {
    await fetch(`/api/serviceAppointments/deleteAppointment/${id}`, {
        method: 'DELETE',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: authHeader().Authorization
        },
    }).then(() => {
        localStorage.setItem("infoMessage", "Programarea a fost anulată cu succes!");
        // todo schimbă redirecționarea
        window.location.reload();
    });
}

function ServiceAppointmentRepresentation(props) {
    const {user, service_id, auto_service, problem_description, date, hour, station_number} = props.data
    return (
        <Card body style={{padding: "0px"}}>
            <CardHeader>
                <div>
                    <Button style={{float: "left", width: "220px"}} color={"primary"} href={`/autoServices/${service_id}`} target={"_blank"}>
                        <ImIcons.ImLocation/>&nbsp;{auto_service}
                    </Button>

                    <Button style={{float: "right", width: "220px"}} color={"danger"}
                            onClick={() => {
                                const userId = AuthService.getCurrentUser()["id"];
                                const appointmentId = userId + "_" + service_id + "_" + date;
                                deleteServiceAppointment(appointmentId);
                            }}
                    >
                        Anulează programarea&nbsp;<ImIcons.ImCancelCircle/>
                    </Button>
                </div>
            </CardHeader>

            <CardBody>
                <div className={"row"}>
                    <CardText className={"column"} style={{width: "30%", textAlign: "center"}}>
                        <BsIcons.BsFillCalendarDateFill/>&nbsp;{formatDate(date)}
                    </CardText>

                    <div style={{width: "5%"}}/>

                    <CardText className={"column"} style={{width: "30%", textAlign: "center"}}>
                        <BsIcons.BsFillClockFill/>&nbsp;{hour.substring(0, 5)}
                    </CardText>

                    <div style={{width: "5%"}}/>

                    <CardText className={"column"} style={{width: "30%", textAlign: "center"}}>
                        <BsIcons.BsFillPinFill/>&nbsp;Stația {station_number}
                    </CardText>
                </div>

                <CardText style={{textAlign: "center"}}>
                    <GoIcons.GoIssueOpened/>&nbsp;{problem_description}
                </CardText>
            </CardBody>
        </Card>
    );
}

function compare(a, b) {
    if(a.date > b.date) {
        return -1;
    }
    if(a.date < b.date) {
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

export default class MyServiceAppointments extends Component {
    constructor(props) {
        super(props);

        this.state = {
            serviceAppointments: [],
            activeTab: '1',
            loading: true
        };

        this.toggle = this.toggle.bind(this);

        this.currentUser = AuthService.getCurrentUser();
    }

    componentDidMount() {
        this.setState({loading: true});
        axios.get(`http://localhost:8090/api/serviceAppointments`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((data) => {
                this.setState({serviceAppointments: data["data"], loading: false});
                console.log(data);
                console.log(data["data"]);
            })
            .catch((error) => {
                console.log(error);
            })
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
        const serviceAppointments = this.state.serviceAppointments;
        serviceAppointments.sort(compare);
        let oldServiceAppointments = [];
        let futureServiceAppointments = [];

        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const day = today.getDate();

        for(let i = 0; i < serviceAppointments.length; i++) {
            const currentDate = new Date(serviceAppointments[i]["date"]);
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth();
            const currentDay = currentDate.getDate();

            if(day <= currentDay && month <= currentMonth && year <= currentYear) {
                futureServiceAppointments.push(serviceAppointments[i]);
            } else {
                oldServiceAppointments.push(serviceAppointments[i]);
            }
        }
        futureServiceAppointments.reverse();

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
                    <h1>Programările mele</h1>
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
                                Programări viitoare
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                className={classnames({ active: this.state.activeTab === '2' })}
                                onClick={() => { this.toggle('2'); }}
                            >
                                Programări vechi
                            </NavLink>
                        </NavItem>
                    </Nav>

                    <br/>

                    
                    <TabContent activeTab={this.state.activeTab}>
                        <TabPane tabId="1">

                            {futureServiceAppointments.length > 0 ? (
                                <>
                                    <div style={{height: "40px"}}>
                                        <h1 style={{float: "left"}}>Programări viitoare</h1>

                                        <Button color={"success"} tag={Link} to={"/autoServices"} style={{float: "right"}}>
                                            Service-uri auto
                                        </Button>
                                    </div>

                                    <br/>

                                    <Pagination
                                        data={futureServiceAppointments}
                                        RenderComponent={ServiceAppointmentRepresentation}
                                        title="Programări viitoare"
                                        pageLimit={5}
                                        dataLimit={5}
                                        tabName={"future appointments"}
                                    />
                                    <br/>
                                    <br/>
                                    <br/>
                                </>) : (
                                <div>
                                    <h2 style={{float: "left"}}>Nu ai nicio programare viitoare!</h2>

                                    <Button color={"success"} tag={Link} to={"/autoServices"} style={{float: "right"}}>
                                        Service-uri auto
                                    </Button>
                                </div>
                            )}
                        </TabPane>


                        <TabPane tabId="2">

                            {oldServiceAppointments.length > 0 ? (
                                <>
                                    <div style={{height: "40px"}}>
                                        <h1 style={{float: "left"}}>Programări vechi</h1>

                                        <Button color={"success"} tag={Link} to={"/autoServices"} style={{float: "right"}}>
                                            Service-uri auto
                                        </Button>
                                    </div>

                                    <br/>

                                    <Pagination
                                        data={oldServiceAppointments}
                                        RenderComponent={ServiceAppointmentRepresentation}
                                        title="Programări vechi"
                                        pageLimit={5}
                                        dataLimit={5}
                                        tabName={"old appointments"}
                                    />
                                    <br/>
                                    <br/>
                                    <br/>
                                </>
                            ) : (
                                <div>
                                    <h2 style={{float: "left"}}>Nu ai nicio programare din trecut!</h2>

                                    <Button color={"success"} tag={Link} to={"/autoServices"} style={{float: "right"}}>
                                        Service-uri auto
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
