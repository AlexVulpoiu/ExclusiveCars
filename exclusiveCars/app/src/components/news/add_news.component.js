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

const vTitle = value => {
    if(value.trim().length < 3 || value.trim().length > 100) {
        return (
            <div className="alert alert-danger" role="alert">
                Titlul trebuie să aibă între 3 și 100 de caractere!
            </div>
        );
    }
}

const vContent = value => {
    if(value.trim().length < 10 || value.trim().length > 10000) {
        return (
            <div className="alert alert-danger" role="alert">
                Conținutul trebuie să aibă între 10 și 10000 de caractere!
            </div>
        );
    }
}

export default class AddNews extends Component {

    emptyArticle = {
        title: "",
        content: ""
    }

    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.onChangeTitle = this.onChangeTitle.bind(this);
        this.onChangeContent = this.onChangeContent.bind(this);

        this.currentUser = AuthService.getCurrentUser();

        this.state = {
            title: localStorage.getItem("newsTitle"),
            content: localStorage.getItem("newsContent"),
            loading: false,
            message: ""
        }

        localStorage.setItem("newsTitle", "");
        localStorage.setItem("newsContent", "");
    }

    onChangeTitle(e) {
        this.setState({
            title: e.target.value
        });
    }

    onChangeContent(e) {
        this.setState({
            content: e.target.value
        });
    }

    hasAccess(user) {
        return user.roles.includes('ROLE_MODERATOR') || user.roles.includes('ROLE_ADMIN');
    }

    async handleSubmit(e) {
        e.preventDefault();

        this.setState({
            message: "",
            loading: true
        })

        this.form.validateAll();

        if(this.checkBtn.context._errors.length === 0) {
            const newArticle = this.emptyArticle
            newArticle["title"] = this.state.title.trim()
            newArticle["content"] = this.state.content.trim()

            await axios.post("http://localhost:8090/api/news/add", newArticle, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: authHeader().Authorization
                }
            })
            .then(() => {
                localStorage.setItem("newsMessage", "Articolul a fost adăugat cu succes!");
                this.props.history.push("/news");
            })
            .catch((error) => {
                this.props.history.push("/news/add");
                window.location.reload();

                localStorage.setItem("newsAddMessage", error.response.data);
                localStorage.setItem("newsTitle", newArticle["title"]);
                localStorage.setItem("newsContent", newArticle["content"]);
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
        localStorage.setItem("newsAddMessage", "");
    }

    render() {
        if(!this.hasAccess(this.currentUser)) {
            return (
                <div className={"col-md-12"}>
                    <h1>Nu aveți dreptul de a accesa această pagină!</h1>
                </div>
            );
        }

        return (
            <div className={"col-md-12"}>
                <div>
                    {localStorage.getItem("newsAddMessage") !== null && localStorage.getItem("newsAddMessage") !== "" && (
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
                            {localStorage.getItem("newsAddMessage")}
                        </div>
                    )}

                    <h2 style={{alignSelf: "center"}}>Adăugare știre</h2>

                    <Form
                        onSubmit={this.handleSubmit}
                        ref={c => {
                            this.form = c;
                        }}
                    >
                        <div className={"form-group"}>
                            <label htmlFor={"title"}>Titlu</label>
                            <Input
                                type={"text"}
                                className={"form-control"}
                                name={"title"}
                                value={this.state.title}
                                onChange={this.onChangeTitle}
                                validations={[required, vTitle]}
                            />
                        </div>

                        <div className={"form-group"}>
                            <label htmlFor={"content"}>Conținut</label>
                            <textarea
                                className={"form-control"}
                                name={"content"}
                                value={this.state.content}
                                onChange={this.onChangeContent}
                                rows={10}
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
                                <span>Salvează articolul</span>
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