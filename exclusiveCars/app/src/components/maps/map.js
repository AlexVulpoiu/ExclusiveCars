/* global google */
import { Button } from 'reactstrap';
import { Flex, HStack, Box, ButtonGroup, Input } from "@chakra-ui/react";
import {FaDirections } from 'react-icons/fa'
import * as AiIcons from "react-icons/ai";
import * as ImIcons from "react-icons/im";
import * as GiIcons from "react-icons/gi";

import { useJsApiLoader, GoogleMap, Marker, Autocomplete, DirectionsRenderer } from '@react-google-maps/api'
import { useRef, useState } from 'react';

function MyMap() {

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        libraries: ['places'],
    })

    let center = {lat: 0, lng: 0};

    const [map, setMap] = useState(/** @type google.maps.Map */ (null))
    const [directionsResponse, setDirectionsResponse] = useState(null)
    const [distance, setDistance] = useState('')
    const [duration, setDuration] = useState('')

    /** @type React.MutableRefObject<HTMLInputElement> */
    const originRef = useRef()
    /** @type React.MutableRefObject<HTMLInputElement> */
    const destiantionRef = useRef()

    function setAddress(map) {
        // eslint-disable-next-line no-undef
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({'address': localStorage.getItem("address")}, function (results, status) {
            if (status === 'OK') {
                localStorage.setItem("locationLat", results[0].geometry.location.lat());
                localStorage.setItem("locationLng", results[0].geometry.location.lng());
                center = {lat: Number(localStorage.getItem("locationLat")), lng: Number(localStorage.getItem("locationLng"))};
                map.setCenter(center);
                const marker = new google.maps.Marker({
                    position: center,
                    map,
                    title: localStorage.getItem("locationName")
                });
                const infoWindow = new google.maps.InfoWindow();
                marker.addListener("click", () => {
                    infoWindow.close();
                    infoWindow.setContent(marker.getTitle());
                    infoWindow.open(marker.getMap(), marker);
                });
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    }

    if (!isLoaded) {
        return (
            <h1>
                loading...
            </h1>
        );
    }

    async function calculateRoute() {
        if (originRef.current.value === '' || destiantionRef.current.value === '') {
            return
        }
        // eslint-disable-next-line no-undef
        const directionsService = new google.maps.DirectionsService()
        const results = await directionsService.route({
            origin: originRef.current.value,
            destination: destiantionRef.current.value,
            // eslint-disable-next-line no-undef
            travelMode: google.maps.TravelMode.DRIVING,
        })
        setDirectionsResponse(results)
        setDistance(results.routes[0].legs[0].distance.text)
        setDuration(results.routes[0].legs[0].duration.text)
    }

    async function calculateRouteFromMyLocation() {
        let locationPosition = {lat: 0, lng: 0};
        if(localStorage.getItem("myLocationLat") !== null && localStorage.getItem("myLocationLat") !== "") {
            locationPosition.lat = Number(localStorage.getItem("myLocationLat"));
            locationPosition.lng = Number(localStorage.getItem("myLocationLng"));
        } else {
            navigator.geolocation.getCurrentPosition(function (position) {
                locationPosition.lat = position.coords.latitude;
                locationPosition.lng = position.coords.longitude;
                localStorage.setItem("myLocationLat", locationPosition.lat);
                localStorage.setItem("myLocationLng", locationPosition.lng);
            })
        }

        if(locationPosition === {}) {
            return
        }

        let destinationPosition = {lat: Number(localStorage.getItem("locationLat")), lng: Number(localStorage.getItem("locationLng"))};

        // eslint-disable-next-line no-undef
        const directionsService = new google.maps.DirectionsService()
        const results = await directionsService.route({
            origin: locationPosition,
            destination: destinationPosition,
            // eslint-disable-next-line no-undef
            travelMode: google.maps.TravelMode.DRIVING,
        })
        setDirectionsResponse(results)
        setDistance(results.routes[0].legs[0].distance.text)
        setDuration(results.routes[0].legs[0].duration.text)
    }

    function clearRoute() {
        setDirectionsResponse(null)
        setDistance('')
        setDuration('')
        originRef.current.value = ''
        destiantionRef.current.value = ''
    }

    return (
        <Flex
            position='relative'
            flexDirection='column'
            alignItems='center'
            h='65vh'
            w='45vw'
        >
            <Box position='absolute' left={0} top={0} h='100%' w='100%'>
                {/* Google Map Box */}
                <GoogleMap
                    zoom={15}
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    options={{
                        zoomControl: true,
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false,
                    }}
                    onLoad={map => {
                        setMap(map);
                        setAddress(map);
                    }}
                >
                    {directionsResponse && (
                        <DirectionsRenderer directions={directionsResponse} />
                    )}
                </GoogleMap>
            </Box>
            <Box
                p={4}
                borderRadius='lg'
                m={4}
                bgColor='white'
                shadow='base'
                minW='container.md'
                zIndex='1'
            >
                <HStack spacing={2} justifyContent='space-between'>
                    <Box flexGrow={1}>
                        <Autocomplete>
                            <Input
                                type='text'
                                placeholder='Locație inițială'
                                ref={originRef}/>
                        </Autocomplete>
                    </Box>
                    <Box flexGrow={1}>
                        <Autocomplete>
                            <Input
                                type='text'
                                placeholder='Destinație'
                                ref={destiantionRef}
                            />
                        </Autocomplete>
                    </Box>

                    <ButtonGroup>
                        <Button color={"success"} style={{borderRadius: "50%"}} title={"Navighează între locațiile introduse"}
                                type='submit' onClick={calculateRoute}>
                            <FaDirections />
                        </Button>

                        <Button color={"danger"} style={{borderRadius: "50%"}} title={"Golește câmpurile"}
                                onClick={clearRoute}>
                            <AiIcons.AiOutlineClose/>
                        </Button>

                        <Button color={"primary"} style={{borderRadius: "50%"}}
                                title={"Înapoi la " + localStorage.getItem("locationType")}
                                onClick={() => {
                                    let location = {lat: Number(localStorage.getItem("locationLat")), lng: Number(localStorage.getItem("locationLng"))};
                                    map.panTo(location)
                                    map.setZoom(15)
                                }}>
                            <ImIcons.ImLocation/>
                        </Button>

                        <Button color={"warning"} style={{borderRadius: "50%"}}
                                title={"Navighează de la locația curentă"}
                                onClick={calculateRouteFromMyLocation}>
                            <GiIcons.GiPathDistance/>
                        </Button>
                    </ButtonGroup>
                </HStack>
                <HStack spacing={"20px"}>
                    <Box style={{width: "40%"}}>
                        <p>Distanță: {distance} </p>
                    </Box>
                    <Box>
                        <p>Durată: {duration} </p>
                    </Box>
                </HStack>
            </Box>
        </Flex>
    )
}

export default MyMap;