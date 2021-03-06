import React, {Component} from "react";
import authHeader from "../../services/auth-header";
import AuthService from "../../services/auth.service";
import {Button} from "reactstrap";
import {Carousel} from "react-bootstrap";
import * as AiIcons from "react-icons/ai";
import * as BsIcons from "react-icons/bs";
import * as MdIcons from "react-icons/md";
import {Link} from "react-router-dom";
import axios from "axios";

export default class SellingAnnouncement extends Component {

    constructor(props) {
        super(props);

        this.state = {
            sellingAnnouncement: {},
            favorites: [],
            loading: true
        };
    }

    componentDidMount() {
        this.setState({loading: true});

        fetch(`http://localhost:8090/api/favoriteSellingAnnouncements`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => response.json())
            .then((data) => {
                const fav = [];
                for(let i in data) {
                    fav.push(data[i]["id"]);
                }
                this.setState({favorites: fav});
            })

        fetch(`http://localhost:8090/api/sellingAnnouncements/${this.props.match.params.id}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => response.json())
            .then((data) => {
                document.title = data["car"]["model"]["manufacturer"] + " " + data["car"]["model"]["model"];
                this.setState({sellingAnnouncement: data, loading: false});
            });
    }

    async deleteSellingAnnouncement(id) {
        await fetch(`http://localhost:8090/api/sellingAnnouncements/delete/${id}`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            },
        }).then(() => {
            localStorage.setItem("infoMessage", "Anun??ul de v??nzare a fost ??ters cu succes!");
            const user = AuthService.getCurrentUser();
            if(user.roles.length === 1) {
                this.props.history.push("/mySellingAnnouncements");
            } else {
                this.props.history.push("/sellingAnnouncements");
            }
        });
    }

    getTransmission(transmission) {
        if(transmission === "FRONT") {
            return "FA????";
        }
        if(transmission === "REAR") {
            return "SPATE";
        }
        if(transmission === "ALL") {
            return "4WD";
        }
        return "4x4"
    }

    getFuelType(fuelType) {
        if(fuelType === "GASOLINE") {
            return "BENZIN??";
        }
        if(fuelType === "HYBRID") {
            return "HIBRID";
        }
        return fuelType;
    }

    getGearbox(gearbox) {
        if(gearbox === "MANUAL") {
            return "MANUAL??";
        }
        if(gearbox === "AUTOMATIC") {
            return "AUTOMAT??";
        }
        if(gearbox === "SEMI_AUTOMATIC") {
            return "SEMI-AUTOMAT??";
        }
        return "CONTINUU VARIABIL??";
    }

    isOwner(user, announcement) {
        return user !== null && announcement["user"]["id"] === user["id"];
    }

    addToFavorites(id) {
        fetch(`http://localhost:8090/api/favoriteSellingAnnouncements/add/${id}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => {})
            .then((data) => {
                this.setState({loading: true});
                sessionStorage.setItem("favoriteSellingStatus", "Anun??ul a fost ad??ugat la favorite!");
                window.location.reload();
            })
            .catch((error) => console.log(error));
    }

    removeFromFavorites(id) {
        fetch(`http://localhost:8090/api/favoriteSellingAnnouncements/remove/${id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => {})
            .then((data) => {
                this.setState({loading: true});
                sessionStorage.setItem("favoriteSellingStatus", "Anun??ul a fost eliminat de la favorite!");
                window.location.reload();
            })
            .catch((error) => console.log(error));
    }

    changeAnnouncementState(id, state) {
        axios.put(`http://localhost:8090/api/sellingAnnouncements/changeState/${id}`, state, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then(() => {
                const message = state === "ACCEPTED" ? "aprobat" : "respins";
                localStorage.setItem("infoMessage", "Anun??ul de v??nzare a fost " + message + "!");
                this.props.history.push("/pendingAnnouncements")
            })
            .catch((error) => console.log(error));
    }

    hideAlert() {
        const notification = document.getElementById("notification");
        notification.style.display = "none";
        sessionStorage.setItem("favoriteSellingStatus", "");
    }

    mapStateToString(state) {
        if(state === "ACCEPTED") {
            return "ACCEPTAT";
        }
        if(state === "PENDING") {
            return "??N A??TEPTARE";
        }
        return "RESPINS";
    }

    render() {
        const sellingAnnouncement = this.state.sellingAnnouncement;
        let car = {};
        let owner = {};
        if(sellingAnnouncement) {
            car = sellingAnnouncement["car"];
            owner = sellingAnnouncement["user"];
        }

        const loading = this.state.loading;
        const user = AuthService.getCurrentUser();

        if(user === null) {
            setTimeout(() => {
                this.props.history.push("/news");
                window.location.reload();
            }, 2000);
            return (
                <div className={"col-md-12"}>
                    <h1>Nu ave??i dreptul de a accesa aceast?? pagin??!</h1>
                    <h1>Ve??i fi redirec??ionat...</h1>
                </div>
            );
        }

        if(loading) {
            return (
                <h1>Se ??ncarc??...</h1>
            );
        }

        const images = car["images"].map((image) =>
            (<Carousel.Item>
                <img width={"100%"} src={`${process.env.PUBLIC_URL}/assets/images/${image["name"]}`} alt={":("} />
            </Carousel.Item>)
        );

        let titleWidth = "60%";
        if(user.roles.length !== 1) {
            titleWidth = "100%";
        }

        return (
            <div className={"rs-col-md-12"}>
                {sessionStorage.getItem("favoriteSellingStatus") !== null && sessionStorage.getItem("favoriteSellingStatus") !== "" && (
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
                        {sessionStorage.getItem("favoriteSellingStatus")}
                    </div>
                )}

                <div className={"row"}>
                    <div className={"column"} style={{width: "50%"}}>
                        <Carousel fade indicators={false} variant={"dark"} nextLabel={""} prevLabel={""} rows={1} cols={1}>
                            {images}
                        </Carousel>
                    </div>

                    <div style={{width: "5%"}} />

                    <div className={"column"} style={{width: "45%"}}>
                        <div className={"row"}>
                            <div style={{width: titleWidth}}>
                                <h1>
                                    <AiIcons.AiFillCar/> {car["model"]["manufacturer"] + " " + car["model"]["model"]}
                                </h1>
                            </div>

                            {this.isOwner(user, sellingAnnouncement) ?
                                (
                                    <div>
                                        <Button color={"warning"} tag={Link}
                                                to={`/sellingAnnouncements/edit/${sellingAnnouncement["id"]}`}>
                                            Editeaz?? anun??ul <AiIcons.AiFillEdit/>
                                        </Button>
                                        &nbsp;&nbsp;&nbsp;
                                        <Button color={"danger"}
                                                onClick={() => this.deleteSellingAnnouncement(sellingAnnouncement["id"])}>
                                            ??terge anun??ul <MdIcons.MdDeleteForever/>
                                        </Button>
                                        <br/>
                                        <br/>
                                        <h4>Stare anun??: {this.mapStateToString(sellingAnnouncement["state"])}</h4>
                                    </div>
                                )
                                : (user.roles.length === 1 ? (!this.state.favorites.includes(sellingAnnouncement["id"]) ?
                                    (
                                        <div>
                                            <Button color={"primary"} onClick={() => this.addToFavorites(sellingAnnouncement["id"])}>Adaug?? la favorite <BsIcons.BsHeartFill/></Button>
                                        </div>
                                    ) : (
                                        <div>
                                            <Button color={"primary"} onClick={() => this.removeFromFavorites(sellingAnnouncement["id"])}>Elimin?? de la favorite <AiIcons.AiFillCloseCircle/></Button>
                                        </div>
                                    )
                                ) : (
                                    <Button color={"danger"}
                                            onClick={() => this.deleteSellingAnnouncement(sellingAnnouncement["id"])}>
                                        ??terge anun??ul <MdIcons.MdDeleteForever/>
                                    </Button>
                                ))
                            }
                        </div>

                        <br/>

                        <div className={"row"} >
                            <div className={"column"} style={{width: "50%"}}>
                                <ul>
                                    <li>Anul fabrica??iei: {car["year"]}</li>
                                    <li>??ara de origine: {car["country"]}</li>
                                    <li>Categorie: {car["model"]["category"]}</li>
                                    <li>Culoare: {car["color"]}</li>
                                    <li>Kilometraj: {car["kilometers"]} km</li>
                                    <li>Num??r locuri: {car["seats"]}</li>
                                    <li>Aer condi??ionat / climatronic: {car["ac"] ? "DA" : "NU"}</li>
                                    <li>Airbag-uri: {car["airbags"]}</li>
                                </ul>
                            </div>

                            <div className={"column"} style={{width: "50%"}}>
                                <ul>
                                    <li>Capacitate motor: {car["engine"]} cm<sup>3</sup></li>
                                    <li>Putere: {car["power"]} CP</li>
                                    <li>Transmisie: {this.getTransmission(car["transmission"])}</li>
                                    <li>Cutia de viteze: {this.getGearbox(car["gearbox"])}</li>
                                    <li>Trepte: {car["gears"]}</li>
                                    <li>Combustibil: {this.getFuelType(car["fuelType"])}</li>
                                    <li>Consum: {car["consumption"]} litri / 100 km</li>
                                    <li>Norm?? poluare: {car["emissionStandard"].replace("_", " ")}</li>
                                </ul>
                            </div>
                        </div>

                        <br/>

                        <h3>Pre??: {car["price"]} ??? {sellingAnnouncement["negotiable"] ? "negociabil" : ""}</h3>

                        <br/>

                        <h6>Detaliile proprietarului:</h6>
                        <div className={"row"}>
                            <div className={"column"}>
                                <ul>
                                    <li><BsIcons.BsPersonFill/> {owner["firstName"] + " " + owner["lastName"]}</li>
                                    <li><MdIcons.MdLocationOn/> {sellingAnnouncement["location"]}</li>
                                </ul>
                            </div>

                            <div className={"column"}>
                                <ul>
                                    <li><MdIcons.MdEmail /> {owner["email"]}</li>
                                    <li><BsIcons.BsTelephoneFill/> {owner["phone"]}</li>
                                </ul>
                            </div>
                        </div>

                        <br/>
                        <br/>

                        <div className={"row"} style={{float: "right"}}>
                        {(user.roles.includes("ROLE_MODERATOR") || user.roles.includes("ROLE_ADMIN"))
                            && sellingAnnouncement["state"] === "PENDING" && (
                            <div>
                                <Button color={"success"}
                                        onClick={() => this.changeAnnouncementState(sellingAnnouncement["id"], "ACCEPTED")}>
                                    Aprob?? anun??ul <BsIcons.BsCheckLg/>
                                </Button>
                                &nbsp;&nbsp;&nbsp;
                                <Button color={"danger"}
                                        onClick={() => this.changeAnnouncementState(sellingAnnouncement["id"], "REJECTED")}>
                                    Respinge anun??ul <MdIcons.MdOutlineClose/>
                                </Button>
                            </div>
                        )}
                    </div>

                    </div>
                </div>

                <br/>

                {sellingAnnouncement["description"] &&
                    (<div>
                        <h4>Descrierea proprietarului:</h4>
                        <p>{sellingAnnouncement["description"]}</p>
                    </div>)
                }
            </div>
        );
    }
}