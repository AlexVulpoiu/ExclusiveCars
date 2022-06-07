import React, {useState, Component, useEffect} from "react";

import "../../styles/pagination.css";
import authHeader from '../../services/auth-header';
import AuthService from "../../services/auth.service";
import axios from "axios";

function OrganisationRepresentation(props) {
    const {id, name, owner} = props.data
    return (
        <div style={{padding: "10px", margin: "20px", borderColor: "black", borderWidth: "2px"}} className={"organisationName"}>
            <a href={`/organisations/${id}`}>
                <h4>{name}</h4>
                <p>{owner}</p>
            </a>
        </div>
    );
}

function Pagination({ data, RenderComponent, title, pageLimit, dataLimit }) {
    const [pages] = useState(Math.round(data.length / dataLimit));
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        window.scrollTo({ behavior: 'smooth', top: '0px' });
    }, [currentPage]);

    function goToNextPage() {
        setCurrentPage((page) => {
            if(page < pageLimit) {
                return page + 1;
            }
            return page;
        });
    }

    function goToPreviousPage() {
        setCurrentPage((page) => {
            if(page > 1) {
                return page - 1;
            }
            return page;
        });
    }

    function changePage(event) {
        const pageNumber = Number(event.target.textContent);
        setCurrentPage(pageNumber);
    }

    const getPaginatedData = () => {
        const startIndex = currentPage * dataLimit - dataLimit;
        const endIndex = startIndex + dataLimit;
        return data.slice(startIndex, endIndex);
    };

    const getPaginationGroup = () => {
        let start = Math.floor((currentPage - 1) / pageLimit) * pageLimit;
        return new Array(pageLimit).fill().map((_, idx) => start + idx + 1);
    };

    return (
        <div>
            <div style={{height: "80px"}}>
                <h1 style={{float: "left"}}>{title}</h1>

            </div>
            <br/>

            {/* show the posts, 10 posts at a time */}
            <div className="dataContainer">
                {getPaginatedData().map((d, idx) => (
                    <RenderComponent key={idx} data={d} />
                ))}
            </div>

            {/* show the pagiantion
                it consists of next and previous buttons
                along with page numbers, in our case, 5 page
                numbers at a time
            */}
            <div className="pagination" style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                {/* previous button */}
                <button
                    onClick={goToPreviousPage}
                    className={`prev ${currentPage === 1 ? 'disabled' : ''}`}
                >
                    pagina anterioară
                </button>

                {/* show page numbers */}
                {getPaginationGroup().map((item, index) => (
                    <button
                        key={index}
                        onClick={changePage}
                        className={`paginationItem ${currentPage === item ? 'active' : null}`}
                    >
                        <span>{item}</span>
                    </button>
                ))}

                {/* next button */}
                <button
                    onClick={goToNextPage}
                    className={`next ${currentPage === pages ? 'disabled' : ''}`}
                >
                    pagina următoare
                </button>
            </div>
        </div>
    );
}

export default class AllOrganisations extends Component {
    constructor(props) {
        super(props);

        this.state = {
            organisationsList: [],
            loading: true
        };

        this.currentUser = AuthService.getCurrentUser();
    }

    hasAccess(user) {
        if(user === null) {
            return false;
        }
        return user.roles.includes('ROLE_MODERATOR') || user.roles.includes('ROLE_ADMIN');
    }

    componentDidMount() {
        this.setState({loading: true});
        axios.get("/api/organisations", {
            headers: {
                Authorization: authHeader().Authorization
            }
        })
            .then((data) => this.setState({organisationsList: data["data"], loading: false}))
            .catch((error) => {
                console.log(error.response.data);
            })
    }

    hideAlert() {
        const notification = document.getElementById("notification");
        notification.style.display = "none";
        localStorage.setItem("organisationsMessage", "");
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

        const {organisationsList, loading} = this.state;

        if(loading) {
            return (
                <h1>Se încarcă...</h1>
            );
        }

        return (
            <div className="container">
                {localStorage.getItem("organisationsMessage") !== "" && localStorage.getItem("organisationsMessage") !== null && (
                    <div
                        id={"notification"}
                        role="alert"
                        className={"alert alert-info alert-dismissible"}
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
                        {localStorage.getItem("organisationsMessage")}
                    </div>
                )}
                {organisationsList.length > 0 ? (
                    <>
                        <Pagination
                            data={organisationsList}
                            RenderComponent={OrganisationRepresentation}
                            title="Organizații"
                            pageLimit={5}
                            dataLimit={5}
                        />
                        <br/>
                        <br/>
                        <br/>
                    </>
                ) : (
                    <h1>Momentan nu a fost creată nicio organizație!</h1>
                )}
            </div>
        );
    }
}
