import React, {Component} from "react";
import Form from "react-validation/build/form";
import AuthService from "../../services/auth.service";
import authHeader from "../../services/auth-header";
import Input from "react-validation/build/input";
import * as BiIcons from "react-icons/bi";
import DatePicker from "react-datepicker";
import ro from "date-fns/locale/ro";
import {Button} from "reactstrap";
import CheckButton from "react-validation/build/button";
import {isEmail} from "validator";
import {setHours, setMinutes} from "date-fns";
import axios from "axios";
import * as MdIcons from "react-icons/md";
import * as GiIcons from "react-icons/gi";
import * as BsIcons from "react-icons/bs";

const required = value => {
    if (!value) {
        return (
            <div className="alert alert-danger" role="alert">
                Acest câmp este obligatoriu!
            </div>
        );
    }
};

const vName = value => {
    if(value === null || value.trim().length < 3 || value.trim().length > 50) {
        return (
            <div className="alert alert-danger" role="alert">
                Numele trebuie să aibă între 3 și 50 de caractere!
            </div>
        );
    }
}

const vCity = value => {
    if(value === null || value.trim().length < 4 || value.trim().length > 50) {
        return (
            <div className="alert alert-danger" role="alert">
                Orașul trebuie să aibă între 4 și 50 de caractere!
            </div>
        );
    }
}

const vAddress = value => {
    if(value === null || value.trim().length < 10 || value.trim().length > 100) {
        return (
            <div className="alert alert-danger" role="alert">
                Adresa trebuie să aibă între 10 și 100 de caractere!
            </div>
        );
    }
}

const vEmail = value => {
    if (!isEmail(value)) {
        return (
            <div className="alert alert-danger" role="alert">
                Acesta nu este un email valid.
            </div>
        );
    }
};

const vPhone = value => {
    if(value.length !== 10) {
        return (
            <div className="alert alert-danger" role="alert">
                Numărul de telefon trebuie să aibă 10 cifre!
            </div>
        );
    } else if(value[0] !== '0' || value[1] !== '7') {
        return (
            <div className="alert alert-danger" role="alert">
                Numărul de telefon trebuie să înceapă cu "07"!
            </div>
        );
    }
};

const vNumberOfStations = value => {
    if(value === null || Number(value) <= 0) {
        return (
            <div className="alert alert-danger" role="alert">
                Numărul de stații de lucru trebuie să fie un număr pozitiv!
            </div>
        );
    }
}

export default class EditAutoService extends Component {

    emptyAutoService = {
        name: "",
        city: "",
        address: "",
        number_of_stations: 1,
        start_hour: "",
        end_hour: "",
        email: "",
        phone: ""
    };

