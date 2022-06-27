import React, { Component } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import Select from 'react-select';

import authHeader from '../../services/auth-header';
import {Button} from "reactstrap";
import axios from "axios";
import AuthService from "../../services/auth.service";
import UploadFilesService from "../../services/upload-files.service";

const required = value => {
    if (!value) {
        return (
            <div className="alert alert-danger" role="alert">
                Acest câmp este obligatoriu!
            </div>
        );
    }
};

const vColor = value => {
    const re = new RegExp("^[a-z]{3,10}$");

    if(!re.test(value)) {
        return (
            <div className="alert alert-warning" role="alert">
                Culoarea trebuie să aibă între 3 și 10 litere.
            </div>
        );
    }
}

const vYear = value => {
    const year = Number(value);

    if(year < 1950 || year > (new Date()).getFullYear()) {
        return (
            <div className="alert alert-warning" role="alert">
                Anul fabricației nu poate fi mai mic decât 1950 sau mai mare decât anul curent.
            </div>
        );
    }
}

const vCountry = value => {
    const re = new RegExp("^[A-Z][A-Za-z-\\s]{4,20}$");

    if(!re.test(value)) {
        return (
            <div className="alert alert-warning" role="alert">
                Numele țării de origine trebuie să aibă între 4 și 20 de caractere și să înceapă cu majusculă.
            </div>
        );
    }
}

const vEngine = value => {
    const engine = Number(value);

    if(engine < 100 || engine > 20000) {
        return (
            <div className="alert alert-warning" role="alert">
                Valoare invalidă pentru capacitatea motorului.
            </div>
        );
    }
}

const vPower = value => {
    const power = Number(value);

    if(power < 10 || power > 2000) {
        return (
            <div className="alert alert-warning" role="alert">
                Valoare invalidă pentru puterea motorului.
            </div>
        );
    }
}

const vKilometers = value => {
    const kilometers = Number(value);

    if(kilometers < 0) {
        return (
            <div className="alert alert-warning" role="alert">
                Numărul de kilometri nu poate fi negativ.
            </div>
        );
    }
}

const vGears = value => {
    const gears = Number(value);

    if(gears < 4 || gears > 8) {
        return (
            <div className="alert alert-warning" role="alert">
                Numărul de trepte de viteză nu poate fi mai mic decât 4 sau mai mare decât 8.
            </div>
        );
    }
}

const vConsumption = value => {
    const consumption = Number(value);

    if(consumption < 0) {
        return (
            <div className="alert alert-warning" role="alert">
                Consumul nu poate fi negativ.
            </div>
        );
    }
}

const vSeats = value => {
    const seats = Number(value);

    if(seats < 1 || seats > 50) {
        return (
            <div className="alert alert-warning" role="alert">
                Numărul de locuri este invalid.
            </div>
        );
    }
}

const vAirbags = value => {
    const airbags = Number(value);

    if(airbags < 0 || airbags > 6) {
        return (
            <div className="alert alert-warning" role="alert">
                Numărul de airbag-uri nu poate fi negativ sau mai mare decât 6.
            </div>
        );
    }
}

const vPrice = value => {
    const price = Number(value);

    if(price < 0) {
        return (
            <div className="alert alert-warning" role="alert">
                Prețul nu poate fi negativ.
            </div>
        );
    }
}

export default class EditRentalAnnouncement extends Component {

    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.onChangeBrand = this.onChangeBrand.bind(this);
        this.onChangeModel = this.onChangeModel.bind(this);
        this.onChangeCategory = this.onChangeCategory.bind(this);
        this.onChangeColor = this.onChangeColor.bind(this);
        this.onChangeYear = this.onChangeYear.bind(this);
        this.onChangeCountry = this.onChangeCountry.bind(this);
        this.onChangeEngine = this.onChangeEngine.bind(this);
        this.onChangePower = this.onChangePower.bind(this);
        this.onChangeKilometers = this.onChangeKilometers.bind(this);
        this.onChangeTransmission = this.onChangeTransmission.bind(this);
        this.onChangeGearbox = this.onChangeGearbox.bind(this);
        this.onChangeGears = this.onChangeGears.bind(this);
        this.onChangeFuelType = this.onChangeFuelType.bind(this);
        this.onChangeConsumption = this.onChangeConsumption.bind(this);
        this.onChangeEmissionStandard = this.onChangeEmissionStandard.bind(this);
        this.onChangeSeats = this.onChangeSeats.bind(this);
        this.onChangeAc = this.onChangeAc.bind(this);
        this.onChangeAirbags = this.onChangeAirbags.bind(this);
        this.onChangePrice = this.onChangePrice.bind(this);

