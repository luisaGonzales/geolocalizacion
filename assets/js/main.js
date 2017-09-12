'use strict';

const app = {
    // Item
    map: undefined,
    latitude: undefined,
    longitude: undefined,
    sourceOrigin: undefined,
    sourceDestination: undefined,
    directionsDisplay: undefined,
    directionsService: undefined,
    detailsPosition: undefined,
    marker: undefined,

    //Método que inicializa todo, dibujando un mapa 
    init: function () {
        app.map = new google.maps.Map($("#map")[0], {
            zoom: 5,
            center: {
                lat: -9.1191427,
                lng: -77.0349046
            },
            mapTypeControl: false,
            zoomControl: false,
            streetViewControl: false
        });

        // Setup de funcionalidades de botones
        app.setup();

        app.sourceOrigin = document.getElementById('origin');
        app.createListener(app.sourceOrigin);
        app.sourceDestination = document.getElementById('destination');
        app.createListener(app.sourceDestination);

        app.directionsService = new google.maps.DirectionsService;
        app.directionsDisplay = new google.maps.DirectionsRenderer;
        app.directionsDisplay.setMap(app.map);
    },
    // Método que genera el autocompletado de un input, guarda los detalles de la ubicación y lo coloca en el mapa
    createListener: function (source) {
        let autocomplete = new google.maps.places.Autocomplete(source);
        autocomplete.bindTo('bounds', app.map);
        app.detailsPosition = new google.maps.InfoWindow();
        app.marker = app.createMarker(app.map);
        autocomplete.addListener('place_changed', function () {
            app.detailsPosition.close();
            app.marker.setVisible(false);
            let place = autocomplete.getPlace();
            app.markLocation(place, app.detailsPosition, app.marker);
        });
    },
    // Método que marca el lugar indicado
    markLocation: function (place, detailsPosition, marker) {
        if (!place.geometry) {
            // Error si no encuentra el lugar indicado
            window.alert("No encontramos el lugar que indicaste: '" + place.name + "'");
            return;
        }
        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
            app.map.fitBounds(place.geometry.viewport);
        } else {
            app.map.setCenter(place.geometry.location);
            app.map.setZoom(17);
        }
        marker.setPosition(place.geometry.location);
        marker.setVisible(true);
        let address = '';
        if (place.address_components) {
            address = [
                (place.address_components[0] && place.address_components[0].short_name || ''),
                (place.address_components[1] && place.address_components[1].short_name || ''),
                (place.address_components[2] && place.address_components[2].short_name || '')
            ].join(' ');
        }
        detailsPosition.setContent('<div><strong>' + place.name + '</strong><br>' + address);
        detailsPosition.open(app.map, marker);
    },
    // Método que entrega funcionalidad a los botones 
    setup: function () {
        // Encuentrame
        document.getElementById("find-me").addEventListener("click", app.searchPosition);
        // Dibuja la ruta
        document.getElementById("show-road").addEventListener("click", function () {
            app.showRoad(app.directionsService, app.directionsDisplay)
        });
    },
    // Función que busca la posicion, pone una de exito y otra de fracaso
    searchPosition: function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(app.markCurrentPosition, app.fnError);
        }
    },
    // Función de fracaso al buscar la posicion
    fnError: function (error) {
        alert("Tenemos un problema para encontrar tu ubicación");
    },
    // Función de éxito que marca la posición actual 
    markCurrentPosition: function (position) {
        app.latitude = position.coords.latitude;
        app.longitude = position.coords.longitude;
        app.marker.setPosition(new google.maps.LatLng(app.latitude, app.longitude));
        app.map.setCenter({
            lat: app.latitude,
            lng: app.longitude
        });
        app.map.setZoom(17);
        app.marker.setVisible(true);
        app.detailsPosition.setContent('<div><strong>Mi ubicación actual</strong><br>');
        app.detailsPosition.open(app.map, app.marker);
    },
    // Método que crea el marcador
    createMarker: function (map) {
        let icon = {
            url: 'http://icons.iconarchive.com/icons/sonya/swarm/128/Bike-icon.png',
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(35, 35)
        };
        let marker = new google.maps.Marker({
            map: map,
            animation: google.maps.Animation.DROP,
            icon: icon,
            anchorPoint: new google.maps.Point(0, -29)
        });
        return marker;
    },
    // Método que muestra el camino
    showRoad: function (directionsService, directionsDisplay) {
        let origin = document.getElementById("origin").value;
        let destination = document.getElementById('destination').value;
        if (destination != "" && destination != "") {
            directionsService.route({
                    origin: origin,
                    destination: destination,
                    travelMode: "DRIVING"
                },
                function (response, status) {
                    if (status === "OK") {
                        directionsDisplay.setDirections(response);
                    } else {
                        app.fnErrorRoute();
                    }
                });
        }
    },
    // Método que se muestra cuando no se encuentra el camino de la ruta
    fnErrorRoute: function () {
        alert("No ingresaste un origen y un destino validos");
    }
}

function initMap() {
    app.init();
}

$(document).ready(app.init);