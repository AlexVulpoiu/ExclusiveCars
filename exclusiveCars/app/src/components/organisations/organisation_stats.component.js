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
            organisationStats: null,
            loading: true
        };

        this.currentUser = AuthService.getCurrentUser();
    }

    componentDidMount() {
        this.setState({loading: true});

        document.title = "Statistici organizație";

        axios.get(`http://localhost:8090/api/organisations/myStats`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: authHeader().Authorization
            }
        })
            .then((data) => {
                this.setState({organisationStats: data["data"], loading: false});
            })
            .catch((error) => {
                console.log(error);
            });
    }

    hasAccess(user) {
        return user !== null && user.roles.includes("ROLE_ORGANISATION");
    }

    render() {
        const loading = this.state.loading;

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

        const organisationStats = this.state.organisationStats;

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
                categories: Object.keys(organisationStats["rentalCentersByCity"]),
                labels: {
                    style: {
                        fontSize: '12px'
                    }
                }
            },
            yaxis: {
                tickAmount: Math.max(...Object.values(organisationStats["rentalCentersByCity"])),
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
            labels: Object.keys(organisationStats["carRentalsByBrand"]),
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
                categories: Object.keys(organisationStats["autoServicesByCity"]),
                labels: {
                    style: {
                        fontSize: '12px'
                    }
                }
            },
            yaxis: {
                tickAmount: Math.max(...Object.values(organisationStats["autoServicesByCity"])),
                labels: {
                    formatter: function(val) {
                        return val.toFixed(0)
                    }
                },
            }
        };

        return (
            <div className={"col-md-12"}>
                <h1 align={"center"}>{organisationStats["organisationName"]} - Statistici</h1>

                <br/>
                <br/>

                <h2 style={{textAlign: "center"}}>Service-uri auto</h2>
                <div className={"row"}>
                    <div className={"column"} style={{width: "50%"}}>

                        <br/>
                        <br/>
                        <br/>

                        <p><FiIcons.FiArrowRight/> Număr total programări: {organisationStats["totalServiceAppointments"]}, dintre care {organisationStats["lastMonthServiceAppointments"]} în ultima lună</p>
                        <p><FiIcons.FiArrowRight/> Cel mai vizitat service: <a href={`/autoServices/${organisationStats["mostVisitedAutoServiceId"]}`} target={"_blank"}>{organisationStats["mostVisitedAutoService"]}</a></p>
                        <p><FiIcons.FiArrowRight/> Număr programări: {organisationStats["mostVisitedAutoServiceTotalAppointments"]}, dintre care {organisationStats["mostVisitedAutoServiceLastMonthAppointments"]} în ultima lună</p>

                    </div>

                    <div className={"column"} style={{width: "50%"}}>
                        <br/>

                        <ReactApexChart options={serviceOptions} series={[{data: Object.values(organisationStats["autoServicesByCity"])}]} type="bar" width={"80%"} />
                    </div>
                </div>

                <br/>

                <h2 style={{textAlign: "center"}}>Închirieri auto</h2>
                <br/>
                <div className={"row"} style={{margin: "auto"}}>

                    <div className={"column"} style={{width: "50%"}}>
                        <p><FiIcons.FiArrowRight/> Număr total închirieri: {organisationStats["totalCarRentals"]}, dintre care {organisationStats["lastMonthCarRentals"]} în ultima lună</p>
                        <p><FiIcons.FiArrowRight/> Cea mai profitabilă mașină: <a href={`/rentalAnnouncements/${organisationStats["mostProfitableCarAnnouncementId"]}`} target={"_blank"}>{organisationStats["mostProfitableCar"]}</a>. Profit: {organisationStats["mostProfitableCarProfit"]} €</p>
                    </div>

                    <div className={"column"} style={{width: "50%"}}>
                        <p><FiIcons.FiArrowRight/> Cea mai închiriată mașină: <a href={`/rentalAnnouncements/${organisationStats["mostRentedCarAnnouncementId"]}`} target={"_blank"}>{organisationStats["mostRentedCar"]}</a></p>
                        <p><FiIcons.FiArrowRight/> Număr închirieri: {organisationStats["mostRentedCarTotalRentals"]}, dintre care {organisationStats["mostRentedCarLastMonthRentals"]} în ultima lună. Profit: {organisationStats["mostRentedCarProfit"]} €</p>
                    </div>

                </div>

                <br/>

                <div className={"row"}>
                    <div className={"column"} style={{width: "50%"}}>
                        <ReactApexChart options={carOptions} series={Object.values(organisationStats["carRentalsByBrand"])} type="pie" width={"80%"} />
                    </div>

                    <div className={"column"} style={{width: "50%"}}>
                        <ReactApexChart options={rentalCenterOptions} series={[{data: Object.values(organisationStats["rentalCentersByCity"])}]} type="bar" width={"80%"} />
                    </div>
                </div>
            </div>
        );
    }
}