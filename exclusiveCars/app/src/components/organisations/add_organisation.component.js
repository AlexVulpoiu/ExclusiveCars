import React, { Component } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";

import authHeader from '../../services/auth-header';
import {Button} from "reactstrap";
import axios from "axios";
import AuthService from "../../services/auth.service";

const required = value => {
    if (!value) {
        return (
            <div className="alert alert-danger" role="alert">
                Acest câmp este obligatoriu!
            </div>
        );
    }
};

const vName = value => {
    const re = new RegExp("^[A-Z].{2,29}$");
    if(!re.test(value)) {
        return (
            <div className="alert alert-danger" role="alert">
                Numele trebuie să înceapă cu literă mare și să aibă între 3 și 30 de caractere!
            </div>
        );
    }
}

export default class AddOrganisation extends Component {

    emptyOrganisation = {
        name: ""
    }

    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.onChangeName = this.onChangeName.bind(this);

        this.currentUser = AuthService.getCurrentUser();

        this.state = {
            name: localStorage.getItem("organisationName"),
            loading: false,
            message: ""
        }

        localStorage.setItem("organisationName", "");
    }

    onChangeName(e) {
        this.setState({
            name: e.target.value
        });
    }

    hasAccess(user) {
        return user !== null;
    }

    async handleSubmit(e) {
        e.preventDefault();

        this.setState({
            message: "",
            loading: true
        })

        this.form.validateAll();

        if(this.checkBtn.context._errors.length === 0) {
            const newOrganisation = this.emptyOrganisation
            newOrganisation["name"] = this.state.name.trim()

            await axios.post("http://localhost:8090/api/organisations/add", newOrganisation, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: authHeader().Authorization
                }
            })
                .then(() => {
                    localStorage.setItem("infoMessage", "Organizația a fost adăugată cu succes!");
                    // TODO change news to somenthing else
                    this.props.history.push("/news");
                })
                .catch((error) => {
                    this.props.history.push("/organisations/add");
                    window.location.reload();

                    localStorage.setItem("organisationAddMessage", error.response.data);
                    localStorage.setItem("organisationName", newOrganisation["name"]);
                });
        } else {
            this.setState({
                loading: false
            });
        }
    }

    hideAlert() {
        const notification = document.getElementById("notification");
        notification.style.display = "none";
        localStorage.setItem("organisationAddMessage", "");
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

        return (
            <div className={"col-md-4"}>
                <div>
                    {localStorage.getItem("organisationAddMessage") !== null && localStorage.getItem("organisationAddMessage") !== "" && (
                        <div
                            id={"notification"}
                            role="alert"
                            className={"alert alert-warning alert-dismissible"}
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
                            {localStorage.getItem("organisationAddMessage")}
                        </div>
                    )}

                    <h2 style={{alignSelf: "center"}}>Creează organizație</h2>

                    <Form
                        onSubmit={this.handleSubmit}
                        ref={c => {
                            this.form = c;
                        }}
                    >
                        <div className={"form-group"}>
                            <label htmlFor={"name"}>Nume</label>
                            <Input
                                type={"text"}
                                className={"form-control"}
                                name={"name"}
                                value={this.state.name}
                                onChange={this.onChangeName}
                                validations={[required, vName]}
                            />
                        </div>

                        <div className="form-group">
                            <Button
                                color={"success"}
                                className="btn btn-primary btn-block"
                                disabled={this.state.loading}
                            >
                                {this.state.loading && (
                                    <span className="spinner-border spinner-border-sm"/>
                                )}
                                <span>Salvează organizația</span>
                            </Button>
                        </div>

                        {this.state.message && (
                            <div className="form-group">
                                <div className="alert alert-danger" role="alert">
                                    {this.state.message}
                                </div>
                            </div>
                        )}
                        <CheckButton
                            style={{ display: "none" }}
                            ref={c => {
                                this.checkBtn = c;
                            }}
                        />
                    </Form>
                </div>
            </div>
        );
    }
}