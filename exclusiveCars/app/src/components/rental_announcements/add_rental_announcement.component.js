import React, { Component } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import Select from 'react-select';

import authHeader from '../../services/auth-header';
import {Button} from "reactstrap";
import axios from "axios";
import AuthService from "../../services/auth.service";
import UploadFiles from "../upload_images/upload_files.component";

const required = value => {
    if (!value) {
        return (
            <div className="alert alert-danger" role="alert">
                Acest câmp este obligatoriu!
            </div>
        );
    }
};

export default class AddRentalAnnouncement extends Component {

    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.onChangeTitle = this.onChangeTitle.bind(this);
        this.onChangeContent = this.onChangeContent.bind(this);
        this.onChangeBrand = this.onChangeBrand.bind(this);
        this.onChangeModel = this.onChangeModel.bind(this);

        this.currentUser = AuthService.getCurrentUser();

        this.state = {
            carBrands: [],
            currentBrand: "",
            carModels: {},
            currentModels: [],
            carCategories: {},
            currentCategories: [],
            rentalCenter: null,
            currentOrganisation: null,
            loading: false,
            message: ""
        }
    }

    componentDidMount() {
        this.setState({loading: true});

        fetch(`http://localhost:8090/api/rentalCenters/${this.props.match.params.rentalCenterId}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => response.json())
            .then((data) => {
                this.setState({rentalCenter: data});
            })
            .catch((error) => console.log(error));

        if(this.currentUser.roles.includes('ROLE_ORGANISATION')) {
            axios.get(`http://localhost:8090/api/organisations/myOrganisation`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: authHeader().Authorization
                }
            })
                .then((data) => {
                    this.setState({currentOrganisation: data["data"], loading: false});
                    console.log(data);
                    console.log(data["data"]);
                })
                .catch((error) => {
                    console.log(error);
                })
        }

        fetch("http://localhost:8090/api/carModels/brands", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => response.json())
            .then((data) => {
                this.setState({carBrands: data});
            })
            .catch((error) => console.log(error));

        fetch("http://localhost:8090/api/carModels/models", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => response.json())
            .then((data) => {
                this.setState({carModels: data});
            })
            .catch((error) => console.log(error));

        fetch("http://localhost:8090/api/carModels/categories", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => response.json())
            .then((data) => {
                this.setState({carCategories: data});
            })
            .catch((error) => console.log(error));
    }

    onChangeTitle(e) {
        this.setState({
            title: e.target.value
        });
    }

    onChangeContent(e) {
        this.setState({
            content: e.target.value
        });
    }

    onChangeBrand(e) {
        const carModels = this.state.carModels[e.value];
        const models = [];
        for(let cm in carModels) {
            models.push({"value": carModels[cm], "label": carModels[cm]});
        }

        this.setState({
            currentBrand: e.value,
            currentModels: models
        })
    }

    onChangeModel(e) {
        const carCategories = this.state.carCategories[this.state.currentBrand + "_" + e.value];
        const categories = [];
        for(let cc in carCategories) {
            categories.push({"value": carCategories[cc], "label": carCategories[cc]});
        }

        this.setState({
            currentCategories: categories
        })
    }

    currentUserIsOwner() {
        return this.state.currentOrganisation.name === this.state.rentalCenter.organisation;
    }

    async handleSubmit(e) {
        e.preventDefault();

        this.setState({
            message: "",
            loading: true
        })

        this.form.validateAll();

        if(this.checkBtn.context._errors.length === 0) {
            const newArticle = null
            // newArticle["title"] = this.state.title.trim()
            // newArticle["content"] = this.state.content.trim()

            await axios.post("http://localhost:8090/api/rentalCenters/add", newArticle, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: authHeader().Authorization
                }
            })
                .then(() => {
                    localStorage.setItem("infoMessage", "Articolul a fost adăugat cu succes!");
                    this.props.history.push("/news");
                })
                .catch((error) => {
                    this.props.history.push("/news/add");
                    window.location.reload();

                    localStorage.setItem("rentalAnnouncementAddMessage", error.response.data);
                    localStorage.setItem("newsTitle", newArticle["title"]);
                    localStorage.setItem("newsContent", newArticle["content"]);
                });
        } else {
            this.setState({
                loading: false
            });
        }
    }

    hideAlert() {
        const notification = document.getElementById("notification");
        notification.style.display = "none";
        localStorage.setItem("rentalAnnouncementAddMessage", "");
    }

    render() {
        const carBrands = this.state.carBrands;
        const brands = [];
        for(let cb in carBrands) {
            brands.push({"value": carBrands[cb], "label": carBrands[cb]});
        }

        const transmissions = [
            {"value": "FRONT", "label": "FRONT"},
            {"value": "REAR", "label": "REAR"},
            {"value": "ALL", "label": "ALL WHEELS DRIVE"},
            {"value": "FOUR", "label": "4x4"}
        ];

        const gearboxes = [
            {"value": "MANUAL", "label": "MANUALA"},
            {"value": "AUTOMATIC", "label": "AUTOMATA"},
            {"value": "SEMI_AUTOMATIC", "label": "SEMI-AUTOMATA"},
            {"value": "CONTINUOUSLY_VARIABLE", "label": "CONTINUU VARIABILA"}
        ];

        const fuelTypes = [
            {"value": "GASOLINE", "label": "BENZINA"},
            {"value": "DIESEL", "label": "DIESEL"},
            {"value": "ELECTRIC", "label": "ELECTRIC"},
            {"value": "HYBRID", "label": "HIBRID"}
        ];

        const emissionStandards = [
            {"value": "EURO_1", "label": "EURO 1"},
            {"value": "EURO_2", "label": "EURO 2"},
            {"value": "EURO_3", "label": "EURO 3"},
            {"value": "EURO_4", "label": "EURO 4"},
            {"value": "EURO_5", "label": "EURO 5"},
            {"value": "EURO_6", "label": "EURO 6"},
            {"value": "NON_EURO", "label": "NON EURO"}
        ];

        setTimeout(() => {
            if (!this.currentUserIsOwner()) {
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
        }, 1000);

        return (
            <div className={"col-md-12"}>
                <div>
                    {localStorage.getItem("rentalAnnouncementAddMessage") !== null && localStorage.getItem("rentalAnnouncementAddMessage") !== "" && (
                        <div
                            id={"notification"}
                            role="alert"
                            className={"alert alert-warning alert-dismissible"}
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
                            {localStorage.getItem("rentalAnnouncementAddMessage")}
                        </div>
                    )}

                    <h2 style={{alignSelf: "center"}}>Adăugare anunț de închiriere</h2>

                    <Form
                        onSubmit={this.handleSubmit}
                        ref={c => {
                            this.form = c;
                        }}
                    >
                        <div className={"row"}>
                            <div className={"column"} style={{width: "30%"}}>
                                <label htmlFor={"brand"}>Brand-ul mașinii</label>
                                <Select
                                    name={"brand"}
                                    placeholder={"Alege brand-ul mașinii..."}
                                    options={brands}
                                    onChange={this.onChangeBrand} />
                            </div>

                            <div style={{width: "5%"}} />

                            <div className={"column"} style={{width: "30%"}}>
                                <label htmlFor={"model"}>Modelul mașinii</label>
                                <Select
                                    name={"model"}
                                    placeholder={"Alege modelul mașinii..."}
                                    options={this.state.currentModels}
                                    onChange={this.onChangeModel} />
                            </div>

                            <div style={{width: "5%"}} />

                            <div className={"column"} style={{width: "30%"}}>
                                <label htmlFor={"category"}>Categoria mașinii</label>
                                <Select
                                    name={"category"}
                                    placeholder={"Alege categoria mașinii..."}
                                    options={this.state.currentCategories} />
                            </div>
                        </div>

                        <br/>

                        <div className={"row"}>
                            <div className={"column"} style={{width: "30%"}}>
                                <label htmlFor={"color"}>Culoare</label>
                                <Input
                                    type={"text"}
                                    className={"form-control"}
                                    name={"color"}
                                    value={this.state.color}
                                    // onChange={this.onChangeCountry}
                                    // validations={[required, vCountry]}
                                />
                            </div>

                            <div style={{width: "5%"}}/>

                            <div className={"column"} style={{width: "30%"}}>
                                <label htmlFor={"year"}>Anul fabricației</label>
                                <Input
                                    type={"number"}
                                    min={1950}
                                    max={(new Date()).getFullYear()}
                                    className={"form-control"}
                                    name={"year"}
                                    value={this.state.year}
                                    // onChange={this.onChangeYear}
                                    // validations={[required, vYear]}
                                />
                            </div>

                            <div style={{width: "5%"}}/>

                            <div className={"column"} style={{width: "30%"}}>
                                <label htmlFor={"country"}>Țara de origine</label>
                                <Input
                                    type={"text"}
                                    className={"form-control"}
                                    name={"country"}
                                    value={this.state.country}
                                    // onChange={this.onChangeCountry}
                                    // validations={[required, vCountry]}
                                />
                            </div>
                        </div>

                        <br/>

                        <div className={"row"}>
                            <div className={"column"} style={{width: "30%"}}>
                                <label htmlFor={"engine"}>Capacitatea motorului (cm<sup>3</sup>)</label>
                                <Input
                                    type={"text"}
                                    className={"form-control"}
                                    name={"engine"}
                                    value={this.state.engine}
                                    // onChange={this.onChangeCountry}
                                    // validations={[required, vCountry]}
                                />
                            </div>

                            <div style={{width: "5%"}}/>

                            <div className={"column"} style={{width: "30%"}}>
                                <label htmlFor={"power"}>Putere</label>
                                <Input
                                    type={"text"}
                                    className={"form-control"}
                                    name={"power"}
                                    value={this.state.power}
                                    // onChange={this.onChangeYear}
                                    // validations={[required, vYear]}
                                />
                            </div>

                            <div style={{width: "5%"}}/>

                            <div className={"column"} style={{width: "30%"}}>
                                <label htmlFor={"kilometers"}>Număr de kilometri</label>
                                <Input
                                    type={"text"}
                                    className={"form-control"}
                                    name={"kilometers"}
                                    value={this.state.kilometeres}
                                    // onChange={this.onChangeCountry}
                                    // validations={[required, vCountry]}
                                />
                            </div>
                        </div>

                        <br/>

                        <div className={"row"}>
                            <div className={"column"} style={{width: "30%"}}>
                                <label htmlFor={"transmission"}>Transmisie</label>
                                <Select
                                    name={"transmission"}
                                    placeholder={"Alege tipul transmisiei..."}
                                    options={transmissions} />
                            </div>

                            <div style={{width: "5%"}}/>

                            <div className={"column"} style={{width: "30%"}}>
                                <label htmlFor={"gearbox"}>Cutia de viteze</label>
                                <Select
                                    name={"gearbox"}
                                    placeholder={"Alege tipul cutiei de viteze..."}
                                    options={gearboxes} />
                            </div>

                            <div style={{width: "5%"}}/>

                            <div className={"column"} style={{width: "30%"}}>
                                <label htmlFor={"gears"}>Trepte de viteză</label>
                                <Input
                                    type={"number"}
                                    min={4}
                                    max={8}
                                    className={"form-control"}
                                    name={"gears"}
                                    value={this.state.gears}
                                    // onChange={this.onChangeCountry}
                                    // validations={[required, vCountry]}
                                />
                            </div>
                        </div>

                        <br/>

                        <div className={"row"}>
                            <div className={"column"} style={{width: "30%"}}>
                                <label htmlFor={"fuelType"}>Combustibil</label>
                                <Select
                                    name={"fuelType"}
                                    placeholder={"Alege tipul de combustibil..."}
                                    options={fuelTypes} />
                            </div>

                            <div style={{width: "5%"}}/>

                            <div className={"column"} style={{width: "30%"}}>
                                <label htmlFor={"consumption"}>Consum (litri / 100 km)</label>
                                <Input
                                    type={"text"}
                                    className={"form-control"}
                                    name={"consumption"}
                                    value={this.state.consumption}
                                    // onChange={this.onChangeCountry}
                                    // validations={[required, vCountry]}
                                />
                            </div>

                            <div style={{width: "5%"}}/>

                            <div className={"column"} style={{width: "30%"}}>
                                <label htmlFor={"emissionStandard"}>Norma de poluare</label>
                                <Select
                                    name={"emissionStandard"}
                                    placeholder={"Alege norma de poluare..."}
                                    options={emissionStandards} />
                            </div>
                        </div>

                        <br/>

                        <div className={"row"}>
                            <div className={"column"} style={{width: "30%"}}>
                                <label htmlFor={"seats"}>Număr locuri</label>
                                <Input
                                    type={"number"}
                                    min={1}
                                    max={50}
                                    className={"form-control"}
                                    name={"seats"}
                                    value={this.state.seats}
                                    // onChange={this.onChangeCountry}
                                    // validations={[required, vCountry]}
                                />
                            </div>

                            <div style={{width: "5%"}}/>

                            <div className={"column"} style={{width: "30%"}}>
                                <label htmlFor={"ac"}>Aer condiționat / climatronic</label>
                                <Select
                                    name={"ac"}
                                    placeholder={"Alege o variantă..."}
                                    options={[{"label": "DA", "value": "true"}, {"label": "NU", "value": "false"}]} />
                            </div>

                            <div style={{width: "5%"}}/>

                            <div className={"column"} style={{width: "30%"}}>
                                <label htmlFor={"airbag"}>Număr airbag-uri</label>
                                <Input
                                    type={"number"}
                                    min={1}
                                    max={6}
                                    className={"form-control"}
                                    name={"airbag"}
                                    value={this.state.airbag}
                                    // onChange={this.onChangeCountry}
                                    // validations={[required, vCountry]}
                                />
                            </div>
                        </div>

                        <br/>

                        <div className={"row"}>
                            <div className={"column"} style={{width: "30%"}}>
                                <label htmlFor={"price"}>Preț</label>
                                <Input
                                    type={"text"}
                                    className={"form-control"}
                                    name={"price"}
                                    value={this.state.price}
                                    // onChange={this.onChangeCountry}
                                    // validations={[required, vCountry]}
                                />
                            </div>
                        </div>

                        <br/>

                        <h3>Adaugă imagini cu automobilul</h3>

                        <form>
                            <UploadFiles/>
                        </form>

                        <br/>

                        <div className="form-group">
                            <Button
                                color={"success"}
                                className="btn btn-primary btn-block"
                                disabled={this.state.loading}
                            >
                                {this.state.loading && (
                                    <span className="spinner-border spinner-border-sm"/>
                                )}
                                <span>Adaugă anunțul</span>
                            </Button>
                        </div>

                        {this.state.message && (
                            <div className="form-group">
                                <div className="alert alert-danger" role="alert">
                                    {this.state.message}
                                </div>
                            </div>
                        )}
                        <CheckButton
                            style={{ display: "none" }}
                            ref={c => {
                                this.checkBtn = c;
                            }}
                        />
                    </Form>
                </div>
            </div>
        );
    }
}