        // upload
        this.selectFiles = this.selectFiles.bind(this);
        this.upload = this.upload.bind(this);
        this.uploadFiles = this.uploadFiles.bind(this);

        this.currentUser = AuthService.getCurrentUser();

        this.state = {
            rentalAnnouncement: null,
            images: [],
            deletedImages: [],
            carBrands: [],
            currentBrand: "",
            carModels: {},
            carModelsInfo: {},
            currentModels: [],
            carCategories: {},
            currentCategories: [],
            brand: sessionStorage.getItem("carBrandEdit"),
            model: sessionStorage.getItem("carModelEdit"),
            category: sessionStorage.getItem("carCategoryEdit"),
            color: sessionStorage.getItem("carColorEdit"),
            year: sessionStorage.getItem("carYearEdit"),
            country: sessionStorage.getItem("carCountryEdit"),
            engine: Number(sessionStorage.getItem("carEngineEdit")),
            power: Number(sessionStorage.getItem("carPowerEdit")),
            kilometers: Number(sessionStorage.getItem("carKilometersEdit")),
            transmission: sessionStorage.getItem("carTransmissionEdit"),
            gearbox: sessionStorage.getItem("carGearboxEdit"),
            gears: Number(sessionStorage.getItem("carGearsEdit")),
            fuelType: sessionStorage.getItem("carFuelTypeEdit"),
            consumption: Number(sessionStorage.getItem("carConsumptionEdit")),
            emissionStandard: sessionStorage.getItem("carEmissionStandardEdit"),
            seats: Number(sessionStorage.getItem("carSeatsEdit")),
            ac: sessionStorage.getItem("carAcEdit"),
            airbags: Number(sessionStorage.getItem("carAirbagsEdit")),
            price: Number(sessionStorage.getItem("carPriceEdit")),
            loading: true,
            // upload
            selectedFiles: undefined,
            progressInfos: [],
            message: [],
            fileInfos: []
        }

