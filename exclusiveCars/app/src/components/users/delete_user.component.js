import React, {Component} from "react";
import AuthService from "../../services/auth.service";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import {Button} from "reactstrap";
import axios from "axios";
import authHeader from "../../services/auth-header";
import Captcha from "demos-react-captcha";

const required = value => {
    if (!value) {
        return (
            <div className="alert alert-danger" role="alert">
                Acest câmp este obligatoriu!
            </div>
        );
    }
};

export default class DeleteUser extends Component {

    constructor(props) {
        super(props);

        this.state = {
            password: "",
            captcha: false
        }

        this.user = AuthService.getCurrentUser();

        this.onChange = this.onChange.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);
        this.onRefresh = this.onRefresh.bind(this);
    }

    async deleteUser() {

        if(!this.state.captcha) {
            alert("Pentru a efectua acțiunea, este necesar să completezi corect captcha-ul");
        } else {
            await fetch(`http://localhost:8090/api/users/checkPassword/${this.state.password}`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: authHeader().Authorization
                }
            })
                .then((response) => response.json())
                .then((data) => {
                    if(!data) {
                        alert("Parola este incorectă!");
                        window.location.reload();
                    } else {
                        axios.delete(`http://localhost:8090/api/users/delete/${this.props.match.params.id}`, {
                            headers: {
                                Authorization: authHeader().Authorization
                            }
                        })
                            .then(() => {
                                localStorage.setItem("infoMessage", "Ați șters contul cu succes!");
                                AuthService.logout();
                                this.props.history.push("/news");
                                window.location.reload();
                            })
                            .catch((error) => {
                                alert("A apărut o eroare la procesarea cererii!");
                                window.location.reload();
                            });
                    }
                })
                .catch((error) => alert(error));
        }
    }

    onChangePassword(e) {
        this.setState({password: e.target.value});
    }

    onChange(value) {
        this.setState({captcha: value});
    }

    onRefresh(value) {
        console.log(value);
        this.setState({captcha: false});
    }

    hasAccess(user) {
        return user !== null && user.roles.includes("ROLE_ADMIN");
    }

    render() {
        const user = AuthService.getCurrentUser();
        if(!this.hasAccess(user)) {
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
                <h2 style={{color: "red", textAlign: "center"}}>ATENȚIE, ești pe cale de a șterge contul unui utilizator!</h2>
                <p style={{fontSize: "19px", textAlign: "center"}}>Odată efectuată această acțiune, se vor pierde toate datele de până acum: programările, anunțurile postate sau organizația!</p>
                <br/>
                <p style={{textAlign: "center"}}>Pentru a continua, te rugăm să introduci parola în următorul câmp, după care să apeși pe butonul de confirmare:</p>

                <div style={{textAlign: "center"}}>
                    <Form>
                        <div className="form-group" style={{textAlign: "center", width: "25%", margin: "auto"}}>
                            <Input
                                type="password"
                                className="form-control"
                                name="password"
                                onChange={this.onChangePassword}
                                validations={[required]}
                            />
                        </div>
                        <br/>

                        <div className={"form-group"} style={{textAlign: "center", width: "25%", margin: "auto"}}>
                            <Captcha onChange={this.onChange} placeholder="Enter captcha"  onRefresh={this.onRefresh}/>
                        </div>

                        <br/>

                        <div className={"form-group"}>
                            <Button color={"danger"} onClick={() => {
                                this.deleteUser();
                            }}>Confirmă ștergerea contului</Button>
                        </div>
                    </Form>
                </div>
            </div>
        );
    }
}