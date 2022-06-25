import React, {Component} from 'react';
import Form from "react-validation/build/form";
import DatePicker from 'react-datepicker';
import addDays from 'date-fns/addDays';
import ro from 'date-fns/locale/ro';

import "react-datepicker/dist/react-datepicker.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import {getDay, setHours, setMinutes} from "date-fns";
import * as AiIcons from "react-icons/ai";
import * as BsIcons from "react-icons/bs";
import * as BiIcons from "react-icons/bi";
import * as GrIcons from "react-icons/gr";
import {Button} from "reactstrap";
import AuthService from "../../services/auth.service";
import axios from "axios";
import authHeader from "../../services/auth-header";
import CheckButton from "react-validation/build/button";

const required = value => {
    if (!value) {
        return (
            <div className="alert alert-danger" role="alert">
                Acest câmp este obligatoriu!
            </div>
        );
    }
};

export default class MakeServiceAppointment extends Component  {

    emptyAppointment = {
        problem_description: "",
        date: "",
        hour: ""
    }

    constructor (props) {
        super(props)

        this.state = {
            startDate: sessionStorage.getItem("appointmentDate") ? new Date(sessionStorage.getItem("appointmentDate")) : sessionStorage.getItem("appointmentDate"),
            startTime: sessionStorage.getItem("appointmentTime") ? new Date(sessionStorage.getItem("appointmentTime")) : sessionStorage.getItem("appointmentTime"),
            autoService: {},
            description: sessionStorage.getItem("appointmentDescription"),
            appointments: [],
            loading: false,
            message: "",
            appointmentsByHour: {}
        };

        sessionStorage.setItem("appointmentDescription", "");
        sessionStorage.setItem("appointmentDate", "");
        sessionStorage.setItem("appointmentTime", "");

        this.currentUser = AuthService.getCurrentUser();

        this.handleDateChange = this.handleDateChange.bind(this);
        this.handleTimeChange = this.handleTimeChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onChangeDescription = this.onChangeDescription.bind(this);
    }

