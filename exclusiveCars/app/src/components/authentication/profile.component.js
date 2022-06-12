import React, { Component } from "react";
import AuthService from "../../services/auth.service";
import authHeader from "../../services/auth-header";
import {Button} from "reactstrap";
import * as BsIcons from "react-icons/bs";
import * as FaIcons from "react-icons/fa";
import {Link} from "react-router-dom";

export default class Profile extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentUser: AuthService.getCurrentUser(),
            userInfo: {},
            loading: true
        };
    }

    componentDidMount() {
        this.setState({loading: true});
        fetch("http://localhost:8090/api/users/myProfile", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => response.json())
            .then((data) => this.setState({userInfo: data, loading: false}));
    }

    render() {
        if(this.state.currentUser === null) {
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

        const currentUser = this.state.currentUser;
        const userInfo = this.state.userInfo;

        if(this.state.loading) {
            return (
                <h1>Se încarcă...</h1>
            );
        }

        return (
            <div className="container">
                <br/>

                <h1>
                    <strong>Salut, {userInfo["firstName"] + " " + userInfo["lastName"]}!</strong>
                </h1>

                <br/>
                <br/>

                <div>
                    <h3 style={{float: "left"}}>Ce dorești să faci astăzi în aplicație?</h3>
                    <div style={{float: "right"}}>
                        <Button color={"warning"}>Editează detaliile contului <FaIcons.FaUserEdit/></Button>
                        &nbsp;&nbsp;&nbsp;
                        <Button color={"danger"} tag={Link} to={"/profile/delete"}>Șterge contul <BsIcons.BsFillTrashFill/></Button>
                    </div>
                </div>

                <br/>
                <br/>
                <br/>

                <div className={"column"}>
                    <h4><FaIcons.FaArrowRight/> <Link to={"/news"}>Citește cele mai noi știri</Link> </h4>
                    {currentUser.roles.includes("ROLE_ORGANISATION") ?
                        (<h4>
                            <FaIcons.FaArrowRight/> <Link to={"/news"}>Organizația mea</Link>
                        </h4>)
                        : (<h4>
                            <FaIcons.FaArrowRight/> <Link to={"/news"}>Creează o organizație</Link>
                        </h4>)
                    }
                    <h4><FaIcons.FaArrowRight/> <Link to={"/news"}>Programările mele</Link> </h4>
                    <h4><FaIcons.FaArrowRight/> <Link to={"/news"}>Anunțurile mele</Link> </h4>
                    <h4><FaIcons.FaArrowRight/> <Link to={"/news"}>Postează un anunț</Link> </h4>
                    <h4><FaIcons.FaArrowRight/> <Link to={"/news"}>Anunțuri de vânzare</Link> </h4>
                    <h4><FaIcons.FaArrowRight/> <Link to={"/news"}>Anunțuri favorite</Link> </h4>
                    <h4><FaIcons.FaArrowRight/> <Link to={"/news"}>Închiriază o mașină</Link> </h4>
                </div>

            </div>
        );
    }
}
