var map,
 infoWindow,
 currentPosition, 
 destination, 
 directionsService, 
 directionsDisplay, 
 geocoder,
 placesService;

var currentInfoText = `<strong>You are here</strong>`;

var markers = {
  currentPosition: null,
  destination: null
};

var mapStyle = [
  {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
  {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
  {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{color: '#d59563'}]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{
      "visibility": "on"
    },{color: '#d59563'}]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{color: '#263c3f'}]
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{color: '#6b9a76'}]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{color: '#38414e'}]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{color: '#212a37'}]
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{color: '#9ca5b3'}]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{color: '#746855'}]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{color: '#1f2835'}]
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{color: '#f3d19c'}]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{color: '#2f3948'}]
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{color: '#d59563'}]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{color: '#17263c'}]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{color: '#515c6d'}]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{color: '#17263c'}]
  }
];
var defaultZoom = 14;
const SF = {lat: 37.7749, lng: -122.4194};

function initMap() {

  map = new google.maps.Map(
    document.getElementById('map'), {
      zoom: defaultZoom, 
      center: currentPosition || SF,
      styles: mapStyle,
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: true,
      fullscreenControl: false
    }
  );

  directionsService = new google.maps.DirectionsService();
  directionsDisplay = new google.maps.DirectionsRenderer();
  infoWindow = new google.maps.InfoWindow;
  geocoder = new google.maps.Geocoder();
  placesService = new google.maps.places.PlacesService(map);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      currentPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      markers.currentPosition = createMarker(currentPosition, map);
      setInfoWindow(infoWindow, currentInfoText, markers.currentPosition, map);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }

  document.getElementById('submit').addEventListener('click', function() {
    var firstname = document.getElementById('first').value;
    var lastname = document.getElementById('last').value;
    var email = document.getElementById('email').value;
    var businessName = document.getElementById('business-name').value;
    var businessAddress = document.getElementById('business-address').value;

    data = {
      firstname: firstname,
      lastname: lastname,
      email: email,
      businessName: businessName,
      businessAddress: null,
      location: {
        lat: null,
        lng: null
      }
    };

    geocodeAddress(businessAddress, geocoder, map, infoWindow, placesService);
  });

}

function addDataToField(data) {
  if (data) {
    document.getElementById("info-firstname").textContent = data.firstname;
    document.getElementById("info-lastname").textContent = data.lastname;
    document.getElementById("info-email").textContent = data.email;
    document.getElementById("info-business-name").textContent = data.businessName;
    document.getElementById("info-address").textContent = data.businessAddress;
    document.getElementById("lat-value").textContent = data.location.lat >= 0 ? `${data.location.lat} N˚`:`${data.location.lat*(-1)} S˚`;
    document.getElementById("lng-value").textContent = data.location.lng >= 0 ? `${data.location.lng} E˚`:`${data.location.lng*(-1)} W˚`;
  }
}
function clearFormFields() {
  document.getElementById('first').value = "";
  document.getElementById('last').value = "";
  document.getElementById('email').value = "";
  document.getElementById('business-name').value = "";
  document.getElementById('business-address').value = "";
}

function createPlaceContentHTML(icon, name, types) {
  return (`
    <img src="${icon}" class="pin-icon"/>
    <div class="pin-icon-info">
      <p><strong>${name}</strong></p>
      <p>${types}</p>
    </div>
  `);
}

var data;

function geocodeAddress(address, geocoder, map, infowindow, placesservice) {
  geocoder.geocode({'address': address}, function(results, status) {
    if (status === 'OK') {
      map.setCenter(results[0].geometry.location);
      map.setZoom(16);

      destination = results[0].geometry.location;
      
      data.businessAddress = results[0].formatted_address;
      data.location.lat = results[0].geometry.location.lat();
      data.location.lng = results[0].geometry.location.lng();

      var request = {
        placeId: results[0].place_id,
        fields: ['name', 'icon', 'rating', 'geometry', 'type']
      };
      
      placesservice.getDetails(request, function(place, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          var types = getPlaceTypes(place.types);
          var content = createPlaceContentHTML(place.icon, place.name, types.slice(0,3).join(', '));
          markers.destination = createMarker(destination, map);
          setInfoWindow(infowindow, content, markers.destination, map);
        }
      });

      showMap();
      addDataToField(data);
      clearFormFields();
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
    console.log(data);
  });
}

function getPlaceTypes(placetypes) {
  var types = [];
  placetypes.forEach(type => types.push(type.split("_").join(' ').charAt(0).toUpperCase() + type.split("_").join(' ').substr(1)));
  return types;
}

function createMarker(position, map) {
  return new google.maps.Marker({
    position: position,
    map: map,
    animation: google.maps.Animation.DROP,
  });
}

