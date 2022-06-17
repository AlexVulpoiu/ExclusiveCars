import React, {Component} from "react";

import {Button} from "reactstrap";
import {Link} from "react-router-dom";

import "../../styles/pagination.css";
import AuthService from "../../services/auth.service";
import authHeader from '../../services/auth-header';
import axios from "axios";
import * as IoIcons from "react-icons/io";
import * as ImIcons from "react-icons/im";
import * as GrIcons from "react-icons/gr";
import * as BsIcons from "react-icons/bs";

import MyMap from "../maps/map";

export default class AutoService extends Component {
    constructor(props) {
        super(props);

        this.state = {
            autoService: null,
            currentOrganisation: null,
            loading: true
        };

        this.currentUser = AuthService.getCurrentUser();
    }

    componentDidMount() {
        this.setState({loading: true});

        if(this.currentUser.roles.includes('ROLE_ORGANISATION')) {
            axios.get(`http://localhost:8090/api/organisations/myOrganisation`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: authHeader().Authorization
                }
            })
                .then((data) => {
                    this.setState({currentOrganisation: data["data"]});
                    console.log(data);
                    console.log(data["data"]);
                })
                .catch((error) => {
                    console.log(error);
                })
        }

        fetch(`/api/autoServices/${this.props.match.params.id}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => response.json())
            .then((data) => {
                this.setState({autoService: data, loading: false});
                document.title = data["name"];
            })
            .catch((error) => {
                console.log(error);
            });
    }

    async deleteAutoService(id) {
        await fetch(`/api/autoServices/delete/${id}`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            },
        }).then(() => {
            localStorage.setItem("infoMessage", "Service-ul auto a fost șters cu succes!");
            // todo: schimba redirectul
            this.props.history.push("/news");
        });
    }

    hasAccess(user) {
        return user !== null;
    }

    currentUserIsOwner() {
        return this.state.currentOrganisation !== null
            && this.state.currentOrganisation.name === this.state.autoService.organisation;
    }

    hideAlert() {
        const notification = document.getElementById("notification");
        notification.style.display = "none";
        localStorage.setItem("infoMessage", "");
    }

    render() {
        const autoService = this.state.autoService;
        const loading = this.state.loading;
        const user = this.currentUser;

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

        if(loading) {
            return (
                <h1>Se încarcă...</h1>
            );
        }

        localStorage.setItem("address", autoService["city"] + ", " + autoService["address"]);
        localStorage.setItem("locationName", autoService["name"]);
        localStorage.setItem("locationType", "service");

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
                    <h1 style={{float: "left"}}>{autoService["name"]}</h1>
                    <div style={{float: "right"}}>
                        {(this.currentUserIsOwner() &&
                            (<Button color={"warning"} tag={Link} to={`/autoServices/edit/${autoService["id"]}`}>Editează detaliile service-ului</Button>))}
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        {(((this.currentUserIsOwner() || user.roles.includes('ROLE_ADMIN'))) &&
                            (<Button color={"danger"} onClick={() => this.deleteAutoService(autoService["id"])}>
                                Șterge service-ul
                            </Button>))}
                    </div>
                </div>

                <br/>
                <br/>

                <div className={"row"}>
                    <div className={"column"} style={{float: "left", width: "40%"}}>
                        <h5>Despre noi:</h5>
                        <ul>
                            <li>dispunem de {autoService["numberOfStations"]} stații de lucru</li>
                            <li>facem parte din organizația {autoService["organisation"]}</li>
                            <li>
                                program: {autoService["startHour"].substring(0, 5) + " - " + autoService["endHour"].substring(0, 5)}
                            </li>
                        </ul>

                        <br/>

                        <h5>Detalli contact:</h5>
                        <ul>
                            <li><IoIcons.IoMdMail/>&nbsp;{autoService["email"]}</li>
                            <li><ImIcons.ImPhone/>&nbsp;{autoService["phone"]}</li>
                        </ul>

                        <br/>

                        {this.currentUser.roles.length === 1 &&
                        (<Button color={"success"} tag={Link} to={`/serviceAppointments/makeAppointment/${autoService["id"]}`}>
                            Efectuează o programare &nbsp; <BsIcons.BsFillCalendarCheckFill />
                        </Button>)}

                        {(this.currentUserIsOwner()
                                || this.currentUser.roles.includes("ROLE_ADMIN")
                                || this.currentUser.roles.includes("ROLE_MODERATOR")) &&
                            (<Button color={"success"} tag={Link} to={`/serviceAppointments/${autoService["id"]}`}>
                                Vezi programările &nbsp; <BsIcons.BsCalendar3 />
                            </Button>)}
                    </div>

                    <div className={"column"} style={{float: "left", width: "60%"}}>
                        <p style={{fontSize: "20px"}}><GrIcons.GrMapLocation/>&nbsp;Ne găsești în {autoService["city"]}, la următoarea adresă: {autoService["address"]}</p>
                        <MyMap />
                    </div>
                </div>
            </div>
        );
    }
}
