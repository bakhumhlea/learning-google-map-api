var map,
 infoWindow,
 currentPosition, 
 destination, 
 directionsService, 
 directionsDisplay, 
 geocoder;

var popup, Popup;

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
var defaultZoom = 16;
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

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      currentPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }

  document.getElementById('submit').addEventListener('click', function() {
    geocodeAddress(geocoder, map, infoWindow);
  });

}

function geocodeAddress(geocoder, map, infowindow) {
  var firstname = document.getElementById('first').value;
  var lastname = document.getElementById('last').value;
  var email = document.getElementById('email').value;
  var businessName = document.getElementById('business-name').value;
  var businessAddress = document.getElementById('business-address').value;

  geocoder.geocode({'address': businessAddress}, function(results, status) {
    if (status === 'OK') {
      
      map.setCenter(results[0].geometry.location);
      map.setZoom(18);

      destination = results[0].geometry.location;

      var lat = results[0].geometry.location.lat();
      var lng = results[0].geometry.location.lng();

      var data = {
        firstname: firstname,
        lastname: lastname,
        email: email,
        businessName: businessName,
        businessAddress: results[0].formatted_address,
        location: {
          lat: lat,
          lng: lng
        }
      };

      // markers.destination = new google.maps.Marker({
      //   position: destination,
      //   map: map,
      //   animation: google.maps.Animation.DROP,
      //   label: "B",
      // });

      // markers.currentPosition = new google.maps.Marker({
      //   position: currentPosition,
      //   map: map,
      //   title: 'Your current location',
      //   label: "A",
      // });

      showModal(data);
      clearFormFields();

      definePopupClass();

      popup = new Popup(
        destination,
        document.getElementById('content'));
        
      popup.setMap(map);

      // setInfowindow(destination, businessName, infowindow, map);
      // infowindow.setContent("You are here!");
      // infowindow.open(map, currentMarker);

      // createRoutePath(currentPosition, data.location, "WALKING", map);
      
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

function definePopupClass() {
  /**
   * A customized popup on the map.
   * @param {!google.maps.LatLng} position
   * @param {!Element} content
   * @constructor
   * @extends {google.maps.OverlayView}
   */
  Popup = function(position, content) {
    this.position = position;

    content.classList.add('popup-bubble-content');

    var pixelOffset = document.createElement('div');
    pixelOffset.classList.add('popup-bubble-anchor');
    pixelOffset.appendChild(content);

    this.anchor = document.createElement('div');
    this.anchor.classList.add('popup-tip-anchor');
    this.anchor.appendChild(pixelOffset);

    // Optionally stop clicks, etc., from bubbling up to the map.
    this.stopEventPropagation();
  };
  // NOTE: google.maps.OverlayView is only defined once the Maps API has
  // loaded. That is why Popup is defined inside initMap().
  Popup.prototype = Object.create(google.maps.OverlayView.prototype);

  /** Called when the popup is added to the map. */
  Popup.prototype.onAdd = function() {
    this.getPanes().floatPane.appendChild(this.anchor);
  };

  /** Called when the popup is removed from the map. */
  Popup.prototype.onRemove = function() {
    if (this.anchor.parentElement) {
      this.anchor.parentElement.removeChild(this.anchor);
    }
  };

  /** Called when the popup needs to draw itself. */
  Popup.prototype.draw = function() {
    var divPosition = this.getProjection().fromLatLngToDivPixel(this.position);
    // Hide the popup when it is far out of view.
    var display =
        Math.abs(divPosition.x) < 4000 && Math.abs(divPosition.y) < 4000 ?
        'block' :
        'none';

    if (display === 'block') {
      this.anchor.style.left = divPosition.x + 'px';
      this.anchor.style.top = divPosition.y + 'px';
    }
    if (this.anchor.style.display !== display) {
      this.anchor.style.display = display;
    }
  };

  /** Stops clicks/drags from bubbling up to the map. */
  Popup.prototype.stopEventPropagation = function() {
    var anchor = this.anchor;
    anchor.style.cursor = 'auto';

    ['click', 'dblclick', 'contextmenu', 'wheel', 'mousedown', 'touchstart',
     'pointerdown']
        .forEach(function(event) {
          anchor.addEventListener(event, function(e) {
            e.stopPropagation();
          });
        });
  };
}

function clearFormFields() {
  document.getElementById('first').value = "";
  document.getElementById('last').value = "";
  document.getElementById('email').value = "";
  document.getElementById('business-name').value = "";
  document.getElementById('business-address').value = "";
}

function createRoutePath(from, to, travelmode, map) {

  directionsDisplay.setMap(map);

  var request = {
    origin: from,
    destination: to,
    travelMode: google.maps.TravelMode[travelmode]
  };

  directionsService.route(request, function(response, status) {
    if (status == 'OK') {
      directionsDisplay.setDirections(response);
    }
  });
}

function removeRoutePath() {
  // destination.setMap(null);
  // markers.currentPosition.setMap(null);
  if(markers.destination) {
    markers.destination.setMap(null);
  }
  directionsDisplay.setMap(null);
}

var searchRouteBtn = document.getElementById("search-route-btn");
var routeShown = false;

searchRouteBtn.onclick = function toggleRoute() {
  if (routeShown) {
    removeRoutePath();
    routeShown = false;
  } else {
    createRoutePath(currentPosition, destination, "WALKING", map);
    routeShown = true;
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
var modalBackdrop = document.getElementById("close-modal-backdrop");

function showModal(data) {
  if (data) {
    document.getElementById("info-firstname").textContent = data.firstname;
    document.getElementById("info-lastname").textContent = data.lastname;
    document.getElementById("info-email").textContent = data.email;
    document.getElementById("info-business-name").textContent = data.businessName;
    document.getElementById("info-address").textContent = data.businessAddress;
    document.getElementById("lat-value").textContent = data.location.lat >= 0 ? `${data.location.lat} N˚`:`${data.location.lat*(-1)} S˚`;
    document.getElementById("lng-value").textContent = data.location.lng >= 0 ? `${data.location.lng} E˚`:`${data.location.lng*(-1)} W˚`;
  }

  modalGroup.style.display = "block";
  var displayTimer = setInterval(() => {
    targetModal.style.zIndex = 100;
    targetModal.style.opacity = 1;
    targetModal.style.top = "50vh";
    targetModal.style.transform = "translate(-50%, -50%)";
    modalBackdrop.style.opacity = 0.5;
    clearInterval(displayTimer);
  }, 0);
}
var btnOpen = document.getElementById("open-modal");
var btnClose = document.getElementById("close-modal-btn");

function closeModal() {
  removeRoutePath();

  targetModal.style.transform = "translate(-50%, -55%)";
  targetModal.style.opacity = 0;
  modalBackdrop.style.opacity = 0;

  var displayTimer = setInterval(() => {
    modalGroup.style.display = "none";
    clearInterval(displayTimer);
  }, 700);
}
btnOpen.onclick = () => {
  showModal(null);
};
btnClose.onclick = closeModal;
modalBackdrop.onclick = closeModal;