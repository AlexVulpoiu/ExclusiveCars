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

export default class AllRentalCenters extends Component {

    constructor(props) {
        super(props);

        this.state = {
            rentalCenters: [],
            centerName: sessionStorage.getItem("centerName"),
            loading: true
        }

        sessionStorage.setItem("centerName", "");

        this.currentUser = AuthService.getCurrentUser();

        this.onChangeRentalCenterName = this.onChangeRentalCenterName.bind(this);
    }

    componentDidMount() {
        document.title = "Centre de închiriere";

        this.setState({loading: true});

        fetch("http://localhost:8090/api/rentalCenters", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => response.json())
            .then((data) => {

                const filter = sessionStorage.getItem("filterRentalCenters");
                let filteredRentalCenters = data;

                if(filter === "centers") {
                    filteredRentalCenters = JSON.parse(sessionStorage.getItem("filteredRentalCenters"));
                    sessionStorage.setItem("filteredRentalCenters", JSON.stringify([]));
                    sessionStorage.setItem("filterRentalCenters", "");
                }

                this.setState({rentalCenters: filteredRentalCenters, loading: false});
            })
            .catch((error) => console.log(error));
    }

    hasAccess(user) {
        return user !== null;
    }

    onChangeRentalCenterName = (e) => {
        this.setState({centerName: e.target.value});
    };

    filterRentalCenters = () => {
        if(this.state.centerName !== null && this.state.centerName !== "") {

            const check = vQuery(this.state.centerName);

            if(check) {
                fetch(`http://localhost:8090/api/rentalCenters/filter?filter=${this.state.centerName}`, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: authHeader().Authorization
                    }
                })
                    .then((response) => response.json())
                    .then((data) => {
                        if (typeof (data) === "string") {
                            sessionStorage.setItem("filteredRentalCenters", JSON.stringify([]));
                        } else {
                            sessionStorage.setItem("filteredRentalCenters", JSON.stringify(data));
                        }
                        sessionStorage.setItem("filterRentalCenters", "centers");
                        sessionStorage.setItem("centerName", this.state.centerName);
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

        return (
            <div className={"col-md-12"}>
                <div style={{height: "50px"}}>
                    <h1 style={{float: "left"}}>Centre de închiriere</h1>
                    <Button style={{float: "right"}} color={"success"} tag={Link} to={"/myRentals"}>Închirierile mele</Button>
                </div>
                <br/>
                <br/>

                <div className="input-group mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Căutare după nume și locație"
                        value={this.state.centerName}
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

                <div>
                    {this.state.rentalCenters.length > 0 ? (
                        <>
                            <Pagination
                                data={this.state.rentalCenters}
                                RenderComponent={RentalCenterRepresentation}
                                title="Centre de închiriere"
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
                            <h2 style={{float: "left"}}>Nu există niciun centru cu aceste informații!</h2>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}