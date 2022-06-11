import React, {Component} from "react";
import authHeader from "../../services/auth-header";
import AuthService from "../../services/auth.service";
import {Carousel} from "react-bootstrap";
import * as AiIcons from "react-icons/ai";
import * as BsIcons from "react-icons/bs";
import * as MdIcons from "react-icons/md";

export default class SellingAnnouncement extends Component {

    constructor(props) {
        super(props);

        this.state = {
            sellingAnnouncement: {},
            loading: true
        };
    }

    componentDidMount() {
        this.setState({loading: true});
        fetch(`http://localhost:8090/api/sellingAnnouncements/${this.props.match.params.id}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => response.json())
            .then((data) => this.setState({sellingAnnouncement: data, loading: false}));
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
            localStorage.setItem("infoMessage", "Anunțul de vânzare a fost șters cu succes!");
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

    render() {
        const sellingAnnouncement = this.state.sellingAnnouncement;
        let car = {};
        let owner = {};
        if(sellingAnnouncement) {
            car = sellingAnnouncement["car"];
            owner = sellingAnnouncement["user"];
        }
        console.log(sellingAnnouncement);
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

                        <br/>

                        <h3>Preț: {car["price"]} € {car["negotiable"] ? "negociabil" : ""}</h3>

                        <br/>

                        <h6>Detaliile proprietarului:</h6>
                        <div className={"row"}>
                            <div className={"column"}>
                                <ul>
                                    <li><BsIcons.BsPersonFill/> {owner["firstName"] + " " + owner["lastName"]}</li>
                                    <li><MdIcons.MdLocationOn/> {car["location"]}</li>
                                </ul>
                            </div>

                            <div className={"column"}>
                                <ul>
                                    <li><MdIcons.MdEmail /> {owner["email"]}</li>
                                    <li><BsIcons.BsTelephoneFill/> {owner["phone"]}</li>
                                </ul>
                            </div>
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