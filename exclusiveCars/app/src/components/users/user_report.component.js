import React, {Component} from "react";
import authHeader from "../../services/auth-header";
import AuthService from "../../services/auth.service";
import {Button} from "reactstrap";
import * as BsIcons from "react-icons/bs";
import {Link} from "react-router-dom";

function SellingAnnouncementRepresentation(id, car, user, location) {
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
                                <li>Nume: {user["firstName"] + " " + user["lastName"]}</li>
                                <li>Localitate: {location}</li>
                                <li>Telefon: {user["phone"]}</li>
                                <li>Email: {user["email"]}</li>
                            </ul>
                        </div>

                        <Button style={{width: "100%"}} color={"info"} tag={Link} to={`/sellingAnnouncements/${id}`}>Deschide anunțul</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default class UserReport extends Component {

    constructor(props) {
        super(props);

        this.state = {
            userData: null,
            user: null,
            loading: true
        };
    }

    componentDidMount() {
        this.setState({loading: true});
        fetch(`http://localhost:8090/api/users/${this.props.match.params.userId}`, {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => response.json())
            .then((data) => this.setState({user: data}))
            .catch(error => console.log(error));

        fetch(`http://localhost:8090/api/users/report/${this.props.match.params.userId}`, {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => response.json())
            .then((data) => this.setState({userData: data, loading: false}));
    }

    hasAccess(user) {
        return user.roles.includes("ROLE_ADMIN");
    }

    render() {
        const loading = this.state.loading;

        if(loading) {
            return (
                <h1>Se încarcă...</h1>
            );
        }

        if(!this.hasAccess(AuthService.getCurrentUser())) {
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

        const data = this.state.userData;
        const user = this.state.user;
        let organisation = null;
        let sellingAnnouncements = null;

        if(user.roles.length === 1) {
            sellingAnnouncements = data;
            let accepted = 0;
            let rejectedSellingAnnouncements = [];
            for(let i in sellingAnnouncements) {
                const sellingAnnouncement = sellingAnnouncements[i];
                if(sellingAnnouncement["state"] === "ACCEPTED") {
                    accepted++;
                } else if(sellingAnnouncement["state"] === "REJECTED") {
                    rejectedSellingAnnouncements.push(sellingAnnouncement);
                }
            }
            rejectedSellingAnnouncements = rejectedSellingAnnouncements.map((a) => SellingAnnouncementRepresentation(a["id"], a["car"], user, a["location"]));

            return (
                <div className={"col-md-12"}>
                    <div>
                        <h1 style={{float: "left"}}>Utilizator: {user["firstName"] + " " + user["lastName"]}</h1>
                        {!user.roles.includes("ROLE_MODERATOR") &&
                            (<Button style={{float: "right"}} color={"danger"} tag={Link} to={`/users/delete/${user["id"]}`}>
                                Șterge contul <BsIcons.BsFillTrashFill/>
                            </Button>)
                        }
                    </div>

                    <br/>
                    <br/>
                    <br/>

                    <h3>Email: {user["email"]}</h3>
                    <h3>Anunțuri acceptate: {accepted}</h3>
                    <br/>
                    <br/>
                    <h3>Anunțuri respinse: {rejectedSellingAnnouncements.length}</h3>
                    <br/>

                    <div className="dataContainer">
                        {rejectedSellingAnnouncements}
                    </div>

                </div>
            );
        } else if(user.roles.includes("ROLE_ORGANISATION")) {
            organisation = data;
            return (
                <div className={"col-md-12"}>
                    <div>
                        <h1 style={{float: "left"}}>Utilizator: {user["firstName"] + " " + user["lastName"]}</h1>
                        {!user.roles.includes("ROLE_MODERATOR") &&
                            (<Button style={{float: "right"}} color={"danger"} tag={Link}
                                     to={`/users/delete/${user["id"]}`}>
                                Șterge contul <BsIcons.BsFillTrashFill/>
                            </Button>)
                        }
                    </div>

                    <br/>
                    <br/>
                    <br/>

                    <h3>Email: {user["email"]}</h3>
                    <h3>Organizație: <a href={`/organisations/${organisation["id"]}`}>{organisation["name"]}</a></h3>

                </div>
            );
        }

        return (
            <div className={"col-md-12"}>
                <div>
                    <h1 style={{float: "left"}}>Utilizator: {user["firstName"] + " " + user["lastName"]}</h1>
                    {!user.roles.includes("ROLE_MODERATOR") &&
                        (<Button style={{float: "right"}} color={"danger"} tag={Link}
                                 to={`/users/delete/${user["id"]}`}>
                            Șterge contul <BsIcons.BsFillTrashFill/>
                        </Button>)
                    }
                </div>

                <br/>
                <br/>
                <br/>

                <h3>Email: {user["email"]}</h3>
                <h3>Rol: MODERATOR</h3>

            </div>
        );
    }
}