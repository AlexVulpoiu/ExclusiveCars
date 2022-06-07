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
            .then((data) => this.setState({organisation: data, loading: false}));
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
            localStorage.setItem("infoMessage", "Organizația a fost ștearsă cu succes!");
            // todo schimbă redirecționarea
            this.props.history.push("/news");
        });
    }

    hasAccess(user, organisation) {
        return organisation["owner_id"] === user["id"] || user.roles.includes('ROLE_ADMIN');
    }

    render() {
        const organisation = this.state.organisation;
        const loading = this.state.loading;
        const user = AuthService.getCurrentUser();

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

        if(loading) {
            return (
                <h1>Se încarcă...</h1>
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