    constructor(props) {
        super(props);

        this.state = {
            autoService: null,
            organisation: null,
            name: "",
            city: "",
            address: "",
            number_of_stations: 1,
            start_hour: "",
            end_hour: "",
            email: "",
            phone: "",
            loading: true,
            message: ""
        };

        this.currentUser = AuthService.getCurrentUser();

        this.onChangeName = this.onChangeName.bind(this);
        this.onChangeCity = this.onChangeCity.bind(this);
        this.onChangeAddress = this.onChangeAddress.bind(this);
        this.onChangeNumberOfStations = this.onChangeNumberOfStations.bind(this);
        this.onChangeStartHour = this.onChangeStartHour.bind(this);
        this.onChangeEndHour = this.onChangeEndHour.bind(this);
        this.onChangeEmail = this.onChangeEmail.bind(this);
        this.onChangePhone = this.onChangePhone.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        document.title = "Editare service auto";
        this.setState({loading: true});

        fetch("http://localhost:8090/api/organisations/myOrganisation", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => response.json())
            .then((data) => {
                this.setState({organisation: data, loading: true});
            });

        fetch(`http://localhost:8090/api/autoServices/${this.props.match.params.id}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => response.json())
            .then((data) => {
                this.setState({autoService: data, loading: true});

                let editName = sessionStorage.getItem("autoServiceNameEdit");
                if(editName !== null && editName !== "") {
                    this.setState({name: editName});
                } else {
                    this.setState({name: data["name"]});
                }

                let editCity = sessionStorage.getItem("autoServiceCityEdit");
                if(editCity !== null && editCity !== "") {
                    this.setState({city: editCity});
                } else {
                    this.setState({city: data["city"]});
                }

                let editAddress = sessionStorage.getItem("autoServiceAddressEdit");
                if(editAddress !== null && editAddress !== "") {
                    this.setState({address: editAddress});
                } else {
                    this.setState({address: data["address"]});
                }

                let editNumberOfStations = sessionStorage.getItem("autoServiceNumberOfStationsEdit");
                if(editNumberOfStations !== null && editNumberOfStations !== "") {
                    this.setState({number_of_stations: Number(editNumberOfStations)});
                } else {
                    this.setState({number_of_stations: data["numberOfStations"]});
                }

                let editStartHour = sessionStorage.getItem("autoServiceStartHourEdit");
                if(editStartHour !== null && editStartHour !== "") {
                    this.setState({start_hour: new Date(editStartHour)});
                } else {
                    const hour = data["startHour"].toString().substring(0, 2);
                    const minutes = data["startHour"].toString().substring(3, 5);
                    this.setState({start_hour: setHours(setMinutes(new Date(), minutes), hour)});
                }

                let editEndHour = sessionStorage.getItem("autoServiceEndHourEdit");
                if(editEndHour !== null && editEndHour !== "") {
                    this.setState({end_hour: new Date(editEndHour)});
                } else {
                    const hour = data["endHour"].toString().substring(0, 2);
                    const minutes = data["endHour"].toString().substring(3, 5);
                    this.setState({end_hour: setHours(setMinutes(new Date(), minutes), hour)});
                }

                let editEmail = sessionStorage.getItem("autoServiceEmailEdit");
                if(editEmail !== null && editEmail !== "") {
                    this.setState({email: editEmail});
                } else {
                    this.setState({email: data["email"]});
                }

                let editPhone = sessionStorage.getItem("autoServicePhoneEdit");
                if(editPhone !== null && editPhone !== "") {
                    this.setState({phone: editPhone});
                } else {
                    this.setState({phone: data["phone"]});
                }

                this.setState({loading: false});

                sessionStorage.setItem("autoServiceNameEdit", "");
                sessionStorage.setItem("autoServiceCityEdit", "");
                sessionStorage.setItem("autoServiceAddressEdit", "");
                sessionStorage.setItem("autoServiceNumberOfStationsEdit", "");
                sessionStorage.setItem("autoServiceStartHourEdit", "");
                sessionStorage.setItem("autoServiceEndHourEdit", "");
                sessionStorage.setItem("autoServiceEmailEdit", "");
                sessionStorage.setItem("autoServicePhoneEdit", "");
            })
    }

    async handleSubmit(e) {
        e.preventDefault();

        this.setState({
            loading: true,
            message: ""
        });

        this.form.validateAll();

        if(this.checkBtn.context._errors.length === 0) {

            const newAutoService = this.emptyAutoService;
            newAutoService["name"] = this.state.name.trim();
            newAutoService["city"] = this.state.city.trim();
            newAutoService["address"] = this.state.address.trim();
            newAutoService["number_of_stations"] = this.state.number_of_stations;

            let hour = this.state.start_hour.getHours() < 10 ? "0" + this.state.start_hour.getHours() : this.state.start_hour.getHours();
            let minutes = this.state.start_hour.getMinutes() < 10 ? "0" + this.state.start_hour.getMinutes() : this.state.start_hour.getMinutes();
            newAutoService["start_hour"] = hour + ":" + minutes;

            hour = this.state.end_hour.getHours() < 10 ? "0" + this.state.end_hour.getHours() : this.state.end_hour.getHours();
            minutes = this.state.end_hour.getMinutes() < 10 ? "0" + this.state.end_hour.getMinutes() : this.state.end_hour.getMinutes();
            newAutoService["end_hour"] = hour + ":" + minutes;

            newAutoService["email"] = this.state.email.trim();
            newAutoService["phone"] = this.state.phone.trim();

            await axios.put(`http://localhost:8090/api/autoServices/edit/${this.props.match.params.id}`, newAutoService, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: authHeader().Authorization
                }
            })
                .then(() => {
                    localStorage.setItem("infoMessage", "Service-ul auto a fost editat cu succes!");
                    this.props.history.push(`/autoServices/${this.props.match.params.id}`);
                })
                .catch((error) => {
                    this.props.history.push(`/autoServices/edit/${this.props.match.params.id}`);
                    window.location.reload();

                    sessionStorage.setItem("autoServiceEditMessage", error.response.data);
                    sessionStorage.setItem("autoServiceNameEdit", this.state.name);
                    sessionStorage.setItem("autoServiceCityEdit", this.state.city);
                    sessionStorage.setItem("autoServiceAddressEdit", this.state.address);
                    sessionStorage.setItem("autoServiceNumberOfStationsEdit", this.state.number_of_stations);
                    sessionStorage.setItem("autoServiceStartHourEdit", this.state.start_hour.toString());
                    sessionStorage.setItem("autoServiceEndHourEdit", this.state.end_hour.toString());
                    sessionStorage.setItem("autoServiceEmailEdit", this.state.email);
                    sessionStorage.setItem("autoServicePhoneEdit", this.state.phone);
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
        sessionStorage.setItem("autoServiceEditMessage", "");
    }

    hasAccess(user) {
        return user !== null && user.roles.includes("ROLE_ORGANISATION")
            && this.state.autoService.organisation === this.state.organisation.name;
    }

    onChangeName(e) {
        this.setState({
            name: e.target.value
        });
    }

    onChangeCity(e) {
        this.setState({
            city: e.target.value
        });
    }

    onChangeAddress(e) {
        this.setState({
            address: e.target.value
        });
    }

    onChangeNumberOfStations(e) {
        this.setState({
            number_of_stations: e.target.value
        });
    }

    onChangeStartHour(date) {
        this.setState({
            start_hour: date
        });
    }

    onChangeEndHour(date) {
        this.setState({
            end_hour: date
        });
    }

    onChangeEmail(e) {
        this.setState({
            email: e.target.value
        });
    }

    onChangePhone(e) {
        this.setState({
            phone: e.target.value
        });
    }

    filterStartDate = (time) => {

        const selectedDate = new Date(time);
        const minDateTime = setHours(setMinutes(new Date(selectedDate), 0), 7);
        const maxDateTime = setHours(setMinutes(new Date(selectedDate), 0), 12);

        return minDateTime <= selectedDate.getTime() && selectedDate.getTime() <= maxDateTime.getTime();
    }

    filterEndDate = (time) => {

        const selectedDate = new Date(time);
        let hour = 7;
        if(this.state.start_hour !== null && this.state.start_hour !== "") {
            hour = this.state.start_hour.getHours();
        } else {
            return false;
        }

        const minDateTime = setHours(setMinutes(new Date(selectedDate), 0), hour + 8);
        const maxDateTime = setHours(setMinutes(new Date(selectedDate), 0), 23);

        return minDateTime <= selectedDate.getTime() && selectedDate.getTime() <= maxDateTime.getTime();
    }

    render() {

        if(this.state.loading) {
            return (
                <h1>Se încarcă...</h1>
            );
        }

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

        return (
            <div className={"col-md-12"}>
                <div>
                    {sessionStorage.getItem("autoServiceEditMessage") !== null
                        && sessionStorage.getItem("autoServiceEditMessage") !== "" && (
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
                                {sessionStorage.getItem("autoServiceEditMessage")}
                            </div>
                        )
                    }
                </div>

                <h2 style={{alignSelf: "center"}}>Editare service auto</h2>

                <Form
                    onSubmit={this.handleSubmit}
                    ref={c => {
                        this.form = c;
                    }}
                >
                    <div className={"row"}>
                        <div className={"column"} style={{width: "45%"}}>
                            <div className={"form-group"}>
                                <label htmlFor={"name"}><BiIcons.BiRename /> Nume</label>
                                <Input
                                    type={"text"}
                                    className={"form-control"}
                                    name={"name"}
                                    value={this.state.name}
                                    onChange={this.onChangeName}
                                    validations={[required, vName]}
                                />
                            </div>
                        </div>

                        <div className={"column"} style={{width: "10%"}}/>

                        <div className={"column"} style={{width: "45%"}}>
                            <div className={"form-group"}>
                                <label htmlFor={"city"}><MdIcons.MdLocationCity/> Oraș</label>
                                <Input
                                    type={"text"}
                                    className={"form-control"}
                                    name={"city"}
                                    value={this.state.city}
                                    onChange={this.onChangeCity}
                                    validations={[required, vCity]}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={"row"}>
                        <div className={"column"} style={{width: "45%"}}>
                            <div className={"form-group"}>
                                <label htmlFor={"address"}><MdIcons.MdLocationOn/> Adresa</label>
                                <Input
                                    type={"text"}
                                    className={"form-control"}
                                    name={"address"}
                                    value={this.state.address}
                                    onChange={this.onChangeAddress}
                                    validations={[required, vAddress]}
                                />
                            </div>
                        </div>

                        <div className={"column"} style={{width: "10%"}} />

                        <div className={"column"} style={{width: "45%"}}>
                            <div className={"form-group"}>
                                <label htmlFor={"number_of_stations"}><GiIcons.GiMechanicGarage/> Numărul de stații de lucru</label>
                                <Input
                                    type={"number"}
                                    min={1}
                                    className={"form-control"}
                                    name={"number_of_stations"}
                                    value={this.state.number_of_stations}
                                    onChange={this.onChangeNumberOfStations}
                                    validations={[required, vNumberOfStations]}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={"row"}>
                        <div className={"column"} style={{width: "45%"}}>
                            <div className={"form-group"}>
                                <label htmlFor={"start_hour"}><MdIcons.MdOutlineAccessTimeFilled/> Ora de început a programului</label>
                                <DatePicker
                                    name={"start_hour"}
                                    selected={this.state.start_hour}
                                    onChange={this.onChangeStartHour}
                                    placeholderText={"Alegeți ora de început..."}
                                    locale={ro}
                                    showTimeSelect
                                    showTimeSelectOnly
                                    timeIntervals={60}
                                    timeCaption="Ora"
                                    dateFormat="HH:mm"
                                    validations={[required]}
                                    filterTime={this.filterStartDate}
                                />
                            </div>
                        </div>

                        <div className={"column"} style={{width: "10%"}} />

                        <div className={"column"} style={{width: "45%"}}>
                            <div className={"form-group"}>
                                <label htmlFor={"end_hour"}><MdIcons.MdOutlineAccessTimeFilled/> Ora de sfârșit a programului</label>
                                <DatePicker
                                    name={"end_hour"}
                                    selected={this.state.end_hour}
                                    onChange={this.onChangeEndHour}
                                    placeholderText={"Alegeți ora de sfârșit..."}
                                    locale={ro}
                                    showTimeSelect
                                    showTimeSelectOnly
                                    timeIntervals={60}
                                    timeCaption="Ora"
                                    dateFormat="HH:mm"
                                    validations={[required]}
                                    filterTime={this.filterEndDate}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={"row"}>
                        <div className={"column"} style={{width: "45%"}}>
                            <div className={"form-group"}>
                                <label htmlFor={"email"}><MdIcons.MdEmail/> Email</label>
                                <Input
                                    type={"text"}
                                    className={"form-control"}
                                    name={"email"}
                                    value={this.state.email}
                                    onChange={this.onChangeEmail}
                                    validations={[required, vEmail]}
                                />
                            </div>
                        </div>

                        <div className={"column"} style={{width: "10%"}} />

                        <div className={"column"} style={{width: "45%"}}>
                            <div className={"form-group"}>
                                <label htmlFor={"phone"}><BsIcons.BsTelephoneFill/> Telefon</label>
                                <Input
                                    type={"text"}
                                    className={"form-control"}
                                    name={"phone"}
                                    value={this.state.phone}
                                    onChange={this.onChangePhone}
                                    validations={[required, vPhone]}
                                />
                            </div>
                        </div>
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
                            <span>Editează service-ul auto</span>
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
        );
    }
}