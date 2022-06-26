import React, {Component} from "react";
import authHeader from "../../services/auth-header";
import AuthService from "../../services/auth.service";
import {Carousel} from "react-bootstrap";
import * as AiIcons from "react-icons/ai";
import * as BsIcons from "react-icons/bs";
import * as MdIcons from "react-icons/md";
import * as IoIcons from "react-icons/io";
import {Button} from "reactstrap";
import DatePicker from "react-datepicker";
import ro from 'date-fns/locale/ro';
import addDays from "date-fns/addDays";
import Form from "react-validation/build/form";
import axios from "axios";
import {Link} from "react-router-dom";

export default class RentalAnnouncement extends Component {

    constructor(props) {
        super(props);

        this.state = {
            rentalAnnouncement: {},
            carRentals: [],
            userRentals: [],
            startDate: "",
            endDate: "",
            excludedDates: [],
            dateRange: "",
            button: 0,
            favorites: [],
            loading: true
        };

        this.currentUser = AuthService.getCurrentUser();

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async componentDidMount() {
        this.setState({loading: true});

        if(this.currentUser.roles.length === 1) {
            fetch(`http://localhost:8090/api/favoriteRentalAnnouncements`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: authHeader().Authorization
                }
            })
                .then((response) => response.json())
                .then((data) => {
                    const fav = [];
                    for (let i in data) {
                        fav.push(data[i]["id"]);
                    }
                    this.setState({favorites: fav});
                })
        }

