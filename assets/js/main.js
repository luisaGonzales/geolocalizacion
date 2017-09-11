const app = {
    map: undefined,
    markerOrigen: undefined,
    detalleUbicacionOrigen: undefined,

    init: function () {
        app.map = new google.maps.Map(document.getElementById("map"), {
            zoom: 5,
            center: {
                lat: -9.1191427,
                lng: -77.0349046
            },
            mapTypeControl: false,
            zoomControl: false,
            streetViewControl: false
        });

        var inputOrigen = document.getElementById('origen');
        var autocompleteOrigen = new google.maps.places.Autocomplete(inputOrigen);
        autocompleteOrigen.bindTo('bounds', app.map);
        app.detalleUbicacionOrigen = new google.maps.InfoWindow();
        app.markerOrigen = app.crearMarcador(app.map);

        app.crearListener(autocompleteOrigen, app.detalleUbicacionOrigen, app.markerOrigen);

        var inputDestino = document.getElementById('destino');
        var autocompleteDestino = new google.maps.places.Autocomplete(inputDestino);
        autocompleteDestino.bindTo('bounds', app.map);
        var detalleUbicacionDestino = new google.maps.InfoWindow();
        var markerDestino = app.crearMarcador(app.map);

        app.crearListener(autocompleteDestino, detalleUbicacionDestino, markerDestino);

        /* Mi ubicación actual */
        document.getElementById("encuentrame").addEventListener("click", app.buscarMiUbicacion);
        /* Ruta */
        var directionsService = new google.maps.DirectionsService;
        var directionsDisplay = new google.maps.DirectionsRenderer;

        document.getElementById("ruta").addEventListener("click", function () {
            app.dibujarRuta(directionsService, directionsDisplay)
        });

        directionsDisplay.setMap(app.map);
    },

    crearListener: function (autocomplete, detalleUbicacion, marker) {
        autocomplete.addListener('place_changed', function () {
            detalleUbicacion.close();
            marker.setVisible(false);
            var place = autocomplete.getPlace();
            app.marcarUbicacion(place, detalleUbicacion, marker);
        });
    },

    buscarMiUbicacion: function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(app.marcarUbicacionAutomatica, app.funcionError);
        }
    },

    funcionError : function (error) {
        alert("Tenemos un problema para encontrar tu ubicación");
    },

    marcarUbicacionAutomatica : function (posicion) {
        var latitud, longitud;
        latitud = posicion.coords.latitude;
        longitud = posicion.coords.longitude;

        app.markerOrigen.setPosition(new google.maps.LatLng(latitud, longitud));
        app.map.setCenter({
            lat: latitud,
            lng: longitud
        });
        app.map.setZoom(17);

        //inputOrigen.value = new google.maps.LatLng(latitud,longitud); //CON ESTO LOGRO QUE EN EL INPUT ORIGEN SALGA LAS COORDENADAS DE MI UBICACION

        app.markerOrigen.setVisible(true);

        app.detalleUbicacionOrigen.setContent('<div><strong>Mi ubicación actual</strong><br>');
        app.detalleUbicacionOrigen.open(app.map, app.markerOrigen);
    },

    marcarUbicacion : function (place, detalleUbicacion, marker) {
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

        var address = '';
        if (place.address_components) {
            address = [
                (place.address_components[0] && place.address_components[0].short_name || ''),
                (place.address_components[1] && place.address_components[1].short_name || ''),
                (place.address_components[2] && place.address_components[2].short_name || '')
            ].join(' ');
        }

        detalleUbicacion.setContent('<div><strong>' + place.name + '</strong><br>' + address);
        detalleUbicacion.open(app.map, marker);
    },

    crearMarcador: function(map) {
        var icono = {
            url: 'http://icons.iconarchive.com/icons/sonya/swarm/128/Bike-icon.png',
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(35, 35)
        };

        var marker = new google.maps.Marker({
            map: map,
            animation: google.maps.Animation.DROP,
            icon: icono,
            anchorPoint: new google.maps.Point(0, -29)
        });

        return marker;
    },

    dibujarRuta: function(directionsService, directionsDisplay) {
        var origin = document.getElementById("origen").value;
        var destination = document.getElementById('destino').value;

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
                        app.funcionErrorRuta();
                    }
                });
        }
    },

    funcionErrorRuta: function() {
        alert("No ingresaste un origen y un destino validos");
    }
}


function initMap() {
    app.init();
}