import React, {Component} from "react";

import {Button} from "reactstrap";
import {Link} from "react-router-dom";

import "../../styles/pagination.css";
import AuthService from "../../services/auth.service";
import authHeader from '../../services/auth-header';


const formatDate = value => {
    const dateString = String(value);
    const values = dateString.split("-");
    return values.reverse().join("-");
};

export default class NewsArticle extends Component {
    constructor(props) {
        super(props);

        this.state = {
            newsArticle: null,
            loading: true
        };
    }

    componentDidMount() {
        this.setState({loading: true});
        fetch(`/api/news/${this.props.match.params.id}`)
            .then((response) => response.json())
            .then((data) => this.setState({newsArticle: data, loading: false}));
    }

    async deleteArticle(id) {
        await fetch(`/api/news/delete/${id}`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            },
        }).then(() => {
            localStorage.setItem("infoMessage", "Articolul a fost șters cu succes!");
            this.props.history.push("/news");
        });
    }

    render() {
        const article = this.state.newsArticle;
        const loading = this.state.loading;
        const user = AuthService.getCurrentUser();

        if(loading) {
            return (
                <h1>Se încarcă...</h1>
            );
        }

        return (
            <>
                <div style={{height: "50px"}}>
                    <h1 style={{float: "left"}}>{article["title"]}</h1>
                    <div style={{float: "right"}}>
                        {((user.roles.includes('ROLE_MODERATOR') || user.roles.includes('ROLE_ADMIN')) &&
                            (<Button color={"warning"} tag={Link} to={`/news/edit/${article["id"]}`}>Editează știrea</Button>))}
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        {((user.roles.includes('ROLE_MODERATOR') || user.roles.includes('ROLE_ADMIN')) &&
                            (<Button color={"danger"} tag={Link}
                                onClick={() => this.deleteArticle(article["id"])}>Șterge știrea</Button>))}
                    </div>
                </div>
                <br/>
                <br/>
                <p>{article["content"]}</p>
                <br/>
                <h6 style={{float: "right"}}>{"Articol postat în data de " + formatDate(article["date"]) + ", ora " + article["hour"]}</h6>
            </>
        );
    }
}
