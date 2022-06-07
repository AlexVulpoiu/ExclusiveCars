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

export default class EditOrganisation extends Component {

    emptyOrganisation = {
        name: ""
    }

    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.onChangeName = this.onChangeName.bind(this);

        this.currentUser = AuthService.getCurrentUser();

        this.state = {
            organisation: null,
            name: "",
            loading: false,
            message: ""
        }
    }

    componentDidMount() {
        this.setState({loading: true});

        axios.get(`http://localhost:8090/api/organisations/myOrganisation`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((data) => {
                this.setState({organisationsList: data["data"], loading: false});

                let newName = localStorage.getItem("organisationNameEdit");
                if(newName !== "" && newName !== null) {
                    this.setState({name: newName});
                } else {
                    this.setState({name: data["data"]["name"]});
                }
                localStorage.setItem("organisationNameEdit", "");
            })
            .catch((error) => {
                console.log(error.response.data);
            })
    }

    onChangeName(e) {
        this.setState({
            name: e.target.value
        });
    }

    hasAccess(user) {
        if(user === null) {
            return false;
        }
        return user.roles.includes('ROLE_ORGANISATION');
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

            await axios.put("http://localhost:8090/api/organisations/edit", newOrganisation, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: authHeader().Authorization
                }
            })
                .then(() => {
                    localStorage.setItem("infoMessage", "Organizația a fost editată cu succes!");
                    // TODO: schimbă news cu altceva
                    this.props.history.push("/news");
                })
                .catch((error) => {
                    console.log(error);
                    // localStorage.setItem("organisationsEditMessage", error.response.data);
                    localStorage.setItem("organisationNameEdit", newOrganisation["name"]);

                    // this.props.history.push(`/organisation/edit`);
                    // window.location.reload();
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
        localStorage.setItem("organisationsEditMessage", "");
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
            <div className={"col-md-12"}>
                <div>
                    {localStorage.getItem("organisationsEditMessage") !== null && localStorage.getItem("organisationsEditMessage") !== "" && (
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
                            {localStorage.getItem("organisationsEditMessage")}
                        </div>
                    )}

                    <h2 style={{alignSelf: "center"}}>Editare organizație</h2>

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
                                <span>Salvează modificările</span>
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