import React, {Component, useEffect, useState} from "react";
import {Button} from "reactstrap";
import {Link} from "react-router-dom";
import AuthService from "../../services/auth.service";
import authHeader from "../../services/auth-header";
import * as BsIcons from "react-icons/bs";

const vQuery = value => {
    const re = new RegExp("^[A-Za-z0-9\\s-]*$");
    if(value !== null && !re.test(value)) {
        alert("Query-ul pentru căutare poate conține doar cifre, litere si spații!");
        return false;
    }
    return true;
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

function RentalAnnouncementRepresentation(props) {
    const {id, state, rentalCenter, car} = props.data;
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

export default class RentalAnnouncementsFromRentalCenter extends Component {

    constructor(props) {
        super(props);

        this.state = {
            rentalAnnouncements: [],
            searchQuery: sessionStorage.getItem("carRentQuery"),
            loading: true
        };

        sessionStorage.setItem("carRentQuery", "");

        this.onChangeSearchQuery = this.onChangeSearchQuery.bind(this);

        this.currentUser = AuthService.getCurrentUser();
    }

    componentDidMount() {
        document.title = "Anunțuri de închiriere";
        this.setState({loading: true});
        fetch(`http://localhost:8090/api/rentalAnnouncements/fromRentalCenter/${this.props.match.params.id}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => response.json())
            .then((data) => {

                const filter = sessionStorage.getItem("filterRentalAnnouncements");
                let filteredRentalAnnouncements = data;

                if(filter === "true") {
                    filteredRentalAnnouncements = JSON.parse(sessionStorage.getItem("filteredRentalAnnouncements"));
                    sessionStorage.setItem("filteredRentalAnnouncements", JSON.stringify([]));
                    sessionStorage.setItem("filterRentalAnnouncements", "");
                }

                this.setState({rentalAnnouncements: filteredRentalAnnouncements, loading: false});
            });
    }

    hasAccess(user) {
        return user !== null;
    }

    onChangeSearchQuery = (e) => {
        this.setState({searchQuery: e.target.value});
    }

    filterRentalAnnouncements = () => {
        if(this.state.searchQuery !== null && this.state.searchQuery !== "") {
            const check = vQuery(this.state.searchQuery);

            if(check) {
                fetch(`http://localhost:8090/api/rentalAnnouncements/filter/${this.props.match.params.id}?filter=${this.state.searchQuery}`, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: authHeader().Authorization
                    }
                })
                    .then((response) => response.json())
                    .then((data) => {
                        if (typeof (data) === "string") {
                            sessionStorage.setItem("filteredRentalAnnouncements", JSON.stringify([]));
                        } else {
                            sessionStorage.setItem("filteredRentalAnnouncements", JSON.stringify(data));
                        }
                        sessionStorage.setItem("filterRentalAnnouncements", "true")
                        sessionStorage.setItem("carRentQuery", this.state.searchQuery);
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
            <>
                <div style={{height: "50px"}}>
                    <h1 style={{float: "left"}}>Anunțuri de închiriere</h1>
                    <Button color={"success"} style={{float: "right"}} tag={Link} to={`/rentalAnnouncements/add/${this.props.match.params.id}`}>Adaugă un anunț de închiriere</Button>
                </div>
                <br/>
                <br/>

                <div className="input-group mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Căutare după marca și modelul mașinii"
                        value={this.state.searchQuery}
                        onChange={this.onChangeSearchQuery}
                    />
                    <div className="input-group-append">
                        <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={this.filterRentalAnnouncements}
                        >
                            Căutare &nbsp;<BsIcons.BsSearch/>
                        </button>
                    </div>
                </div>

                <br/>

                <div>
                    {this.state.rentalAnnouncements.length > 0 ? (
                        <>
                            <Pagination
                                data={this.state.rentalAnnouncements}
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
                            {(this.state.searchQuery === null || this.state.searchQuery === "") ? (
                                    <h2 style={{float: "left"}}>Nu există niciun anunț de închiriere!</h2>
                                ) : (
                                    <h2 style={{float: "left"}}>Nu a fost postat niciun anunț cu acest conținut!</h2>
                                )
                            }
                        </div>
                    )}
                </div>
            </>
        );
    }
}