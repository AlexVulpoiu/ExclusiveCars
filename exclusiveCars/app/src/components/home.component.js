import React, {Component} from "react";
import {Button} from "reactstrap";
import {Link} from "react-router-dom";
import AuthService from "../services/auth.service";

export default class HomeComponent extends Component {

    render() {
        const user = AuthService.getCurrentUser();
        if(user !== null) {
            this.props.history.push("/profile");
        }

        return (
            <div className={"col-md-12"}>
                <header className="jumbotron">
                    <h1>Salut!</h1>
                    <h1>Bine ai venit la ExclusiveCars!</h1>
                    <br/>
                    <br/>
                    <h5>Ești în căutarea unui loc în care să poți rezolva toate problemele ce țin de autovehiculul tău sau vrei să citești <a href={"/news"}>cele mai noi știri</a>?</h5>
                    <h5>Ei bine, ai ajuns în locul potrivit! Înregistrează-te acum! </h5>
                    <br/>

                    <div style={{float: "right"}}>
                        <Button color={"primary"} style={{width: "150px"}} tag={ Link } to={"/login"}>Login</Button>
                        &nbsp; &nbsp; &nbsp;
                        <Button color={"primary"} style={{width: "150px"}} tag={ Link } to={"/register"}>Sign Up</Button>
                    </div>
                </header>
            </div>
        );
    }
}