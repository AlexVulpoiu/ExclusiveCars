import React, {Component} from "react";
import AuthService from "../../services/auth.service";
import axios from "axios";
import authHeader from "../../services/auth-header";
import ReactApexChart from "react-apexcharts";
import * as FiIcons from "react-icons/fi";

export default class OrganisationStats extends Component {

    constructor(props) {
        super(props);

        this.state = {
            organisation: null,
            loading: true
        };

        this.currentUser = AuthService.getCurrentUser();
    }

    componentDidMount() {
        this.setState({loading: true});
        axios.get(`http://localhost:8090/api/organisations/myOrganisation`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((data) => {
                this.setState({organisation: data["data"], loading: false});
                console.log(data);
                console.log(data["data"]);
            })
            .catch((error) => {
                console.log(error);
            })
    }

    hasAccess(user) {
        return user !== null && user.roles.includes("ROLE_ORGANISATION");
    }

    render() {
        const loading = this.state.loading;
        const organisation = this.state.organisation;

        if(loading) {
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

        const serviceOptions = {
            chart: {
                height: 350,
                type: 'bar',
                events: {
                    click: function(chart, w, e) {
                        // console.log(chart, w, e)
                    }
                }
            },
            plotOptions: {
                bar: {
                    columnWidth: '45%',
                    distributed: true,
                }
            },
            dataLabels: {
                enabled: false
            },
            legend: {
                show: false
            },
            title: {
                text: "Distribuția service-urilor auto pe orașe",
                align: "center"
            },
            xaxis: {
                categories: [
                    'Bucuresti', 'Iasi', 'Craiova', 'Campulung'
                ],
                labels: {
                    style: {
                        fontSize: '12px'
                    }
                }
            },
            yaxis: {
                tickAmount: 3,
                labels: {
                    formatter: function(val) {
                        return val.toFixed(0)
                    }
                },
            }
        };

        const rentalCenterOptions = {
            chart: {
                height: 350,
                type: 'bar',
                events: {
                    click: function(chart, w, e) {
                        // console.log(chart, w, e)
                    }
                }
            },
            plotOptions: {
                bar: {
                    columnWidth: '45%',
                    distributed: true,
                }
            },
            dataLabels: {
                enabled: false
            },
            legend: {
                show: false
            },
            title: {
                text: "Distribuția centrelor de închirieri auto pe orașe",
                align: "center"
            },
            xaxis: {
                categories: [
                    'Timisoara', 'Bucuresti', 'Constanta', 'Brasov'
                ],
                labels: {
                    style: {
                        fontSize: '12px'
                    }
                }
            },
            yaxis: {
                tickAmount: 3,
                labels: {
                    formatter: function(val) {
                        return val.toFixed(0)
                    }
                },
            }
        };

        const carOptions = {
            chart: {
                width: 380,
                type: 'pie',
            },
            labels: ['Volkswagen', 'Ford', 'Hyundai', 'Audi', 'Kia'],
            responsive: [{
                breakpoint: 480,
                options: {
                    chart: {
                        width: 200
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }],
            title: {
                text: "Distribuția închirierilor auto în funcție de brand",
                align: "center"
            }
        };

        return (
            <div className={"col-md-12"}>
                <h1>{organisation["name"]} - Statistici</h1>

                <br/>
                <br/>

                <h2 style={{textAlign: "center"}}>Service-uri auto</h2>
                <div className={"row"}>
                    <div className={"column"} style={{width: "50%"}}>

                        <br/>
                        <br/>
                        <br/>

                        <p><FiIcons.FiArrowRight/> Număr total programări: 21, dintre care 14 în ultima lună</p>
                        <p><FiIcons.FiArrowRight/> Cel mai vizitat service: <a href={"/"} target={"_blank"}>CarFix AutoService SRL</a></p>
                        <p><FiIcons.FiArrowRight/> Număr programări: 6, dintre care 5 în ultima lună</p>

                    </div>

                    <div className={"column"} style={{width: "50%"}}>
                        <br/>

                        <ReactApexChart options={serviceOptions} series={[{data: [4, 2, 2, 1]}]} type="bar" width={"80%"} />
                    </div>
                </div>

                <br/>

                <h2 style={{textAlign: "center"}}>Închirieri auto</h2>
                <br/>
                <div className={"row"} style={{margin: "auto"}}>

                    <div className={"column"} style={{width: "50%"}}>
                        <p><FiIcons.FiArrowRight/> Număr total închirieri: 12, dintre care 8 în ultima lună</p>
                        <p><FiIcons.FiArrowRight/> Cea mai profitabilă mașină: <a href={"/"} target={"_blank"}>Ford Focus HATCHBACK, 2011</a>. Profit: 1200 lei</p>
                    </div>

                    <div className={"column"} style={{width: "50%"}}>
                        <p><FiIcons.FiArrowRight/> Cea mai închiriată mașină: <a href={"/"} target={"_blank"}>Volkswagen Golf HATCHBACK, 2018</a></p>
                        <p><FiIcons.FiArrowRight/> Număr închirieri: 5, dintre care 3 în ultima lună. Profit: 900 lei</p>
                    </div>

                </div>

                <br/>

                <div className={"row"}>
                    <div className={"column"} style={{width: "50%"}}>
                        <ReactApexChart options={carOptions} series={[5, 3, 2, 1, 1]} type="pie" width={"80%"} />
                    </div>

                    <div className={"column"} style={{width: "50%"}}>
                        <ReactApexChart options={rentalCenterOptions} series={[{data: [2, 3, 1, 1]}]} type="bar" width={"80%"} />
                    </div>
                </div>
            </div>
        );
    }
}