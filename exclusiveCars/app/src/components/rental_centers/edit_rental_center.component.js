import React, {Component} from "react";
import Form from "react-validation/build/form";
import AuthService from "../../services/auth.service";
import authHeader from "../../services/auth-header";
import Input from "react-validation/build/input";
import * as BiIcons from "react-icons/bi";
import {Button} from "reactstrap";
import CheckButton from "react-validation/build/button";
import {isEmail} from "validator";
import axios from "axios";
import * as MdIcons from "react-icons/md";
import * as BsIcons from "react-icons/bs";

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
    const re = new RegExp("^[a-zA-Z][a-zA-Z0-9\\s]{2,29}$");
    if(!re.test(value)) {
        return (
            <div className="alert alert-danger" role="alert">
                Numele trebuie să aibă între 3 și 30 de caractere (litere, spații și cifre)!
            </div>
        );
    }
}

const vCity = value => {
    const re = new RegExp("^[a-zA-Z][a-zA-Z0-9\\s-]{3,49}$");
    if(!re.test(value)) {
        return (
            <div className="alert alert-danger" role="alert">
                Orașul trebuie să aibă între 4 și 50 de caractere (litere, spații și cifre)!
            </div>
        );
    }
}

const vAddress = value => {
    const re = new RegExp("^[a-zA-Z][a-zA-Z0-9\\s.,-]{9,199}$");
    if(!re.test(value)) {
        return (
            <div className="alert alert-danger" role="alert">
                Adresa trebuie să aibă între 10 și 200 de caractere!
            </div>
        );
    }
}

const vEmail = value => {
    if (!isEmail(value)) {
        return (
            <div className="alert alert-danger" role="alert">
                Acesta nu este un email valid.
            </div>
        );
    }
};

const vPhone = value => {
    const re = new RegExp("^07[0-9]{8}$");
    if(!re.test(value)) {
        return (
            <div className="alert alert-danger" role="alert">
                Numărul de telefon trebuie să aibă 10 cifre și să înceapă cu '07'!
            </div>
        );
    }
};

export default class EditRentalCenter extends Component {

    emptyRentalCenter = {
        name: "",
        city: "",
        address: "",
        email: "",
        phone: ""
    };