function setInfoWindow(infowindow, content, marker, map) {
  infowindow.setContent(content);
  infowindow.open(map, marker);
}

function showMap() {
  if (!markers.destination) {
    centerAtMarker(markers.currentPosition, map, 16);
    setInfoWindow(infoWindow, currentInfoText, markers.currentPosition, map );
  }
  toggleModal(true);
}

function closeMap() {
  removeRoutePath(map);
  if (markers.destination) {
    markers.destination.setMap(null);
    markers.destination = null;
  }
  toggleModal(false);
}

var btnOpen = document.getElementById("open-modal");
var btnClose = document.getElementById("close-modal-btn");
var modalBackdrop = document.getElementById("close-modal-backdrop");

btnOpen.onclick = showMap;
btnClose.onclick = closeMap;
modalBackdrop.onclick = closeMap;

function centerAtMarker(marker, map, zoomfactor) {
  marker.setMap(map);
  map.setCenter({
    lat: marker.position.lat(),
    lng: marker.position.lng()
  });
  map.setZoom(zoomfactor);
}
var travelTypeShown = null;

// Calculate route path and display on map
function createRoutePath(from, to, travelmode, map) {
  
  directionsDisplay.setMap(map);

  if (from && to && travelmode) {
    travelTypeShown = travelmode;
    var request = {
      origin: from,
      destination: to,
      travelMode: google.maps.TravelMode[travelmode],
    };
  
    directionsService.route(request, function(response, status) {
      if (status == 'OK') {
        document.getElementById("tra-dis").textContent = response.routes[0].legs[0].distance.text;
        document.getElementById("tra-dur").textContent = response.routes[0].legs[0].duration.text;
        toggleRouteInfo(true);
        directionsDisplay.setDirections(response);
      }
    });
    return true;
  } else {
    console.log("Needs Start and Finish Location to create route path on map");
    return false;
  }
}
// Hide route path from map
function removeRoutePath(map) {
  if (markers.destination) {
    centerAtMarker(markers.destination, map, 16);
  }
  removeClassAll(routeBtns, "active-route", null);
  directionsDisplay.setMap(null);
  travelTypeShown = null;

  toggleRouteInfo(false);
}

// Initialize routeBtns
var routeBtns = document.getElementsByClassName("route-btn");

(function initialRouteBtn() {
  var btns = [];
  for (const index in routeBtns) {
    if (routeBtns.hasOwnProperty(index)) {
      const element = routeBtns[index];
      element.onclick = toggleRoute
    }
  }
})();

function toggleRoute(event) {
  if (travelTypeShown === event.target.value) {
    removeRoutePath(map);
  } else {
    var result = createRoutePath(currentPosition, destination, event.target.value , map);
    if (!result) {
      return
    }
    removeClassAll(routeBtns, "active-route", event.target);
  }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}

// UI javascript
var modalGroup = document.getElementById("modal-group");
var targetModal = document.getElementById("info-modal");
var travelInfo = document.getElementById("route-info");

function toggleClass(el, classname) {
  el.classList.toggle(classname);
}
// Remove all class
function removeClassAll(elements,  classname, exception) {
  if (typeof elements === 'object') {
    for (const el in elements) {
      if (elements.hasOwnProperty(el)) {
        var element = elements[el];
        if (exception && element === exception) {
          element.classList.toggle(classname, true);
          // console.log(element === exception);
        } else {
          element.classList.toggle(classname, false);
        }
      }
    }
  } else {
    elements.forEach(el => {
      if (el === exception) {
        el.classList.toggle(classname, true);
      } else {
        el.classList.toggle(classname, false);
      }
    });
  }
}

function toggleRouteInfo(boolean) {
  if (boolean) {
    travelInfo.style.width = "90%";
    travelInfo.style.opacity = 1;
  } else {
    travelInfo.style.width = 0;
    travelInfo.style.opacity = 0;
  }
}


function toggleModal(boolean) {
  if (boolean) {
    modalGroup.style.display = "block";
    var displayTimer = setInterval(() => {
      targetModal.style.zIndex = 100;
      targetModal.style.opacity = 1;
      targetModal.style.top = "50vh";
      targetModal.style.transform = "translate(-50%, -50%)";
      modalBackdrop.style.opacity = 0.5;
      clearInterval(displayTimer);
    }, 0);
  } else {
    targetModal.style.transform = "translate(-50%, -55%)";
    targetModal.style.opacity = 0;
    modalBackdrop.style.opacity = 0;

    var displayTimer = setInterval(() => {
      modalGroup.style.display = "none";
      clearInterval(displayTimer);
    }, 700);
  }
}
