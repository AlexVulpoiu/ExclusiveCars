import React, {useState, Component, useEffect} from "react";

import {Button} from "reactstrap";
import {Link} from "react-router-dom";

import "../../styles/pagination.css";
import AuthService from "../../services/auth.service";
import * as AiIcons from "react-icons/ai";

const formatDate = value => {
    const dateString = String(value);
    const values = dateString.split("-");
    return values.reverse().join("-");
};

function NewsRepresentation(props) {
    const {id, title, content, date, hour} = props.data
    return (
        <header className="jumbotron">
            <h3>{title}</h3>
            <p>{content.substring(0, 500) + "[...]"}</p>
            <Button color={"primary"} style={{float: "left"}} tag={Link} to={`/news/${id}`}>Citește articolul</Button>
            <h6 style={{float: "right"}}>{"Articol postat în data de " + formatDate(date) + ", ora " + hour}</h6>
        </header>
    );
}

function Pagination({ data, RenderComponent, title, pageLimit, dataLimit }) {
    const [pages] = useState(Math.round(data.length / dataLimit));
    const [currentPage, setCurrentPage] = useState(1);
    const user = AuthService.getCurrentUser();

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

                {user != null && (user.roles.includes('ROLE_MODERATOR') || user.roles.includes('ROLE_ADMIN')) &&
                    (<Button color={"success"} tag={Link} to={`/news/add`} style={{float: "right"}}><AiIcons.AiFillFileAdd/> Adaugă o știre</Button>)}
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

export default class News extends Component {
    constructor(props) {
        super(props);

        this.state = {
            newsList: [],
            loading: true
        };
    }

    componentDidMount() {
        this.setState({loading: true});
        fetch("/api/news")
            .then((response) => response.json())
            .then((data) => this.setState({newsList: data, loading: false}))
    }

    hideAlert() {
        const notification = document.getElementById("notification");
        notification.style.display = "none";
        localStorage.setItem("infoMessage", "");
    }

    render() {
        const {newsList, loading} = this.state;

        if(loading) {
            return (
                <h1>Se încarcă...</h1>
            );
        }

        return (
            <div className="container">
                {localStorage.getItem("infoMessage") !== "" && localStorage.getItem("infoMessage") !== null && (
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
                        {localStorage.getItem("infoMessage")}
                    </div>
                )}
                {newsList.length > 0 ? (
                    <>
                        <Pagination
                            data={newsList}
                            RenderComponent={NewsRepresentation}
                            title="Secțiune știri"
                            pageLimit={5}
                            dataLimit={5}
                        />
                        <br/>
                        <br/>
                        <br/>
                    </>
                ) : (
                    <h1>Nu a fost postată nicio știre!</h1>
                )}
            </div>
        );
    }
}
