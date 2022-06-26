import React, {Component, useEffect, useState} from "react";
import authHeader from "../../services/auth-header";
import AuthService from "../../services/auth.service";
import {Button, Card, CardBody, CardHeader, CardText, CardTitle} from "reactstrap";
import * as GrIcons from "react-icons/gr";
import * as BsIcons from "react-icons/bs";
import * as IoIcons from "react-icons/io";
import * as ImIcons from "react-icons/im";
import {Link} from "react-router-dom";

const vQuery = value => {
    const re = new RegExp("^[A-Za-z0-9\\s-]*$");
    if(value !== null && !re.test(value)) {
        alert("Query-ul pentru căutare poate conține doar cifre, litere si spații!");
        return false;
    }
    return true;
}

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

export default class MyAutoServices extends Component {

    constructor(props) {
        super(props);

        this.state = {
            autoServices: [],
            serviceName: sessionStorage.getItem("serviceName"),
            loading: true
        }

        sessionStorage.setItem("serviceName", "");

        this.currentUser = AuthService.getCurrentUser();

        this.onChangeServiceName = this.onChangeServiceName.bind(this);
    }

    componentDidMount() {
        document.title = "Service-urile mele";
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
                const filter = sessionStorage.getItem("filterAutoServices");
                let filteredAutoServices = data["auto_services"];

                if(filter === "services") {
                    filteredAutoServices = JSON.parse(sessionStorage.getItem("filteredAutoServices"));
                    sessionStorage.setItem("filteredAutoServices", JSON.stringify([]));
                    sessionStorage.setItem("filterAutoServices", "");
                }

                this.setState({autoServices: filteredAutoServices, loading: false});
            })
            .catch((error) => console.log(error));
    }

    hasAccess(user) {
        return user !== null && user.roles.includes("ROLE_ORGANISATION");
    }

    onChangeServiceName = (e) => {
        this.setState({serviceName: e.target.value});
    };

    filterAutoServices = () => {
        if(this.state.serviceName !== null && this.state.serviceName !== "") {
            const check = vQuery(this.state.serviceName);

            if(check) {
                fetch(`http://localhost:8090/api/autoServices/filter?filter=${this.state.serviceName}`, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: authHeader().Authorization
                    }
                })
                    .then((response) => response.json())
                    .then((data) => {
                        if (typeof (data) === "string") {
                            sessionStorage.setItem("filteredAutoServices", JSON.stringify([]));
                        } else {
                            sessionStorage.setItem("filteredAutoServices", JSON.stringify(data));
                        }
                        sessionStorage.setItem("filterAutoServices", "services");
                        sessionStorage.setItem("serviceName", this.state.serviceName);
                        window.location.reload();
                    })
                    .catch((error) => console.log(error));
            }
        } else {
            window.location.reload();
        }
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

        this.state.autoServices = this.state.autoServices.sort(compare);

        return (
            <div className={"col-md-12"}>
                <div style={{height: "50px"}}>
                    <h1 style={{float: "left"}}>Service-urile mele</h1>
                    <Button color={"success"} style={{float: "right"}} tag={Link} to={"/autoServices/add"}>Adaugă un service auto</Button>
                </div>
                <br/>
                <br/>

                <div className="input-group mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Căutare după nume și locație"
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

                <div>
                    {this.state.autoServices.length > 0 ? (
                        <>
                            <Pagination
                                data={this.state.autoServices}
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
                            {this.state.serviceName === null || this.state.serviceName === "" ? (
                                    <h2 style={{float: "left"}}>Nu ai adăugat niciun service auto!</h2>
                                ) : (
                                    <h2 style={{float: "left"}}>Nu există niciun service cu aceste informații!</h2>
                                )
                            }
                        </div>
                    )}
                </div>
            </div>
        );
    }
}