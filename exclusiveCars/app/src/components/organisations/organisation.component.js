import React, {Component} from "react";

import {Button} from "reactstrap";
import {Link} from "react-router-dom";

import "../../styles/pagination.css";
import AuthService from "../../services/auth.service";
import authHeader from '../../services/auth-header';

export default class Organisation extends Component {
    constructor(props) {
        super(props);

        this.state = {
            organisation: null,
            loading: true
        };

        this.currentUser = AuthService.getCurrentUser();
    }

    componentDidMount() {
        this.setState({loading: true});
        fetch(`/api/organisations/${this.props.match.params.id}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => response.json())
            .then((data) => {
                this.setState({organisation: data, loading: false});
                document.title = data["name"];
            })
            .catch((error) => {
                this.state.loading = false;
                console.log(this.state.loading);
                console.log(error);
            });
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
            localStorage.setItem("infoMessage", "Organizația a fost ștearsă cu succes! Te rugăm să te loghezi din nou!");
            AuthService.logout();
            this.props.history.push("/news");
        });
    }

    hasAccess(user, organisation) {
        return user !== null && (user.roles.includes('ROLE_ADMIN') || organisation["owner_id"] === user["id"]);
    }

    render() {

        const user = AuthService.getCurrentUser();
        if(user !== null && !user.roles.includes("ROLE_ORGANISATION") && !user.roles.includes("ROLE_ADMIN")) {
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

        const organisation = this.state.organisation;

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
                            (<Button color={"danger"} tag={Link}
                                     onClick={() => this.deleteOrganisation(organisation["id"])}>Șterge organizația</Button>))}
                    </div>
                </div>
                <br/>
                <br/>
            </>
        );
    }
}
