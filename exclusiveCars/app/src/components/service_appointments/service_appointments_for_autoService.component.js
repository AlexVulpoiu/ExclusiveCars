import React, {Component, useEffect, useState} from "react";
import authHeader from "../../services/auth-header";
import {Button, Card, CardBody, CardHeader, CardText, Nav, NavItem, NavLink, TabContent, TabPane} from "reactstrap";
import * as ImIcons from "react-icons/im";
import AuthService from "../../services/auth.service";
import * as BsIcons from "react-icons/bs";
import * as GoIcons from "react-icons/go";
import classnames from "classnames";
import {Link} from "react-router-dom";

const formatDate = value => {
    const dateString = String(value);
    const values = dateString.split("-");
    return values.reverse().join("-");
};

function ServiceAppointmentRepresentation(props) {
    const {user, user_id, phone, service_id, auto_service, problem_description, date, hour, station_number} = props.data
    return (
        <Card body style={{padding: "0px"}}>
            <CardHeader>
                <div>
                    <Button style={{float: "left", width: "220px"}} color={"primary"} href={`/autoServices/${service_id}`} target={"_blank"}>
                        <ImIcons.ImLocation/>&nbsp;{auto_service}
                    </Button>

                    <Button style={{float: "right", width: "220px"}} color={"danger"}
                            onClick={() => {
                                const appointmentId = user_id + "_" + service_id + "_" + date;
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
                        <BsIcons.BsFillPersonFill/>&nbsp;{user}
                    </CardText>

                    <div style={{width: "5%"}}/>

                    <CardText className={"column"} style={{width: "30%", textAlign: "center"}}>
                        <BsIcons.BsTelephoneFill />&nbsp;{phone}
                    </CardText>

                    <div style={{width: "5%"}}/>

                    <CardText style={{width: "30%", textAlign: "center"}}>
                        <BsIcons.BsFillPinFill/>&nbsp;Stația {station_number}
                    </CardText>
                </div>

                <div className={"row"}>
                    <CardText className={"column"} style={{width: "30%", textAlign: "center"}}>
                        <BsIcons.BsFillCalendarDateFill/>&nbsp;{formatDate(date)}
                    </CardText>

                    <div style={{width: "5%"}} />

                    <CardText className={"column"} style={{width: "30%", textAlign: "center"}}>
                        <BsIcons.BsFillClockFill/>&nbsp;{hour.substring(0, 5)}
                    </CardText>

                    <div style={{width: "5%"}} />

                    <CardText className={"column"} style={{width: "30%", textAlign: "center"}}>
                        <GoIcons.GoIssueOpened/>&nbsp;{problem_description}
                    </CardText>
                </div>
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

async function deleteServiceAppointment(id) {

    await fetch(`http://localhost:8090/api/serviceAppointments/deleteAppointment/${id}`, {
        method: 'DELETE',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: authHeader().Authorization
        },
    }).then(() => {
        localStorage.setItem("infoMessage", "Programarea a fost anulată cu succes!");
        window.location.reload();
    });
}

export default class ServiceAppointmentsForAutoService extends Component {

    constructor(props) {
        super(props);

        this.state = {
            autoService: null,
            myAutoServices: [],
            serviceAppointments: [],
            activeTab: '1',
            loading: true
        };

        this.currentUser = AuthService.getCurrentUser();
    }

    componentDidMount() {

        this.setState({loading: true});

        fetch("http://localhost:8090/api/organisations/myOrganisation", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => response.json())
            .then((data) => {
                const serviceIds = [];
                for(let i in data["auto_services"]) {
                    serviceIds.push(data["auto_services"][i]["id"]);
                }
                this.setState({myAutoServices: serviceIds});
            })
            .catch((error) => console.log(error));

        fetch(`http://localhost:8090/api/autoServices/${this.props.match.params.serviceId}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => response.json())
            .then((data) => {
                this.setState({autoService: data});
                document.title = "Programări " + data["name"];
            });

        fetch(`http://localhost:8090/api/serviceAppointments/${this.props.match.params.serviceId}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => response.json())
            .then((data) => {
                this.setState({serviceAppointments: data, loading: false})
            });
    }

    hasAccess(user) {
        return user !== null && user.roles.includes("ROLE_ORGANISATION")
            && this.state.myAutoServices.includes(Number(this.props.match.params.serviceId));
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

        const serviceAppointments = this.state.serviceAppointments;
        if(serviceAppointments === [] || serviceAppointments === "Nu au fost făcute programări la acest service!") {
            return (
                <div className={"col-md-12"}>
                    <h2>Nu au fost făcute programări la acest service!</h2>
                </div>
            );
        }
        serviceAppointments.sort(compare);
        let oldServiceAppointments = [];
        let futureServiceAppointments = [];

        const today = new Date();

        for(let i = 0; i < serviceAppointments.length; i++) {
            const currentDate = new Date(serviceAppointments[i]["date"]);
            const currentHour = serviceAppointments[i]["hour"].split(":");
            const hour = Number(currentHour[0]);
            const minutes = Number(currentHour[1]);
            currentDate.setHours(hour, minutes);

            if(currentDate.getTime() >= today.getTime()) {
                futureServiceAppointments.push(serviceAppointments[i]);
            } else {
                oldServiceAppointments.push(serviceAppointments[i]);
            }
        }
        futureServiceAppointments.reverse();

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
                    <h1>Programări <a href={`/autoServices/${this.state.autoService["id"]}`} target={"_blank"}>{this.state.autoService["name"]}</a></h1>
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
                                    <h2 style={{float: "left"}}>Nu există nicio programare viitoare!</h2>

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
                                    <h2 style={{float: "left"}}>Nu există nicio programare din trecut!</h2>

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