        await fetch(`http://localhost:8090/api/rentalAnnouncements/${this.props.match.params.id}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                this.setState({rentalAnnouncement: data})
            });

        await fetch(`http://localhost:8090/api/rentCars/rentals/${this.state.rentalAnnouncement["car"]["id"]}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => response.json())
            .then((data) => this.setState({carRentals: data}));

        if(this.currentUser.roles.length === 1) {
            await fetch(`http://localhost:8090/api/rentCars/myRentals`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: authHeader().Authorization
                }
            })
                .then((response) => response.json())
                .then((data) => this.setState({userRentals: data}));
        }

        this.setState({excludedDates: this.getUnavailableDates()});

        this.setState({loading: false});
    }

    async handleSubmit(e) {
        if(this.state.startDate !== null && this.state.startDate !== ""
            && this.state.endDate !== null && this.state.endDate !== "") {

            e.preventDefault();

            this.setState({loading: true});

            const year = this.state.startDate.getFullYear();
            const month = (this.state.startDate.getMonth() + 1) < 10 ? "0" + (this.state.startDate.getMonth() + 1) : (this.state.startDate.getMonth() + 1);
            const day = this.state.startDate.getDate() < 10 ? "0" + this.state.startDate.getDate() : this.state.startDate.getDate();
            const start = year + "-" + month + "-" + day;

            const y = this.state.endDate.getFullYear();
            const m = (this.state.endDate.getMonth() + 1) < 10 ? "0" + (this.state.endDate.getMonth() + 1) : (this.state.endDate.getMonth() + 1);
            const d = this.state.endDate.getDate() < 10 ? "0" + this.state.endDate.getDate() : this.state.endDate.getDate();
            const end = y + "-" + m + "-" + d;

            const formData = new FormData();
            formData.append("startDate", start);
            formData.append("endDate", end);
            formData.append("announcement", this.state.rentalAnnouncement["id"])

            await axios.post(`http://localhost:8090/api/rentCars/rent/${this.state.rentalAnnouncement["car"]["id"]}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: authHeader().Authorization
                }
            })
                .then(() => {
                    localStorage.setItem("infoMessage", "Programarea a fost efectuată cu succes!");
                    this.props.history.push("/news");
                })
                .catch((error) => {
                    alert(error);
                    window.location.reload();
                });
        }
    }

    async deleteRentalAnnouncement(id) {
        await fetch(`http://localhost:8090/api/rentalAnnouncements/delete/${id}`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            },
        }).then(() => {
            localStorage.setItem("infoMessage", "Anunțul de închiriere a fost șters cu succes!");
            this.props.history.push("/myRentalAnnouncements");
        });
    }

    getTransmission(transmission) {
        if(transmission === "FRONT") {
            return "FAȚĂ";
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
            return "BENZINĂ";
        }
        if(fuelType === "HYBRID") {
            return "HIBRID";
        }
        return fuelType;
    }

    getGearbox(gearbox) {
        if(gearbox === "MANUAL") {
            return "MANUALĂ";
        }
        if(gearbox === "AUTOMATIC") {
            return "AUTOMATĂ";
        }
        if(gearbox === "SEMI_AUTOMATIC") {
            return "SEMI-AUTOMATĂ";
        }
        return "CONTINUU VARIABILĂ";
    }

    handleChange(update) {

        const excludedDates = this.state.excludedDates;
        let ok = true;
        for(let i in excludedDates) {
            const s = excludedDates[i]["start"];
            const e = excludedDates[i]["end"];

            if(e >= update[0] && s <= update[1]) {
                ok = false;
                break;
            }
        }

        if(ok) {
            this.setState({
                dateRange: update
            });
            [this.state.startDate, this.state.endDate] = update;
        } else {
            alert("Toate zilele din intervalul ales trebuie să fie disponibile!");
            window.location.reload();
        }
    }

    getUnavailableDates() {
        const excludedDates = [];

        const userRentals = this.state.userRentals;
        for(let i in userRentals) {
            let start = new Date(userRentals[i]["id"]["startDate"]);
            const day = start.getDate();
            start = start.setDate(day - 1);
            const end = new Date(userRentals[i]["endDate"]);
            excludedDates.push({start: start, end: end});
        }

        const carRentals = this.state.carRentals;
        for(let i in carRentals) {
            let start = new Date(carRentals[i]["id"]["startDate"]);
            const day = start.getDate();
            start = start.setDate(day - 1);
            const end = new Date(carRentals[i]["endDate"]);
            excludedDates.push({start: start, end: end});
        }

        return excludedDates;
    }

    addToFavorites(id) {
        fetch(`http://localhost:8090/api/favoriteRentalAnnouncements/add/${id}`, {
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
                sessionStorage.setItem("favoriteRentalStatus", "Anunțul a fost adăugat la favorite!");
                window.location.reload();
            })
            .catch((error) => console.log(error));
    }

    removeFromFavorites(id) {
        fetch(`http://localhost:8090/api/favoriteRentalAnnouncements/remove/${id}`, {
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
                sessionStorage.setItem("favoriteRentalStatus", "Anunțul a fost eliminat de la favorite!");
                window.location.reload();
            })
            .catch((error) => console.log(error));
    }

    hideAlert() {
        const notification = document.getElementById("notification");
        notification.style.display = "none";
        sessionStorage.setItem("favoriteRentalStatus", "");
    }

    isOwner(user, announcement) {
        return user !== null && user["id"] === announcement["rentalCenter"]["organisation"]["owner"]["id"];
    }

    render() {
        const loading = this.state.loading;
        if(loading) {
            return (
                <h1>Se încarcă...</h1>
            );
        }

        const rentalAnnouncement = this.state.rentalAnnouncement;
        console.log(rentalAnnouncement);
        let car = {};
        let rentalCenter = {};
        if(rentalAnnouncement) {
            car = rentalAnnouncement["car"];
            rentalCenter = rentalAnnouncement["rentalCenter"]
        }
        console.log(rentalAnnouncement);
        const user = AuthService.getCurrentUser();

        if(user === null) {
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

        const images = car["images"].map((image) =>
            (<Carousel.Item>
                <img width={"100%"} src={`${process.env.PUBLIC_URL}/assets/images/${image["name"]}`} alt={":("} />
            </Carousel.Item>)
        );

        return (
            <div className={"rs-col-md-12"}>
                {sessionStorage.getItem("favoriteRentalStatus") !== null && sessionStorage.getItem("favoriteRentalStatus") !== "" && (
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
                        {sessionStorage.getItem("favoriteRentalStatus")}
                    </div>
                )}

                <div className={"row"}>
                    <div className={"column"} style={{width: "50%"}}>
                        <Carousel fade indicators={false} variant={"dark"} nextLabel={""} prevLabel={""} rows={1} cols={1}>
                            {images}
                        </Carousel>

                        <br/>

                        <h5>
                            Automobilul este disponibil la <a href={`/rentalCenters/${rentalCenter["id"]}`} target={"_blank"}>{rentalCenter["name"]}, în {rentalCenter["city"]}, {rentalCenter["address"]} </a>
                        </h5>

                        <br/>

                        <h6>Detalii de contact</h6>

                        <ul>
                            <li><MdIcons.MdEmail /> {rentalCenter["email"]}</li>
                            <li><BsIcons.BsTelephoneFill/> {rentalCenter["phone"]}</li>
                        </ul>
                    </div>

                    <div style={{width: "5%"}} />

                    <div className={"column"} style={{width: "45%"}}>
                        <div className={"row"}>
                            <div style={{width: "60%"}}>
                                <h1>
                                    <AiIcons.AiFillCar/> {car["model"]["manufacturer"] + " " + car["model"]["model"]}
                                </h1>
                            </div>

                            {
                                this.isOwner(user, rentalAnnouncement) ?
                                (
                                    <div>
                                        <Button color={"warning"} tag={Link}
                                                to={`/rentalAnnouncements/edit/${rentalAnnouncement["id"]}`}>
                                            Editează anunțul <AiIcons.AiFillEdit/>
                                        </Button>
                                        &nbsp;&nbsp;&nbsp;
                                        <Button color={"danger"}
                                                onClick={() => this.deleteRentalAnnouncement(rentalAnnouncement["id"])}>
                                            Șterge anunțul <MdIcons.MdDeleteForever/>
                                        </Button>
                                    </div>
                                )
                                :
                                    (!this.state.favorites.includes(rentalAnnouncement["id"]) ?
                                        (
                                            <div>
                                                <Button color={"primary"} onClick={() => this.addToFavorites(rentalAnnouncement["id"])}>Adaugă la favorite <BsIcons.BsHeartFill/></Button>
                                            </div>
                                        ) : (
                                            <div>
                                                <Button color={"primary"} onClick={() => this.removeFromFavorites(rentalAnnouncement["id"])}>Elimină de la favorite <AiIcons.AiFillCloseCircle/></Button>
                                            </div>
                                        )
                                )
                            }
                        </div>

                        <br/>

                        <div className={"row"} >
                            <div className={"column"} style={{width: "50%"}}>
                                <ul>
                                    <li>Anul fabricației: {car["year"]}</li>
                                    <li>Țara de origine: {car["country"]}</li>
                                    <li>Categorie: {car["model"]["category"]}</li>
                                    <li>Culoare: {car["color"]}</li>
                                    <li>Kilometraj: {car["kilometers"]} km</li>
                                    <li>Număr locuri: {car["seats"]}</li>
                                    <li>Aer condiționat / climatronic: {car["ac"] ? "DA" : "NU"}</li>
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
                                    <li>Normă poluare: {car["emissionStandard"].replace("_", " ")}</li>
                                </ul>
                            </div>
                        </div>

                        <div className={"row"} style={{display: "block"}}>
                            <div style={{float: "left"}}>
                                <h3>Preț: {car["price"]} € / zi</h3>
                            </div>

                            {!this.isOwner(user, rentalAnnouncement) ?
                                (<div style={{float: "right"}}>
                                    <Button color={this.state.button === 0 ? "info" : "danger"}
                                            onClick={() => this.setState({button: 1 - this.state.button, dateRange: ""})}>
                                        <MdIcons.MdCarRental/> {this.state.button === 0 ? "Închiriază mașina" : "Anulează acțiunea"}
                                    </Button>
                                </div>) : (
                                    <div style={{float: "right"}}>
                                        <Button color={"info"} tag={Link} to={`/rentCars/rentals/${rentalAnnouncement["id"]}`}>
                                            <MdIcons.MdCarRental/> Vizualizează cererile de închiriere
                                        </Button>
                                    </div>
                                )
                            }
                        </div>

                        <br/>
                        <br/>
                        <br/>

                        <Form onSubmit={this.handleSubmit}>
                        {this.state.button === 1 &&
                            (<div style={{textAlign: "center"}} className={"row"}>
                                <DatePicker
                                    locale={ro}
                                    dateFormat="d.MM.yyyy"
                                    placeholderText={"Alegeți perioada..."}
                                    autoFocus
                                    // withPortal
                                    startDate={this.state.startDate}
                                    endDate={this.state.endDate}
                                    onChange={this.handleChange}
                                    minDate={new Date()}
                                    maxDate={addDays(new Date(), 60)}
                                    excludeDateIntervals={this.state.excludedDates}
                                    selectsRange={true}
                                    renderCustomHeader={({
                                                             monthDate,
                                                             customHeaderCount,
                                                             decreaseMonth,
                                                             increaseMonth,
                                                         }) => (
                                        <div>
                                            <button
                                                aria-label="Previous Month"
                                                className={
                                                    "react-datepicker__navigation react-datepicker__navigation--previous"
                                                }
                                                type={"button"}
                                                style={customHeaderCount === 1 ? { visibility: "hidden" } : null}
                                                onClick={decreaseMonth}
                                            >
            <span
                className={
                    "react-datepicker__navigation-icon react-datepicker__navigation-icon--previous"
                }
            >
              {"<"}
            </span>
                                            </button>
                                            <span className="react-datepicker__current-month">
            {monthDate.toLocaleString("ro", {
                month: "long",
                year: "numeric",
            })}
          </span>
                                            <button
                                                aria-label="Next Month"
                                                className={
                                                    "react-datepicker__navigation react-datepicker__navigation--next"
                                                }
                                                type={"button"}
                                                style={customHeaderCount === 0 ? { visibility: "hidden" } : null}
                                                onClick={increaseMonth}
                                            >
            <span
                className={
                    "react-datepicker__navigation-icon react-datepicker__navigation-icon--next"
                }
            >
              {">"}
            </span>
                                            </button>
                                        </div>
                                    )}
                                    // selected={}
                                    // onChange={}
                                    monthsShown={2}
                                />
                            </div>)
                        }
                        {this.state.startDate !== null && this.state.startDate !== ""
                            && this.state.endDate !== null && this.state.endDate !== "" && this.state.button === 1 &&
                            (<div style={{textAlign: "center"}}>
                                <br/>
                                <h5>
                                    Ați selectat o perioadă de&nbsp;
                                    {(this.state.endDate.getTime() - this.state.startDate.getTime()) / (1000 * 3600 * 24) + 1} zile.
                                    Cost total: {((this.state.endDate.getTime() - this.state.startDate.getTime()) / (1000 * 3600 * 24) + 1) * car["price"]} €
                                </h5>
                                <p>
                                    <span style={{fontStyle: "italic"}}>
                                        <IoIcons.IoIosWarning/>&nbsp;Apăsând pe butonul de confirmare, vei efectua programarea!
                                        Vei primi pe email detaliile despre plată și despre cum vei intra în posesia automobilului!
                                    </span>
                                </p>
                                <br/>

                                <div className={"form-group"}>
                                    <Button
                                        color={"success"}
                                        className="btn btn-primary btn-block"
                                        disabled={this.state.loading}
                                    >
                                        {this.state.loading && (
                                            <span className="spinner-border spinner-border-sm"/>
                                        )}
                                        <span>Confirmă cererea de închirirere</span>
                                    </Button>
                                </div>
                            </div>)
                        }
                        </Form>
                    </div>
                </div>
            </div>
        );
    }
}