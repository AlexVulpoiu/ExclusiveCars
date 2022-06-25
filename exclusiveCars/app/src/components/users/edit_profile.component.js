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
    const re = new RegExp("^[A-Z][A-Za-z\\s]{2,29}$");
    if(!re.test(value)) {
        return (
            <div className="alert alert-danger" role="alert">
                Numele trebuie să aibă între 3 și 30 de caractere (litere și spații)!
            </div>
        );
    }
}

const vPhone = value => {
    const re = new RegExp("^07[0-9]{8}$");
    if(!re.test(value)) {
        return (
            <div className="alert alert-danger" role="alert">
                Numărul de telefon trebuie să aibă 10 cifre!
            </div>
        );
    }
}

export default class EditProfile extends Component {

    userEdit = {
        firstName: "",
        lastName: "",
        phone: ""
    }

    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.onChangeFirstName = this.onChangeFirstName.bind(this);
        this.onChangeLastName = this.onChangeLastName.bind(this);
        this.onChangePhone = this.onChangePhone.bind(this);

        this.currentUser = AuthService.getCurrentUser();

        this.state = {
            userInfo: null,
            firstName: "",
            lastName: "",
            phone: "",
            loading: true,
            message: ""
        }
    }

    componentDidMount() {
        this.setState({loading: true});

        document.title = "Editare profil";

        fetch(`http://localhost:8090/api/users/myProfile`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => response.json())
            .then((data) => {
                this.setState({userInfo: data, loading: false});

                let newFirstName = sessionStorage.getItem("userFirstNameEdit");
                if(newFirstName !== null && newFirstName !== "") {
                    this.setState({firstName: newFirstName});
                } else {
                    this.setState({firstName: data["firstName"]});
                }
                sessionStorage.setItem("userFirstNameEdit", "");

                let newLastName = sessionStorage.getItem("userLastNameEdit");
                if(newLastName !== "" && newLastName !== null) {
                    this.setState({lastName: newLastName});
                } else {
                    this.setState({lastName: data["lastName"]});
                }
                sessionStorage.setItem("userLastNameEdit", "");

                let newPhone = sessionStorage.getItem("userPhoneEdit");
                if(newPhone !== "" && newPhone !== null) {
                    this.setState({phone: newPhone});
                } else {
                    this.setState({phone: data["phone"]});
                }
                sessionStorage.setItem("userPhoneEdit", "");
            })
            .catch((error) => {
                console.log(error.response.data);
            })
    }

    onChangeFirstName(e) {
        this.setState({
            firstName: e.target.value
        });
    }

    onChangeLastName(e) {
        this.setState({
            lastName: e.target.value
        });
    }

    onChangePhone(e) {
        this.setState({
            phone: e.target.value
        })
    }

    hasAccess(user) {
        return user !== null;
    }

    async handleSubmit(e) {
        e.preventDefault();

        this.setState({
            message: "",
            loading: true
        });

        this.form.validateAll();

        if (this.checkBtn.context._errors.length === 0) {
            const newUser = this.userEdit;
            newUser["firstName"] = this.state.firstName;
            newUser["lastName"] = this.state.lastName;
            newUser["phone"] = this.state.phone;

            await axios.put("http://localhost:8090/api/users/edit", newUser, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: authHeader().Authorization
                }
            })
                .then(() => {
                    localStorage.setItem("infoMessage", "Profilul a fost editat cu succes!");
                    this.props.history.push("/profile");
                })
                .catch((error) => {
                    console.log(error);
                    sessionStorage.setItem("userFirstNameEdit", newUser["firstName"]);
                    sessionStorage.setItem("userLastNameEdit", newUser["lastName"]);
                    sessionStorage.setItem("userPhoneEdit", newUser["phone"]);

                    this.props.history.push("/profile/edit");
                    window.location.reload();
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
        sessionStorage.setItem("profileEditMessage", "");
    }

    render() {
        const loading = this.state.loading;
        if(loading) {
            return (
                <h1>Se încarcă...</h1>
            );
        }

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
            <div className={"col-md-6"}>
                <div>
                    {localStorage.getItem("profileEditMessage") !== null && localStorage.getItem("profileEditMessage") !== "" && (
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
                            {localStorage.getItem("profileEditMessage")}
                        </div>
                    )}

                    <h2 style={{alignSelf: "center"}}>Editare profil</h2>

                    <Form
                        onSubmit={this.handleSubmit}
                        ref={c => {
                            this.form = c;
                        }}
                    >
                        <div className={"form-group"}>
                            <label htmlFor={"firstName"}>Prenume</label>
                            <Input
                                type={"text"}
                                className={"form-control"}
                                name={"firstName"}
                                value={this.state.firstName}
                                onChange={this.onChangeFirstName}
                                validations={[required, vName]}
                            />
                        </div>

                        <div className={"form-group"}>
                            <label htmlFor={"lastName"}>Nume de familie</label>
                            <Input
                                type={"text"}
                                className={"form-control"}
                                name={"firstName"}
                                value={this.state.lastName}
                                onChange={this.onChangeLastName}
                                validations={[required, vName]}
                            />
                        </div>

                        <div className={"form-group"}>
                            <label htmlFor={"phone"}>Telefon</label>
                            <Input
                                type={"text"}
                                className={"form-control"}
                                name={"phone"}
                                value={this.state.phone}
                                onChange={this.onChangePhone}
                                validations={[required, vPhone]}
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