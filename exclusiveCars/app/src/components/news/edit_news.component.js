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

export default class EditNews extends Component {

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
            newsArticle: null,
            title: "",
            content: "",
            loading: false,
            message: ""
        }
    }

    componentDidMount() {
        this.setState({loading: true});
        fetch(`/api/news/${this.props.match.params.id}`)
            .then((response) => response.json())
            .then((data) => {
                this.setState({newsArticle: data, loading: false});

                let newTitle = localStorage.getItem("newsTitleEdit");
                if(newTitle !== "" && newTitle !== null) {
                    this.setState({title: newTitle});
                } else {
                    this.setState({title: data["title"]});
                }

                let newContent = localStorage.getItem("newsContentEdit");
                if(newContent !== "" && newContent !== null) {
                    this.setState({content: newContent});
                } else {
                    this.setState({content: data["content"]});
                }

                localStorage.setItem("newsTitleEdit", "");
                localStorage.setItem("newsContentEdit", "");
            });
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

            await axios.put(`http://localhost:8090/api/news/edit/${this.state.newsArticle["id"]}`, newArticle, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: authHeader().Authorization
                }
            })
                .then(() => {
                    localStorage.setItem("newsMessage", "Articolul a fost editat cu succes!");
                    this.props.history.push("/news");
                })
                .catch((error) => {
                    localStorage.setItem("newsEditMessage", error.response.data);
                    localStorage.setItem("newsTitleEdit", newArticle["title"]);
                    localStorage.setItem("newsContentEdit", newArticle["content"]);

                    this.props.history.push(`/news/edit/${this.state.newsArticle["id"]}`);
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
        localStorage.setItem("newsEditMessage", "");
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
                    {localStorage.getItem("newsEditMessage") !== null && localStorage.getItem("newsEditMessage") !== "" && (
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
                            {localStorage.getItem("newsEditMessage")}
                        </div>
                    )}

                    <h2 style={{alignSelf: "center"}}>Editare știre</h2>

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