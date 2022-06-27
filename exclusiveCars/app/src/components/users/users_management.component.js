import React, {Component} from "react";
import AuthService from "../../services/auth.service";
import authHeader from "../../services/auth-header";

export default class UsersManagement extends Component {

    constructor(props) {
        super(props);

        this.state = {
            users: [],
            loading: true
        }
    }

    componentDidMount() {
        document.title = "Managementul utilizatorilor";

        this.setState({loading: true});
        fetch("http://localhost:8090/api/users", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => response.json())
            .then((data) => {
                this.setState({users: data, loading: false});
            })
    }

    hasAccess(user) {
        return user !== null && user.roles.includes("ROLE_ADMIN");
    }

    mapRolesToString(roles) {
        let rolesString = "";
        for(let i in roles) {
            const role = roles[i];
            if(i > 0) {
                rolesString += ", ";
            }

            let name = role.substring(5);
            if(name === "USER") {
                rolesString += "UTILIZATOR";
            } else if(name === "ORGANISATION") {
                rolesString += "ORGANIZATOR";
            } else if(name === "MODERATOR") {
                rolesString += "MODERATOR";
            } else {
                rolesString += "ADMINISTRATOR";
            }
        }

        return rolesString;
    }

    render() {
        const user = AuthService.getCurrentUser();
        const loading = this.state.loading;
        if(loading) {
            return (
                <h1>Se încarcă...</h1>
            );
        }

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

        const users = this.state.users;

        return(
            <div className={"col-md-12"}>
                <h1>Lista utilizatorilor</h1>
                <br/>

                <table className="table table-striped table-bordered">
                    <thead>
                    <tr>
                        <th>Email</th>
                        <th>Nume</th>
                        <th>Roluri</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users && users.map(user =>
                        <tr key={user.id}>
                            <td><a href={`/users/report/${user.id}`}>{user.email}</a></td>
                            <td>{user.firstName} {user.lastName}</td>
                            <td>{this.mapRolesToString(user.roles)}</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        );
    }
}