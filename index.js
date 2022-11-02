"use strict";


const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');



class Workout {
    date = new Date();
    id = (Date.now() + "").slice(-10);
    constructor(coords, distance, duration) {
        this.coords = coords;
        this.distance = distance;
        this.duration = duration;
    }
}
class Running extends Workout {
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.pace = this.duration / this.distance;
    }
}
class Cycling extends Workout {
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        this.speed = this.distance / (this.duration / 60);
    }
}
let run1 = new Running([39, -12], 5.2, 24, 178);
let cycling1 = new Cycling([39, -12], 27, 95, 523);



class App {
    #map;
    #mapEvent;
    constructor() {
        this._getPosition();
        form.addEventListener("submit", this._newWorkout.bind(this));
        inputType.addEventListener("change", this._toggleElevationField.bind(this));
    }
    _getPosition() {
        navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function() { alert("Could not get your position!"); });
    }
    _loadMap(position) {
        let {latitude, longitude} = position.coords;   
        this.#map = L.map('map').setView([latitude, longitude], 15);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(this.#map);
        this.#map.on("click", this._showForm.bind(this));
    }
    _showForm(mapE) {
        form.classList.remove("hidden");
        inputDistance.focus();
        this.#mapEvent = mapE;
    }
    _toggleElevationField() {
        inputCadence.closest("div.form__row").classList.toggle("form__row--hidden");
        inputElevation.closest("div.form__row").classList.toggle("form__row--hidden");
    }
    _newWorkout(e) {
        e.preventDefault();
        inputDistance.focus();
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = "";
        let {lat, lng} = this.#mapEvent.latlng;
        L.marker([lat, lng]).addTo(this.#map).bindPopup(L.popup({minWidth: 100, maxWidth: 250, autoClose: false, closeOnClick: false, className: "running-popup"})).setPopupContent("Workout").openPopup();
    }
}
let app = new App();
