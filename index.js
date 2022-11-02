"use strict";



const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
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
    type = "running";
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.pace = this.duration / this.distance;
    }
}
class Cycling extends Workout {
    type = "cycling";
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        this.speed = this.distance / (this.duration / 60);
    }
}



class App {
    #map;
    #mapEvent;
    #workouts = [];
    constructor() {
        this._getPosition();
        form.addEventListener("submit", this._newWorkout.bind(this));
        inputType.addEventListener("change", this._toggleElevationField.bind(this));
    }
    _getPosition() {  //Ne ia pozitia noastra geografica.
        navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function() { alert("Could not get your position!"); });
    }
    _loadMap(position) {  //Ne centreaza harta in functie de pozitia noastra geografica.
        let {latitude, longitude} = position.coords;   
        this.#map = L.map('map').setView([latitude, longitude], 15);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(this.#map);
        this.#map.on("click", this._showForm.bind(this));
    }
    _showForm(mapE) {  //Ne afiseaza forma de unde putem introduce un nou antrenament.
        form.classList.remove("hidden");
        inputDistance.focus();
        this.#mapEvent = mapE;
    }
    _toggleElevationField() {  //Ne afiseaza input-ul specific in functie de ce tip de antrenament alegem("running" sau "cycling").
        inputCadence.closest("div.form__row").classList.toggle("form__row--hidden");
        inputElevation.closest("div.form__row").classList.toggle("form__row--hidden");
    }
    _newWorkout(e) {  //Se creeaza un nou antrenament.
        let {lat, lng} = this.#mapEvent.latlng;
        let workout;
        let distance = +inputDistance.value;
        let duration = +inputDuration.value;
        let type = inputType.value;
        let validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp));
        let allPositive = (...inputs) => inputs.every(inp => inp > 0);
        if (type === "running") {
            let cadence = +inputCadence.value;
            if (!validInputs(distance, duration, cadence) || !allPositive(distance, duration, cadence)) return alert("Inputs have to be positive numbers!");
            workout = new Running([lat, lng], distance, duration, cadence);
        }
        if (type === "cycling") {
            let elevation = +inputElevation.value;
            if (!validInputs(distance, duration, elevation) || !allPositive(distance, duration)) return alert("Inputs have to be positive numbers!");
            workout = new Cycling([lat, lng], distance, duration, elevation);
        }
        this.#workouts.push(workout);

        e.preventDefault();
        inputDistance.focus();
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = "";

        this._renderWorkout(workout);
        this._renderWorkoutMarker(workout);
        this._hideForm();
    }
    _renderWorkoutMarker(workout) {  //Ne afiseaza un marker insotit de un popup pe harta in locul unde am dat click pentru alegerea antrenamentului.
        let month = months[workout.date.getMonth()];
        let date = workout.date.getDate();
        L.marker(workout.coords).addTo(this.#map).bindPopup(L.popup({minWidth: 100, maxWidth: 250, autoClose: false, closeOnClick: false, className: `${workout.type}-popup`})).setPopupContent(`${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"} ${workout.type[0].toUpperCase() + workout.type.slice(1)} on ${month} ${date}`).openPopup();
    }
    _renderWorkout(workout) {  //Ne afiseaza detalii despre antrenamentul adaugat(+ celelalte antrenamente) in fereastra din stanga a aplicatiei.
        let month = months[workout.date.getMonth()];
        let date = workout.date.getDate();
        let html = `
                <li class="workout workout--${workout.type}" data-id="${workout.id}">
                    <h2 class="workout__title">${workout.type[0].toUpperCase() + workout.type.slice(1)} on ${month} ${date}</h2>
                    <div class="workout__details">
                        <span class="workout__icon">${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"}</span>
                        <span class="workout__value">${workout.distance}</span>
                        <span class="workout__unit">km</span>
                    </div>
                    <div class="workout__details">
                        <span class="workout__icon">⏱</span>
                        <span class="workout__value">${workout.duration}</span>
                        <span class="workout__unit">min</span>
                    </div>
                    <div class="workout__details">
                        <span class="workout__icon">⚡️</span>
                        <span class="workout__value">${workout.type === "running" ? workout.pace.toFixed(1) : workout.speed.toFixed(1)}</span>
                        <span class="workout__unit">${workout.type === "running" ? "min/km" : "km/h"}</span>
                    </div>
                    <div class="workout__details">
                        <span class="workout__icon">${workout.type === "running" ? "🦶🏼" : "⛰"}</span>
                        <span class="workout__value">${workout.type === "running" ? workout.cadence : workout.elevationGain}</span>
                        <span class="workout__unit">${workout.type === "running" ? "spm" : "m"}</span>
                    </div>
                </li>`;
        form.insertAdjacentHTML("afterend", html);
    }
    _hideForm() {  //Ne ascunde forma de unde putem introduce un nou antrenament.
        form.classList.add("hidden");
    }
}
let app = new App();