    componentDidMount() {
        document.title = "Efectuează programare"
        this.setState({loading: true});
        fetch(`http://localhost:8090/api/autoServices/${this.props.match.params.serviceId}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => response.json())
            .then((data) => {
                this.setState({autoService: data});
            })
            .catch((error) => {
                console.log(error);
            });

        fetch(`http://localhost:8090/api/serviceAppointments/${this.props.match.params.serviceId}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((response) => {
                // console.log(response);
                response.json()
            })
            .then((data) => {
                this.setState({appointments: data, loading: false});
            })
            .catch((error) => console.log(error));
    }

    handleDateChange(date) {
        this.setState({
            startDate: date,
            startTime: ""
        })
    }

    handleTimeChange(date) {
        this.setState({
            startTime: date
        });
    }

    onChangeDescription(e) {
        this.setState({
            description: e.target.value
        });
    }

    isWeekday = (date) => {
        return 1 <= getDay(date) && getDay(date) <= 5;
    };

    hasAccess(user) {
        if(user === null) {
            return false;
        }
        return user.roles.length === 1;
    }

    filterTime = (time) => {
        const appointments = this.state.appointments;

        const today = new Date();
        let startHour = 0;
        if(this.state.startDate
            && this.state.startDate.getDate() === today.getDate()
            && this.state.startDate.getMonth() === today.getMonth()) {
            startHour = today.getHours() + 1;
        }

        const selectedDate = new Date(time);
        startHour = Math.max(startHour, Number(String(this.state.autoService["startHour"]).substring(0, 2)));
        const endHour = Number(String(this.state.autoService["endHour"]).substring(0, 2));
        const minDateTime = setHours(setMinutes(new Date(selectedDate), 0), startHour);
        const maxDateTime = setHours(setMinutes(new Date(selectedDate), 0), endHour);

        this.state.appointmentsByHour = {};
        for(let hour = startHour; hour < endHour; hour++) {
            this.state.appointmentsByHour[hour] = [];
        }
        if(this.state.startDate) {
            for (let i in appointments) {
                const appointmentDate = new Date(appointments[i]["date"]);
                if (appointments[i]["service_id"] === Number(this.props.match.params.serviceId)
                    && appointmentDate.getDate() === this.state.startDate.getDate()
                    && appointmentDate.getMonth() === this.state.startDate.getMonth()
                    && appointmentDate.getFullYear() === this.state.startDate.getFullYear()) {

                    this.state.appointmentsByHour[Number(appointments[i]["hour"].substring(0, 2))]
                        .push(Number(appointments[i]["station_number"]));
                }
            }
        }

        const excludedHours = [];
        for(let i in this.state.appointmentsByHour) {
            if(this.state.appointmentsByHour[i].length === this.state.autoService["numberOfStations"]) {
                excludedHours.push(Number(i));
            }
        }

        return minDateTime <= selectedDate.getTime() && selectedDate.getTime() < maxDateTime.getTime()
                && !excludedHours.includes(selectedDate.getHours());
    }

    async handleSubmit(e) {
        e.preventDefault();

        this.setState({
            message: "",
            loading: true
        })

        this.form.validateAll();

        if(this.state.description === null || this.state.description.trim().length === 0
            || this.state.startDate === null || this.state.startDate === ""
            || this.state.startTime === null || this.state.startTime === "") {

            sessionStorage.setItem("appointmentAddMessage", "Toate câmpurile sunt obligatorii!");
            if(this.state.description !== null) {
                sessionStorage.setItem("appointmentDescription", this.state.description.trim());
            }

            if(this.state.startDate !== null && this.state.startDate !== "") {
                sessionStorage.setItem("appointmentDate", this.state.startDate.toString());
            } else {
                sessionStorage.setItem("appointmentDate", "");
            }

            if(this.state.startTime !== null && this.state.startTime !== "") {
                sessionStorage.setItem("appointmentTime", this.state.startTime.toString());
            } else {
                sessionStorage.setItem("appointmentTime", "");
            }

            window.location.reload();
        }

        if(this.checkBtn.context._errors.length === 0) {
            const newAppointment = this.emptyAppointment;
            newAppointment["problem_description"] = this.state.description.trim();

            const year = this.state.startDate.getFullYear();
            const month = (this.state.startDate.getMonth() + 1) < 10 ? "0" + (this.state.startDate.getMonth() + 1) : (this.state.startDate.getMonth() + 1);
            const day = this.state.startDate.getDate() < 10 ? "0" + this.state.startDate.getDate() : this.state.startDate.getDate();
            newAppointment["date"] = year + "-" + month + "-" + day;

            const hour = this.state.startTime.getHours() < 10 ? "0" + this.state.startTime.getHours() : this.state.startTime.getHours();
            const minutes = this.state.startTime.getMinutes() < 10 ? "0" + this.state.startTime.getMinutes() : this.state.startTime.getMinutes();
            newAppointment["hour"] = hour + ":" + minutes;

            await axios.post(`http://localhost:8090/api/serviceAppointments/makeAppointment/${this.props.match.params.serviceId}`, newAppointment, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: authHeader().Authorization
                }
            })
                .then(() => {
                    localStorage.setItem("infoMessage", "Programarea a fost efectuată cu succes!");
                    sessionStorage.setItem("appointmentDescription", "");
                    sessionStorage.setItem("appointmentDate", "");
                    sessionStorage.setItem("appointmentTime", "");
                    this.props.history.push("/serviceAppointments");
                })
                .catch((error) => {
                    this.props.history.push(`/serviceAppointments/makeAppointment/${this.props.match.params.serviceId}`);
                    window.location.reload();

                    sessionStorage.setItem("appointmentAddMessage", error.response.data);
                    sessionStorage.setItem("appointmentDescription", this.state.description);
                    sessionStorage.setItem("appointmentDate", this.state.startDate);
                    sessionStorage.setItem("appointmentTime", this.state.startTime);
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
        sessionStorage.setItem("appointmentAddMessage", "");
    }

    render() {
        const loading = this.state.loading;
        const autoService = this.state.autoService;

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

        if(loading) {
            return (
                <h1>Se încarcă...</h1>
            );
        }

        return (
            <div className={"col-md-12"}>
                {sessionStorage.getItem("appointmentAddMessage") !== null && sessionStorage.getItem("appointmentAddMessage") !== "" && (
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
                        {sessionStorage.getItem("appointmentAddMessage")}
                    </div>
                )}

                <h2>Efectuează o programare</h2>
                <br/>
                <p>
                    <AiIcons.AiFillInfoCircle/>
                    &nbsp;
                    Te rugăm să completezi câmpurile de mai jos. Numele va fi preluat automat din contul de utilizator, iar după efectuarea acțiunii, vei primi un email de confirmare.
                </p>
                <h6><BiIcons.BiBuildingHouse/> {autoService["name"]}</h6>
                <h6><GrIcons.GrMapLocation/> {autoService["city"] + ", " + autoService["address"]}</h6>
                <h6><BsIcons.BsFillClockFill/> Program: {String(autoService["startHour"]).substring(0, 5) + " - " + String(autoService["endHour"]).substring(0, 5)}</h6>
                <br/>
                <Form
                    onSubmit={this.handleSubmit}
                    ref={c => {
                        this.form = c;
                    }}>

                    <div className={"row"}>
                        <div style={{width: "50%"}} className={"form-group"}>
                            <label htmlFor={"description"}><BsIcons.BsQuestionCircleFill/> Motivul vizitei</label>
                            <textarea
                                className={"form-control"}
                                name={"description"}
                                value={this.state.description}
                                onChange={this.onChangeDescription}
                                rows={5}
                            />
                        </div>

                        <div style={{width: "5%"}}/>

                        <div style={{width: "20%"}} className="form-group">
                            <label htmlFor={"dateTime"}><BsIcons.BsCalendar3/> Data</label>
                            <DatePicker
                                name={"dateTime"}
                                selected={ this.state.startDate }
                                onChange={ this.handleDateChange }
                                placeholderText={"Alegeți data"}
                                filterDate={this.isWeekday}
                                locale={ro}
                                dateFormat="d MMMM yyyy"
                                minDate={new Date()}
                                maxDate={addDays(new Date(), 30)}
                                validations={[required]}
                                autoFocus
                            />
                        </div>

                        <div style={{width: "5%"}} />

                        <div style={{width: "20%"}} className={"form-group"}>
                            <label htmlFor={"time"}><BiIcons.BiTimeFive/> Ora</label>
                            <DatePicker
                                name={"time"}
                                selected={this.state.startTime}
                                onChange={this.handleTimeChange}
                                placeholderText={"Alegeți ora"}
                                locale={ro}
                                showTimeSelect
                                showTimeSelectOnly
                                timeIntervals={60}
                                timeCaption="Ora"
                                dateFormat="HH:mm"
                                validations={[required]}
                                filterTime={this.filterTime}
                                autoFocus
                            />
                        </div>
                    </div>

                    <br/>
                    <br/>
                    <br/>
                    <br/>
                    <br/>
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
                            <span>Salvează programarea</span>
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