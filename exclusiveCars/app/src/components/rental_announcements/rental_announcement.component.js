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

export default class RentalAnnouncement extends Component {

    constructor(props) {
        super(props);

        this.state = {
            rentalAnnouncement: {},
            startDate: "",
            endDate: "",
            dateRange: "",
            button: 0,
            loading: true
        };

        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        this.setState({loading: true});
        fetch(`http://localhost:8090/api/rentalAnnouncements/${this.props.match.params.id}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => response.json())
            .then((data) => this.setState({rentalAnnouncement: data, loading: false}));
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
            // todo schimbă redirect-ul
            this.props.history.push("/news");
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
        this.setState({
            dateRange: update
        });
        [this.state.startDate, this.state.endDate] = update;
    }

    render() {
        const rentalAnnouncement = this.state.rentalAnnouncement;
        let car = {};
        let rentalCenter = {};
        if(rentalAnnouncement) {
            car = rentalAnnouncement["car"];
            rentalCenter = rentalAnnouncement["rentalCenter"]
        }
        console.log(rentalAnnouncement);
        const loading = this.state.loading;
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

        if(loading) {
            return (
                <h1>Se încarcă...</h1>
            );
        }

        const images = car["images"].map((image) =>
            (<Carousel.Item>
                <img width={"100%"} src={`${process.env.PUBLIC_URL}/assets/images/${image["name"]}`} alt={":("} />
            </Carousel.Item>)
        );

        return (
            <div className={"rs-col-md-12"}>
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
                        <h1>
                            <AiIcons.AiFillCar/> {car["model"]["manufacturer"] + " " + car["model"]["model"]}
                        </h1>

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
                                <h3>Preț: {car["price"]} lei / zi</h3>
                            </div>

                            <div  style={{float: "right"}}>
                                <Button color={this.state.button === 0 ? "info" : "danger"} onClick={() => this.setState({button: 1 - this.state.button, dateRange: ""})}>
                                    <MdIcons.MdCarRental/> {this.state.button === 0 ? "Închiriază mașina" : "Anulează acțiunea"}
                                </Button>
                            </div>
                        </div>

                        <br/>
                        <br/>
                        <br/>

                        {/*todo: dezactiveaza datele ocupate */}
                        <Form>
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
                                    {(this.state.endDate.getTime() - this.state.startDate.getTime()) / (1000 * 3600 * 24)} zile.
                                    Cost total: {(this.state.endDate.getTime() - this.state.startDate.getTime()) / (1000 * 3600 * 24) * car["price"]} lei
                                </h5>
                                <p>
                                    <span style={{fontStyle: "italic"}}>
                                        <IoIcons.IoIosWarning/>&nbsp;Apăsând pe butonul de confirmare, vei efectua programarea!
                                        Vei primi pe email detaliile despre plată și despre cum vei intra în posesia automobilului!
                                    </span>
                                </p>
                                <br/>
                                <Button color={"success"}>Confirmă cererea de închiriere</Button>
                            </div>)
                        }
                        </Form>
                    </div>
                </div>
            </div>
        );
    }
}