import React, { Component } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import { isEmail } from "validator";

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

const email = value => {
    if (!isEmail(value)) {
        return (
            <div className="alert alert-danger" role="alert">
                Acesta nu este un email valid.
            </div>
        );
    }
};

const vusername = value => {
    if (value.length < 3 || value.length > 20) {
        return (
            <div className="alert alert-danger" role="alert">
                Numele de utilizator trebuie să aibă între 3 si 20 de caractere!
            </div>
        );
    }
};

const vFirstName = value => {
    const re = new RegExp("^[A-Z][a-zA-Z\\s]{2,29}$");
    if(!re.test(value)) {
        return (
            <div className="alert alert-danger" role="alert">
                Prenumele trebuie să înceapă cu literă mare și să aibă între 3 și 30 de caractere (doar litere și spații)!
            </div>
        );
    }
};

const vLastName = value => {
    const re = new RegExp("^[A-Z][a-zA-Z\\s]{2,29}$");
    if(!re.test(value)) {
        return (
            <div className="alert alert-danger" role="alert">
                Numele trebuie sa inceapa cu litera mare si sa aiba intre 3 si 30 de caractere (doar litere si spatii)!
            </div>
        );
    }
};

const vpassword = value => {
    if (value.length < 6 || value.length > 40) {
        return (
            <div className="alert alert-danger" role="alert">
                Parola trebuie sa aiba intre 6 si 40 de caractere!
            </div>
        );
    }
};

const vphone = value => {
    if(value.length !== 10) {
        return (
            <div className="alert alert-danger" role="alert">
                Numarul de telefon trebuie sa aiba 10 cifre!
            </div>
        );
    } else if(value[0] !== '0' || value[1] !== '7') {
        return (
            <div className="alert alert-danger" role="alert">
                Numarul de telefon trebuie sa inceapa cu "07"!
            </div>
        );
    }
};

export default class Register extends Component {
    constructor(props) {
        super(props);
        this.handleRegister = this.handleRegister.bind(this);
        this.onChangeUsername = this.onChangeUsername.bind(this);
        this.onChangeFirstName = this.onChangeFirstName.bind(this);
        this.onChangeLastName = this.onChangeLastName.bind(this);
        this.onChangeEmail = this.onChangeEmail.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);
        this.onChangePhone = this.onChangePhone.bind(this);

        this.state = {
            username: "",
            email: "",
            firstName: "",
            lastName: "",
            password: "",
            phone: "",
            successful: false,
            message: ""
        };
    }

    onChangeUsername(e) {
        this.setState({
            username: e.target.value
        });
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

    onChangeEmail(e) {
        this.setState({
            email: e.target.value
        });
    }

    onChangePassword(e) {
        this.setState({
            password: e.target.value
        });
    }

    onChangePhone(e) {
        this.setState({
            phone: e.target.value
        });
    }

    handleRegister(e) {
        e.preventDefault();

        this.setState({
            message: "",
            successful: false
        });

        this.form.validateAll();

        if (this.checkBtn.context._errors.length === 0) {
            AuthService.register(
                this.state.username,
                this.state.firstName,
                this.state.lastName,
                this.state.email,
                this.state.password,
                this.state.phone
            ).then(
                response => {
                    this.setState({
                        message: response.data.message,
                        successful: true
                    });
                },
                error => {
                    const resMessage =
                        (error.response &&
                            error.response.data &&
                            error.response.data.message) ||
                        error.message ||
                        error.toString();

                    this.setState({
                        successful: false,
                        message: resMessage
                    });
                }
            );
        }
    }

    render() {
        return (
            <div className="col-md-12">
                <div className="card card-container">
                    {/*<img*/}
                    {/*    src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"*/}
                    {/*    alt="profile-img"*/}
                    {/*    className="profile-img-card"*/}
                    {/*/>*/}
                    <h2 style={{alignSelf: "center"}}>Bun venit!</h2>

                    <Form
                        onSubmit={this.handleRegister}
                        ref={c => {
                            this.form = c;
                        }}
                    >
                        {!this.state.successful && (
                            <div>
                                <div className="form-group">
                                    <label htmlFor="username">Username</label>
                                    <Input
                                        type="text"
                                        className="form-control"
                                        name="username"
                                        value={this.state.username}
                                        onChange={this.onChangeUsername}
                                        validations={[required, vusername]}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="firstName">Prenume</label>
                                    <Input
                                        type="text"
                                        className="form-control"
                                        name="firstName"
                                        value={this.state.firstName}
                                        onChange={this.onChangeFirstName}
                                        validations={[required, vFirstName]}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="lastName">Nume</label>
                                    <Input
                                        type="text"
                                        className="form-control"
                                        name="lastName"
                                        value={this.state.lastName}
                                        onChange={this.onChangeLastName}
                                        validations={[required, vLastName]}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <Input
                                        type="text"
                                        className="form-control"
                                        name="email"
                                        value={this.state.email}
                                        onChange={this.onChangeEmail}
                                        validations={[required, email]}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="password">Parola</label>
                                    <Input
                                        type="password"
                                        className="form-control"
                                        name="password"
                                        value={this.state.password}
                                        onChange={this.onChangePassword}
                                        validations={[required, vpassword]}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phone">Telefon</label>
                                    <Input
                                        type="text"
                                        className="form-control"
                                        name="phone"
                                        value={this.state.phone}
                                        onChange={this.onChangePhone}
                                        validations={[required, vphone]}
                                    />
                                </div>

                                <div className="form-group">
                                    <button className="btn btn-primary btn-block">Sign Up</button>
                                </div>
                            </div>
                        )}

                        {this.state.message && (
                            <div className="form-group">
                                <div
                                    className={
                                        this.state.successful
                                            ? "alert alert-success"
                                            : "alert alert-danger"
                                    }
                                    role="alert"
                                >
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