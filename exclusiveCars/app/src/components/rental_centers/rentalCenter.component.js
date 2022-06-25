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
import * as RiIcons from "react-icons/ri";
import * as AiIcons from "react-icons/ai";

import MyMap from "../maps/map";

export default class RentalCenter extends Component {
    constructor(props) {
        super(props);

        this.state = {
            rentalCenter: null,
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
                })
                .catch((error) => {
                    console.log(error);
                })
        }

        fetch(`/api/rentalCenters/${this.props.match.params.id}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => response.json())
            .then((data) => {
                this.setState({rentalCenter: data, loading: false});
                document.title = data["name"];
            })
            .catch((error) => {
                console.log(error);
            });
    }

    async deleteRentalCenter(id) {
        await fetch(`/api/rentalCenters/delete/${id}`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            },
        }).then(() => {
            localStorage.setItem("infoMessage", "Centrul de închirieri auto a fost șters cu succes!");
            // todo: schimba redirectul
            this.props.history.push("/news");
        });
    }

    hasAccess(user) {
        return user !== null;
    }

    currentUserIsOwner() {
        return this.state.currentOrganisation !== null
            && this.state.currentOrganisation.name === this.state.rentalCenter.organisation;
    }

    render() {
        const rentalCenter = this.state.rentalCenter;
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

        localStorage.setItem("address", rentalCenter["city"] + ", " + rentalCenter["address"]);
        localStorage.setItem("locationName", rentalCenter["name"]);
        localStorage.setItem("locationType", "service");

        return (
            <>
                <div style={{height: "50px"}}>
                    <h1 style={{float: "left"}}>{rentalCenter["name"]}</h1>
                    <div style={{float: "right"}}>
                        {(this.currentUserIsOwner() &&
                            (<Button color={"warning"} tag={Link} to={`/rentalCenters/edit/${rentalCenter["id"]}`}>Editează detaliile centrului de închirieri</Button>))}
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        {(((this.currentUserIsOwner() || user.roles.includes('ROLE_ADMIN'))) &&
                            (<Button color={"danger"} onClick={() => this.deleteRentalCenter(rentalCenter["id"])}>
                                Șterge centrul de închirieri
                            </Button>))}
                    </div>
                </div>

                <br/>
                <br/>

                <div className={"row"}>
                    <div className={"column"} style={{float: "left", width: "40%"}}>
                        <h5>Despre noi:</h5>
                        <ul>
                            <li>facem parte din organizația {rentalCenter["organisation"]}</li>
                        </ul>

                        <br/>

                        <h5>Detalli contact:</h5>
                        <ul>
                            <li><IoIcons.IoMdMail/>&nbsp;{rentalCenter["email"]}</li>
                            <li><ImIcons.ImPhone/>&nbsp;{rentalCenter["phone"]}</li>
                        </ul>

                        <br/>

                        <Button color={"success"} tag={Link} to={`/rentalAnnouncements/fromRentalCenter/${rentalCenter["id"]}`}>
                            Vezi anunțurile &nbsp; <RiIcons.RiArticleFill />
                        </Button>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        {this.currentUserIsOwner() &&
                            (<Button color={"info"} tag={Link} to={`/rentalAnnouncements/add/${rentalCenter["id"]}`}>
                                Adaugă un anunț &nbsp; <AiIcons.AiFillFileAdd />
                            </Button>)}
                    </div>

                    <div className={"column"} style={{float: "left", width: "60%"}}>
                        <p style={{fontSize: "20px"}}><GrIcons.GrMapLocation/>&nbsp;Ne găsești în {rentalCenter["city"]}, la următoarea adresă: {rentalCenter["address"]}</p>
                        <MyMap />
                    </div>
                </div>
            </>
        );
    }
}