    constructor(props) {
        super(props);

        this.state = {
            rentalCenter: null,
            organisation: null,
            name: "",
            city: "",
            address: "",
            email: "",
            phone: "",
            loading: true,
            message: ""
        };

        this.currentUser = AuthService.getCurrentUser();

        this.onChangeName = this.onChangeName.bind(this);
        this.onChangeCity = this.onChangeCity.bind(this);
        this.onChangeAddress = this.onChangeAddress.bind(this);
        this.onChangeEmail = this.onChangeEmail.bind(this);
        this.onChangePhone = this.onChangePhone.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        document.title = "Editare centru de închirieri";
        this.setState({loading: true});

        fetch("http://localhost:8090/api/organisations/myOrganisation", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => response.json())
            .then((data) => {
                this.setState({organisation: data});
            });

        fetch(`http://localhost:8090/api/rentalCenters/${this.props.match.params.id}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => response.json())
            .then((data) => {
                this.setState({rentalCenter: data, loading: true});

                let editName = sessionStorage.getItem("rentalCenterNameEdit");
                if(editName !== null && editName !== "") {
                    this.setState({name: editName});
                } else {
                    this.setState({name: data["name"]});
                }

                let editCity = sessionStorage.getItem("rentalCenterCityEdit");
                if(editCity !== null && editCity !== "") {
                    this.setState({city: editCity});
                } else {
                    this.setState({city: data["city"]});
                }

                let editAddress = sessionStorage.getItem("rentalCenterAddressEdit");
                if(editAddress !== null && editAddress !== "") {
                    this.setState({address: editAddress});
                } else {
                    this.setState({address: data["address"]});
                }

                let editEmail = sessionStorage.getItem("rentalCenterEmailEdit");
                if(editEmail !== null && editEmail !== "") {
                    this.setState({email: editEmail});
                } else {
                    this.setState({email: data["email"]});
                }

                let editPhone = sessionStorage.getItem("rentalCenterPhoneEdit");
                if(editPhone !== null && editPhone !== "") {
                    this.setState({phone: editPhone});
                } else {
                    this.setState({phone: data["phone"]});
                }

                this.setState({loading: false});

                sessionStorage.setItem("rentalCenterNameEdit", "");
                sessionStorage.setItem("rentalCenterCityEdit", "");
                sessionStorage.setItem("rentalCenterAddressEdit", "");
                sessionStorage.setItem("rentalCenterEmailEdit", "");
                sessionStorage.setItem("rentalCenterPhoneEdit", "");
            })
    }

    async handleSubmit(e) {
        e.preventDefault();

        this.setState({
            loading: true,
            message: ""
        });

        this.form.validateAll();

        if(this.checkBtn.context._errors.length === 0) {

            const newRentalCenter = this.emptyRentalCenter;
            newRentalCenter["name"] = this.state.name.trim();
            newRentalCenter["city"] = this.state.city.trim();
            newRentalCenter["address"] = this.state.address.trim();
            newRentalCenter["email"] = this.state.email.trim();
            newRentalCenter["phone"] = this.state.phone.trim();

            await axios.put(`http://localhost:8090/api/rentalCenters/edit/${this.props.match.params.id}`, newRentalCenter, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: authHeader().Authorization
                }
            })
                .then(() => {
                    localStorage.setItem("infoMessage", "Centrul de închirieri a fost editat cu succes!");
                    this.props.history.push(`/rentalCenters/${this.props.match.params.id}`);
                })
                .catch((error) => {
                    this.props.history.push(`/rentalCenters/edit/${this.props.match.params.id}`);
                    window.location.reload();

                    sessionStorage.setItem("rentalCenterEditMessage", error.response.data);
                    sessionStorage.setItem("rentalCenterNameEdit", this.state.name);
                    sessionStorage.setItem("rentalCenterCityEdit", this.state.city);
                    sessionStorage.setItem("rentalCenterAddressEdit", this.state.address);
                    sessionStorage.setItem("rentalCenterEmailEdit", this.state.email);
                    sessionStorage.setItem("rentalCenterPhoneEdit", this.state.phone);
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
        sessionStorage.setItem("rentalCenterEditMessage", "");
    }

    hasAccess(user) {
        return user !== null && user.roles.includes("ROLE_ORGANISATION")
            && this.state.rentalCenter.organisation === this.state.organisation.name;
    }

    onChangeName(e) {
        this.setState({
            name: e.target.value
        });
    }

    onChangeCity(e) {
        this.setState({
            city: e.target.value
        });
    }

    onChangeAddress(e) {
        this.setState({
            address: e.target.value
        });
    }

    onChangeEmail(e) {
        this.setState({
            email: e.target.value
        });
    }

    onChangePhone(e) {
        this.setState({
            phone: e.target.value
        });
    }

    render() {

        if(this.state.organisation === null || this.state.loading) {
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
            <div className={"col-md-12"}>
                <div>
                    {sessionStorage.getItem("rentalCenterEditMessage") !== null
                        && sessionStorage.getItem("rentalCenterEditMessage") !== "" && (
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
                                {sessionStorage.getItem("rentalCenterEditMessage")}
                            </div>
                        )
                    }
                </div>

                <h2 style={{alignSelf: "center"}}>Editare centru de închirieri</h2>

                <Form
                    onSubmit={this.handleSubmit}
                    ref={c => {
                        this.form = c;
                    }}
                >
                    <div className={"row"}>
                        <div className={"column"} style={{width: "45%"}}>
                            <div className={"form-group"}>
                                <label htmlFor={"name"}><BiIcons.BiRename /> Nume</label>
                                <Input
                                    type={"text"}
                                    className={"form-control"}
                                    name={"name"}
                                    value={this.state.name}
                                    onChange={this.onChangeName}
                                    validations={[required, vName]}
                                />
                            </div>
                        </div>

                        <div className={"column"} style={{width: "55%"}}/>
                    </div>

                    <div className={"row"}>

                        <div className={"column"} style={{width: "45%"}}>
                            <div className={"form-group"}>
                                <label htmlFor={"city"}><MdIcons.MdLocationCity/> Oraș</label>
                                <Input
                                    type={"text"}
                                    className={"form-control"}
                                    name={"city"}
                                    value={this.state.city}
                                    onChange={this.onChangeCity}
                                    validations={[required, vCity]}
                                />
                            </div>
                        </div>

                        <div className={"column"} style={{width: "10%"}} />

                        <div className={"column"} style={{width: "45%"}}>
                            <div className={"form-group"}>
                                <label htmlFor={"address"}><MdIcons.MdLocationOn/> Adresa</label>
                                <Input
                                    type={"text"}
                                    className={"form-control"}
                                    name={"address"}
                                    value={this.state.address}
                                    onChange={this.onChangeAddress}
                                    validations={[required, vAddress]}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={"row"}>
                        <div className={"column"} style={{width: "45%"}}>
                            <div className={"form-group"}>
                                <label htmlFor={"email"}><MdIcons.MdEmail/> Email</label>
                                <Input
                                    type={"text"}
                                    className={"form-control"}
                                    name={"email"}
                                    value={this.state.email}
                                    onChange={this.onChangeEmail}
                                    validations={[required, vEmail]}
                                />
                            </div>
                        </div>

                        <div className={"column"} style={{width: "10%"}} />

                        <div className={"column"} style={{width: "45%"}}>
                            <div className={"form-group"}>
                                <label htmlFor={"phone"}><BsIcons.BsTelephoneFill/> Telefon</label>
                                <Input
                                    type={"text"}
                                    className={"form-control"}
                                    name={"phone"}
                                    value={this.state.phone}
                                    onChange={this.onChangePhone}
                                    validations={[required, vPhone]}
                                />
                            </div>
                        </div>
                    </div>

                    <br/>

                    <div className="form-group">
                        <Button
                            color={"success"}
                            className="btn btn-primary btn-block"
                            disabled={this.state.loading}
                        >
                            {this.state.loading && (
                                <span className="spinner-border spinner-border-sm"/>
                            )}
                            <span>Editează centrul de închirieri</span>
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
        );
    }
}