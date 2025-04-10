'use strict';


const form = document.querySelector('.form')
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
let inputDistance = document.querySelector('.form__input--distance');
let inputDuration = document.querySelector('.form__input--duration');
let inputCadence = document.querySelector('.form__input--cadence');
let inputElevation = document.querySelector('.form__input--elevation')
 
    


class Workout{
  date = new Date();
  id = Date.now() + ''.slice(-10) 

  constructor(coords,distance,duration){
    this.coords = coords
    this.distance = distance  // for calculation in km
    this.duration = duration // for calculation in min
    this._setDescription()
  }
  _setDescription (){
   // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${this.date.getMonth()}${this.date.getDate()}`
  }
}

class Running extends Workout{
   
  constructor(coords,distance,duration,cadence){
    super(coords,distance,duration)
    this.cadence = cadence
    this.calcPase();
    this._setDescription()
  }
  
  calcPase(){
    // calculated by min/km
    this.pace = this.duration / this.distance
    return this.pace

  }
  
}

class Cycling extends Workout{
  constructor(coords,distance,duration,elevationGain){
    super(coords,distance,duration)
      this.elevationGain = elevationGain
      this.speed();
      this._setDescription()

  }
 speed(){
  this.speed = this.distance / (this.duration /60)
  return this.speed
 }
   
}  
  


// Application Architecture


class App {

   #map;
  #mapEvent;
  #workout =[];
  constructor(){
    
    this._getPosition()
    inputType.addEventListener('change',this._toggleElevationField.bind(this))
    form.addEventListener('submit',this._newWorkout.bind(this))
    
  }



  _getPosition(){
   
    if(navigator.geolocation)
      {
    navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),function()
    {
      console.log('click')

    }),
    function(){
      alert('Enable location')
    }
    }
   }



  _loadMap(position){
    const {latitude,longitude} = position.coords  // destructuring
       let coords = [latitude,longitude]
       this.#map = L.map('map').setView(coords, 13) // here is the 13 zooming the map 
        // map inside the bracket must need id not class of map html
    
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
         attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);
    
      
       
    
      this.#map.on('click',this._showForm.bind(this),function(){

      })
      this.#map.on('click',this._showMarker.bind(this),function(){

     })
         
    }
  
  

  _showForm(e){
    form.classList.remove('hidden')
    inputDistance.focus()
    
    


    
    
  }
 

  _toggleElevationField()
  { inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
  
  }
  _newWorkout(event){
    event.preventDefault();
     const {lat,lng}= this.#mapEvent.latlng
     const latlng = {lat,lng}
  
     // validation of each data from input is number
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp))

   
     // validation of each data is positive number
    const positiveInputs = (...inputs) => inputs.every(inp => (inp > 0))
    

   // Getting data from form
   const type = inputType.value
   const distance  = +inputDistance.value
   const duration = +inputDuration.value
   console.log(type,distance,duration)

   // putting the marker on the map based on type eg:running or cycling

   L.marker(latlng).addTo(this.#map)
   .bindPopup(L.popup
       ({
       
           className:`${type}-popup`

       }))
       .setPopupContent(`${type}`)
         .openPopup();
  

  

   //  checking the type to validate and change the input form running - cadence and cycling - elevationGain

if(type === 'running')
  {
  const cadence = +inputCadence.value
  // check valid data 
 if(!validInputs(distance,duration,cadence) ||  !positiveInputs(distance,duration,cadence))
  {
    alert('Numbers must be positive')
  }
  const workout = new Running([lat,lng],distance,duration,cadence)
  this.#workout.push(workout)
  this.renderWorkout(workout)
  
 }



if(type ==='cycling')
{
  const elevationGain = +inputElevation.value
  if(!validInputs(distance,duration,elevationGain) || !positiveInputs(distance,duration,elevationGain))
    
    {
      alert('Numbers must be positive')
    }
    const workout = new Running([lat,lng],distance,duration,elevationGain)
    this.#workout.push(workout)
    console.log(workout)
    this.renderWorkout(workout)
}

inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';



 
  }

_renderWorkout(workout){

  let html = ` 
  <li class="workout workout--${type}" data-id="1234567890">
          <h2 class="workout__title">Running on April 14</h2>
          <div class="workout__details">
            <span class="workout__icon">🏃‍♂️</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
           `;
          if(workout.type ==='running')
          {
            html+=`<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
          </li>`
          ;}
          if(workout.type ==='cycling')
          {
            html += `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li> `
          }
      
          form.insertAdjacentHTML('afterend',html);

}



  _showMarker(e){

    this.#mapEvent = e
    const {lat,lng} = this.#mapEvent.latlng
    let currentCoords = [lat,lng]
    
    L.marker(currentCoords).addTo(this.#map)
    .bindPopup(L.popup
        ({
        
            
 
        }))
        .setPopupContent('workout')
          .openPopup();
   
 
 
   }
  

   
  

  

}

  const app = new App();
  