        sessionStorage.setItem("carBrandEdit", "");
        sessionStorage.setItem("carModelEdit", "");
        sessionStorage.setItem("carCategoryEdit", "");
        sessionStorage.setItem("carColorEdit", "");
        sessionStorage.setItem("carYearEdit", "");
        sessionStorage.setItem("carCountryEdit", "");
        sessionStorage.setItem("carEngineEdit", "0");
        sessionStorage.setItem("carPowerEdit", "0");
        sessionStorage.setItem("carKilometersEdit", "0");
        sessionStorage.setItem("carTransmissionEdit", "");
        sessionStorage.setItem("carGearboxEdit", "");
        sessionStorage.setItem("carGearsEdit", "0");
        sessionStorage.setItem("carFuelTypeEdit", "");
        sessionStorage.setItem("carConsumptionEdit", "0.0");
        sessionStorage.setItem("carEmissionStandardEdit", "");
        sessionStorage.setItem("carSeatsEdit", "0");
        sessionStorage.setItem("carAcEdit", "");
        sessionStorage.setItem("carAirbagsEdit", "0");
        sessionStorage.setItem("carPriceEdit", "0");
    }

    componentDidMount() {
        document.title = "Editează anunțul de închiriere"

        this.setState({loading: true});

        fetch(`http://localhost:8090/api/rentalAnnouncements/${this.props.match.params.id}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => response.json())
            .then((data) => {
                this.setState({rentalAnnouncement: data, images: data["car"]["images"]});

                if(this.state.brand === null || this.state.brand === "") {
                    this.setState({brand: data["car"]["model"]["manufacturer"]});
                }
                if(this.state.model === null || this.state.model === "") {
                    this.setState({model: data["car"]["model"]["model"]});
                }
                if(this.state.category === null || this.state.category === "") {
                    this.setState({category: data["car"]["model"]["category"]});
                }
                if(this.state.color === null || this.state.color === "") {
                    this.setState({color: data["car"]["color"]});
                }
                if(this.state.year === null || this.state.year === "" || this.state.year === 0) {
                    this.setState({year: data["car"]["year"]});
                }
                if(this.state.country === null || this.state.country === "") {
                    this.setState({country: data["car"]["country"]});
                }
                if(this.state.engine === null || this.state.engine === "" || this.state.engine === 0) {
                    this.setState({engine: data["car"]["engine"]});
                }
                if(this.state.power === null || this.state.power === "" || this.state.power === 0) {
                    this.setState({power: data["car"]["power"]});
                }
                if(this.state.kilometers === null || this.state.kilometers === "" || this.state.kilometers === 0) {
                    this.setState({kilometers: data["car"]["kilometers"]});
                }
                if(this.state.transmission === null || this.state.transmission === "") {
                    this.setState({transmission: data["car"]["transmission"]});
                }
                if(this.state.gearbox === null || this.state.gearbox === "" ) {
                    this.setState({gearbox: data["car"]["gearbox"]});
                }
                if(this.state.gears === null || this.state.gears === "" || this.state.gears === 0) {
                    this.setState({gears: data["car"]["gears"]});
                }
                if(this.state.fuelType === null || this.state.fuelType === "") {
                    this.setState({fuelType: data["car"]["fuelType"]});
                }
                if(this.state.consumption === null || this.state.consumption === "" || this.state.consumption === 0) {
                    this.setState({consumption: data["car"]["consumption"]});
                }
                if(this.state.emissionStandard === null || this.state.emissionStandard === "") {
                    this.setState({emissionStandard: data["car"]["emissionStandard"]});
                }
                if(this.state.seats === null || this.state.seats === "" || this.state.seats === 0) {
                    this.setState({seats: data["car"]["seats"]});
                }
                if(this.state.ac === null || this.state.ac === "") {
                    this.setState({ac: data["car"]["ac"] ? "DA" : "NU"});
                }
                if(this.state.airbags === null || this.state.airbags === "" || this.state.airbags === 0) {
                    this.setState({airbags: data["car"]["airbags"]});
                }
                if(this.state.price === null || this.state.price === "" || this.state.price === 0) {
                    this.setState({price: data["car"]["price"]});
                }
            })

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

        fetch("http://localhost:8090/api/carModels", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => response.json())
            .then((data) => {
                this.setState({carModelsInfo: data, loading: false});
            })
            .catch((error) => console.log(error));

        // this.setState({loading: false});
    }

    onChangeBrand(e) {
        const carModels = this.state.carModels[e.value];
        const models = [];
        for(let cm in carModels) {
            models.push({"value": carModels[cm], "label": carModels[cm]});
        }

        this.setState({
            currentBrand: e.value,
            currentModels: models,
            brand: e.value,
            model: null,
            category: null
        });
    }

    onChangeModel(e) {
        const carCategories = this.state.carCategories[this.state.currentBrand + "_" + e.value];
        const categories = [];
        for(let cc in carCategories) {
            categories.push({"value": carCategories[cc], "label": carCategories[cc]});
        }

        this.setState({
            currentCategories: categories,
            model: e.value,
            category: null
        });
    }

    onChangeCategory(e) {
        this.setState({category: e.value});
    }

    onChangeColor(e) {
        this.setState({color: e.target.value});
    }

    onChangeYear(e) {
        this.setState({year: e.target.value});
    }

    onChangeCountry(e) {
        this.setState({country: e.target.value});
    }

    onChangeEngine(e) {
        this.setState({engine: e.target.value});
    }

    onChangePower(e) {
        this.setState({power: e.target.value});
    }

    onChangeKilometers(e) {
        this.setState({kilometers: e.target.value});
    }

    onChangeTransmission(e) {
        this.setState({transmission: e.value});
    }

    onChangeGearbox(e) {
        this.setState({gearbox: e.value});
    }

    onChangeGears(e) {
        this.setState({gears: e.target.value});
    }

    onChangeFuelType(e) {
        this.setState({fuelType: e.value});
    }

    onChangeConsumption(e) {
        this.setState({consumption: e.target.value});
    }

    onChangeEmissionStandard(e) {
        this.setState({emissionStandard: e.value});
    }

    onChangeSeats(e) {
        this.setState({seats: e.target.value});
    }

    onChangeAc(e) {
        this.setState({ac: e.value});
    }

    onChangeAirbags(e) {
        this.setState({airbags: e.target.value});
    }

    onChangePrice(e) {
        this.setState({price: e.target.value});
    }

    isOwner(user, announcement) {
        return user !== null && user["id"] === announcement["rentalCenter"]["organisation"]["owner"]["id"];
    }

    async handleSubmit(e) {
        e.preventDefault();

        this.setState({
            message: "",
            loading: true
        })

        this.form.validateAll();

        if(this.checkBtn.context._errors.length === 0) {

            let modelId = 0;
            const info = this.state.carModelsInfo;
            for(let i in info) {

                if(info[i]["manufacturer"] === this.state.brand && info[i]["model"] === this.state.model
                    && info[i]["category"] === this.state.category) {

                    modelId = info[i]["id"];
                    break;
                }
            }

            const carDto = {};
            carDto["car_model_id"] = modelId;
            carDto["price"] = Number(this.state.price);
            carDto["color"] = this.state.color;
            carDto["year"] = Number(this.state.year);
            carDto["country"] = this.state.country;
            carDto["kilometers"] = Number(this.state.kilometers);
            carDto["engine"] = Number(this.state.engine);
            carDto["power"] = Number(this.state.power);
            carDto["gearbox"] = this.state.gearbox;
            carDto["gears"] = Number(this.state.gears);
            carDto["transmission"] = this.state.transmission;
            carDto["fuel_type"] = this.state.fuelType;
            carDto["consumption"] = Number(this.state.consumption);
            carDto["ac"] = this.state.ac === "DA";
            carDto["airbags"] = Number(this.state.airbags);
            carDto["emission_standard"] = this.state.emissionStandard;
            carDto["seats"] = Number(this.state.seats);

            let carId = 0;
            await axios.put(`http://localhost:8090/api/rentalAnnouncements/edit/${this.props.match.params.id}`, carDto, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: authHeader().Authorization
                }
            })
                .then((response) => carId = response["data"])
                .catch((error) => {
                    this.props.history.push(`/rentalAnnouncements/edit/${this.props.match.params.id}`);
                    window.location.reload();

                    sessionStorage.setItem("rentalAnnouncementEditMessage", error.response.data);

                    sessionStorage.setItem("carBrand", this.state.brand);
                    sessionStorage.setItem("carModel", this.state.model);
                    sessionStorage.setItem("carCategory", this.state.category);
                    sessionStorage.setItem("carColor", this.state.color);
                    sessionStorage.setItem("carYear", this.state.year);
                    sessionStorage.setItem("carCountry", this.state.country);
                    sessionStorage.setItem("carEngine", this.state.engine);
                    sessionStorage.setItem("carPower", this.state.power);
                    sessionStorage.setItem("carKilometers", this.state.kilometers);
                    sessionStorage.setItem("carTransmission", this.state.transmission);
                    sessionStorage.setItem("carGearbox", this.state.gearbox);
                    sessionStorage.setItem("carGears", this.state.gears);
                    sessionStorage.setItem("carFuelType", this.state.fuelType);
                    sessionStorage.setItem("carConsumption", this.state.consumption);
                    sessionStorage.setItem("carEmissionStandard", this.state.emissionStandard);
                    sessionStorage.setItem("carSeats", this.state.seats);
                    sessionStorage.setItem("carAc", this.state.ac);
                    sessionStorage.setItem("carAirbags", this.state.airbags);
                    sessionStorage.setItem("carPrice", this.state.price);
                });

            try {
                if(this.state.selectedFiles !== undefined && this.state.selectedFiles.length > 0) {
                    this.uploadFiles(carId);
                }
                for(let i in this.state.deletedImages) {
                    await this.removeImage(this.state.deletedImages[i], this.state.rentalAnnouncement["car"]["id"]);
                }

                localStorage.setItem("infoMessage", "Anunțul a fost editat cu succes! Acesta a fost trims spre aprobare!");
                this.props.history.push("/myRentalAnnouncements");
                window.location.reload();
            } catch(error) {
                sessionStorage.setItem("rentalAnnouncementEditMessage", error);

                sessionStorage.setItem("carBrand", this.state.brand);
                sessionStorage.setItem("carModel", this.state.model);
                sessionStorage.setItem("carCategory", this.state.category);
                sessionStorage.setItem("carColor", this.state.color);
                sessionStorage.setItem("carYear", this.state.year);
                sessionStorage.setItem("carCountry", this.state.country);
                sessionStorage.setItem("carEngine", this.state.engine);
                sessionStorage.setItem("carPower", this.state.power);
                sessionStorage.setItem("carKilometers", this.state.kilometers);
                sessionStorage.setItem("carTransmission", this.state.transmission);
                sessionStorage.setItem("carGearbox", this.state.gearbox);
                sessionStorage.setItem("carGears", this.state.gears);
                sessionStorage.setItem("carFuelType", this.state.fuelType);
                sessionStorage.setItem("carConsumption", this.state.consumption);
                sessionStorage.setItem("carEmissionStandard", this.state.emissionStandard);
                sessionStorage.setItem("carSeats", this.state.seats);
                sessionStorage.setItem("carAc", this.state.ac);
                sessionStorage.setItem("carAirbags", this.state.airbags);
                sessionStorage.setItem("carPrice", this.state.price);

                this.props.history.push(`/rentalAnnouncements/edit/${this.props.match.params.id}`);
                window.location.reload();
            }
        } else {
            this.setState({
                loading: false
            });
        }
    }

    async removeImage(imageId, carId) {

        const id = imageId + "_" + carId;

        await axios.delete(`http://localhost:8090/api/images/delete/${id}`, {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            },
        }).then(() => console.log("Imaginea " + imageId + " a fost ștearsă cu succes!"));
    }

    hideAlert() {
        const notification = document.getElementById("notification");
        notification.style.display = "none";
        sessionStorage.setItem("rentalAnnouncementEditMessage", "");
    }

    selectFiles(event) {
        this.setState({
            progressInfos: [],
            selectedFiles: event.target.files,
        });
    }

    upload(idx, carId, file) {
        let _progressInfos = [...this.state.progressInfos];

        UploadFilesService.upload(file, carId, (event) => {
            _progressInfos[idx].percentage = Math.round((100 * event.loaded) / event.total);
            this.setState({
                _progressInfos,
            });
        })
            .then((response) => {
                this.setState((prev) => {
                    let nextMessage = [...prev.message, "Imaginea fost încărcată cu succes: " + file.name];
                    return {
                        message: nextMessage
                    };
                });

                // return UploadFilesService.getFiles();
            })
            .then((files) => {
                this.setState({
                    fileInfos: files.data,
                });
            })
            .catch(() => {
                _progressInfos[idx].percentage = 0;
                this.setState((prev) => {
                    let nextMessage = [...prev.message, "Imaginea nu a putut fi încărcată: " + file.name];
                    return {
                        progressInfos: _progressInfos,
                        message: nextMessage
                    };
                });
            });
    }

    uploadFiles(carId) {
        const selectedFiles = this.state.selectedFiles;

        let _progressInfos = [];

        for (let i = 0; i < selectedFiles.length; i++) {
            _progressInfos.push({ percentage: 0, fileName: selectedFiles[i].name });
        }

        this.setState(
            {
                progressInfos: _progressInfos,
                message: [],
            },
            () => {
                for (let i = 0; i < selectedFiles.length; i++) {
                    this.upload(i, carId, selectedFiles[i]);
                }
            }
        );
    }

    deleteImage(imageId) {
        this.setState({loading: true});
        this.state.deletedImages.push(imageId);
        this.setState({loading: false});
    }

    render() {

        const loading = this.state.loading;
        if(loading) {
            return (
                <h1>Se încarcă...</h1>
            );
        }

        const rentalAnnouncement = this.state.rentalAnnouncement;
        if (!this.isOwner(this.currentUser, rentalAnnouncement)) {
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

        const progressInfos = this.state.progressInfos;
        const message = this.state.message;

        return (
            <div className={"col-md-12"}>
                <div>
                    {sessionStorage.getItem("rentalAnnouncementEditMessage") !== null && sessionStorage.getItem("rentalAnnouncementEditMessage") !== "" && (
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
                            {sessionStorage.getItem("rentalAnnouncementEditMessage")}
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
                                    value={this.state.brand !== null && this.state.brand !== "" ? {label: this.state.brand} : ""}
                                    placeholder={"Alege brand-ul mașinii..."}
                                    options={brands}
                                    onChange={this.onChangeBrand} />
                            </div>

                            <div style={{width: "5%"}} />

                            <div className={"column"} style={{width: "30%"}}>
                                <label htmlFor={"model"}>Modelul mașinii</label>
                                <Select
                                    name={"model"}
                                    value={this.state.model !== null && this.state.model !== "" ? {label: this.state.model} : ""}
                                    placeholder={"Alege modelul mașinii..."}
                                    options={this.state.currentModels}
                                    onChange={this.onChangeModel} />
                            </div>

                            <div style={{width: "5%"}} />

                            <div className={"column"} style={{width: "30%"}}>
                                <label htmlFor={"category"}>Categoria mașinii</label>
                                <Select
                                    name={"category"}
                                    value={this.state.category !== null && this.state.category !== "" ? {label: this.state.category} : ""}
                                    placeholder={"Alege categoria mașinii..."}
                                    options={this.state.currentCategories}
                                    onChange={this.onChangeCategory}
                                />
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
                                    onChange={this.onChangeColor}
                                    validations={[required, vColor]}
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
                                    onChange={this.onChangeYear}
                                    validations={[required, vYear]}
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
                                    onChange={this.onChangeCountry}
                                    validations={[required, vCountry]}
                                />
                            </div>
                        </div>

                        <br/>

                        <div className={"row"}>
                            <div className={"column"} style={{width: "30%"}}>
                                <label htmlFor={"engine"}>Capacitatea motorului (cm<sup>3</sup>)</label>
                                <Input
                                    type={"number"}
                                    className={"form-control"}
                                    name={"engine"}
                                    min={100}
                                    max={20000}
                                    value={this.state.engine}
                                    onChange={this.onChangeEngine}
                                    validations={[required, vEngine]}
                                />
                            </div>

                            <div style={{width: "5%"}}/>

                            <div className={"column"} style={{width: "30%"}}>
                                <label htmlFor={"power"}>Putere</label>
                                <Input
                                    type={"number"}
                                    className={"form-control"}
                                    name={"power"}
                                    min={10}
                                    max={2000}
                                    value={this.state.power}
                                    onChange={this.onChangePower}
                                    validations={[required, vPower]}
                                />
                            </div>

                            <div style={{width: "5%"}}/>

                            <div className={"column"} style={{width: "30%"}}>
                                <label htmlFor={"kilometers"}>Număr de kilometri</label>
                                <Input
                                    type={"number"}
                                    min={0}
                                    className={"form-control"}
                                    name={"kilometers"}
                                    value={this.state.kilometers}
                                    onChange={this.onChangeKilometers}
                                    validations={[required, vKilometers]}
                                />
                            </div>
                        </div>

                        <br/>

                        <div className={"row"}>
                            <div className={"column"} style={{width: "30%"}}>
                                <label htmlFor={"transmission"}>Transmisie</label>
                                <Select
                                    name={"transmission"}
                                    value={this.state.transmission !== null && this.state.transmission !== "" ? {label: this.state.transmission}: ""}
                                    placeholder={"Alege tipul transmisiei..."}
                                    options={transmissions}
                                    onChange={this.onChangeTransmission} />
                            </div>

                            <div style={{width: "5%"}}/>

                            <div className={"column"} style={{width: "30%"}}>
                                <label htmlFor={"gearbox"}>Cutia de viteze</label>
                                <Select
                                    name={"gearbox"}
                                    value={this.state.gearbox !== null && this.state.gearbox !== "" ? {label: this.state.gearbox} : ""}
                                    placeholder={"Alege tipul cutiei de viteze..."}
                                    options={gearboxes}
                                    onChange={this.onChangeGearbox} />
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
                                    onChange={this.onChangeGears}
                                    validations={[required, vGears]}
                                />
                            </div>
                        </div>

                        <br/>

                        <div className={"row"}>
                            <div className={"column"} style={{width: "30%"}}>
                                <label htmlFor={"fuelType"}>Combustibil</label>
                                <Select
                                    name={"fuelType"}
                                    value={this.state.fuelType !== null && this.state.fuelType !== "" ? {label: this.state.fuelType} : ""}
                                    placeholder={"Alege tipul de combustibil..."}
                                    options={fuelTypes}
                                    onChange={this.onChangeFuelType} />
                            </div>

                            <div style={{width: "5%"}}/>

                            <div className={"column"} style={{width: "30%"}}>
                                <label htmlFor={"consumption"}>Consum (litri / 100 km)</label>
                                <Input
                                    type={"number"}
                                    className={"form-control"}
                                    name={"consumption"}
                                    min={0.0}
                                    step={0.1}
                                    value={this.state.consumption}
                                    onChange={this.onChangeConsumption}
                                    validations={[required, vConsumption]}
                                />
                            </div>

                            <div style={{width: "5%"}}/>

                            <div className={"column"} style={{width: "30%"}}>
                                <label htmlFor={"emissionStandard"}>Norma de poluare</label>
                                <Select
                                    name={"emissionStandard"}
                                    value={this.state.emissionStandard !== null && this.state.emissionStandard !== "" ? {label: this.state.emissionStandard} : ""}
                                    placeholder={"Alege norma de poluare..."}
                                    options={emissionStandards}
                                    onChange={this.onChangeEmissionStandard} />
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
                                    onChange={this.onChangeSeats}
                                    validations={[required, vSeats]}
                                />
                            </div>

                            <div style={{width: "5%"}}/>

                            <div className={"column"} style={{width: "30%"}}>
                                <label htmlFor={"ac"}>Aer condiționat / climatronic</label>
                                <Select
                                    name={"ac"}
                                    value={this.state.ac !== null && this.state.ac !== "" ? {label: this.state.ac} : ""}
                                    placeholder={"Alege o variantă..."}
                                    options={[{"label": "DA", "value": "DA"}, {"label": "NU", "value": "NU"}]}
                                    onChange={this.onChangeAc} />
                            </div>

                            <div style={{width: "5%"}}/>

                            <div className={"column"} style={{width: "30%"}}>
                                <label htmlFor={"airbags"}>Număr airbag-uri</label>
                                <Input
                                    type={"number"}
                                    min={0}
                                    max={6}
                                    className={"form-control"}
                                    name={"airbags"}
                                    value={this.state.airbags}
                                    onChange={this.onChangeAirbags}
                                    validations={[required, vAirbags]}
                                />
                            </div>
                        </div>

                        <br/>

                        <div className={"row"}>
                            <div className={"column"} style={{width: "30%"}}>
                                <label htmlFor={"price"}>Preț</label>
                                <Input
                                    type={"number"}
                                    className={"form-control"}
                                    name={"price"}
                                    min={0}
                                    value={this.state.price}
                                    onChange={this.onChangePrice}
                                    validations={[required, vPrice]}
                                />
                            </div>

                            <div className={"column"} style={{width: "70%"}} />
                        </div>

                        <br/>

                        <h3>Imaginile încărcate:</h3>

                        <div className={"row"}>
                            {this.state.images
                                .filter((pic) => !this.state.deletedImages.includes(pic["id"]))
                                .map((pic) => {
                                    return (
                                        <div className={"column"} style={{marginRight: "10px", marginBottom: "10px"}}>
                                            <img
                                                src={`${process.env.PUBLIC_URL}/assets/images/${pic["name"]}`}
                                                width="200px"
                                                height="120px"
                                                alt=":(("
                                            />
                                            <Button onClick={() => this.deleteImage(pic["id"])}
                                                    style={{color: "black", backgroundColor: "#cccccc", borderColor: "#cccccc", height: "30px", paddingTop: "0px", borderRadius: "50%", marginTop: "0px", marginBottom: "90px"}} >
                                                X
                                            </Button>
                                        </div>
                                    );
                                })
                            }
                        </div>

                        <br/>

                        <h3>Adaugă imagini cu automobilul</h3>

                        <div>
                            {progressInfos &&
                                progressInfos.map((progressInfo, index) => (
                                    <div className="mb-2" key={index}>
                                        <span>{progressInfo.fileName}</span>
                                        <div className="progress">
                                            <div
                                                className="progress-bar progress-bar-info"
                                                role="progressbar"
                                                aria-valuenow={progressInfo.percentage}
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                                style={{ width: progressInfo.percentage + "%" }}
                                            >
                                                {progressInfo.percentage}%
                                            </div>
                                        </div>
                                    </div>
                                ))}

                            <div className="row my-3">
                                <div className="col-4">
                                    <label className="btn btn-default p-0">
                                        <input type="file" multiple onChange={this.selectFiles} />
                                    </label>
                                </div>
                            </div>

                            {message.length > 0 && (
                                <div className="alert alert-secondary" role="alert">
                                    <ul>
                                        {message.map((item, i) => {
                                            return <li key={i}>{item}</li>;
                                        })}
                                    </ul>
                                </div>
                            )}
                        </div>

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
                                <span>Editează anunțul</span>
                            </Button>
                        </div>

                        {this.state.message !== null && this.state.message !== "" && this.state.message.size > 0 && (
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