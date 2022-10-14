const resultado = document.getElementById("resultado");
const local = document.getElementById("local");
const titulo = document.getElementById("titulo");
const input = document.getElementById("input_ciudad");
const btn = document.getElementById("buscador");
const form = document.querySelector("form");
const tituloHistorico = document.getElementById("tituloHistorico");
console.log(form);
console.log(resultado);
console.log(btn);
let ciudadRepetida = 0;
let datosLocalStorage = [];
const api_key = "8c8666d68069a9c8cd452639cf67f692";
const unidad_temperatura = "metric";
let map;

// se escucha click para iniciar solicitud

btn.addEventListener("click", (e) => {
  //se chequea que estoy en el click
  console.log("entre al click");

  // se previene comportamiento por defecto del browser de recargar la página
  e.preventDefault();

  // se válida el value del input que no esté vacío y que no sea un número.

  if (input.value !== "" && isNaN(input.value)) {
    var city_name = input.value;
    form.reset();

    console.log(city_name);
    console.log(api_key);
    console.log(unidad_temperatura);

    // se hace la solicitud a la API

    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city_name}&appid=${api_key}&units=${unidad_temperatura}`
    )
      .then((resp) => {
        return resp.json(); // retorno al siguiente then el response como json
      })

      .then((json) => {
        console.log(json);

        // se llama a la función para mostrar el clima de la api se le pasa como parámetro el json de respuesta.
        datosMostrarClima(json);

        // iniciamos mapa, se copia lo de google maps, solo se inicia en caso que tengan valores válidos la latitud y longitud.

        if (latitud && longitud) {
          initMap(latitud, longitud);
        }
      })
      // se agarra el error en la solicitud por si algo sale mal.
      .catch(
        () =>
          (titulo.innerHTML = ` <p class=" text-danger"> No hemos obtenido resultados. Verifique lo ingresado y realice nuevamente una búsqueda SOY EL CATCH
  
      </p>`)
      );
  } else {
    // en caso que esté vacío o sea número sale este mensaje.

    titulo.innerHTML = ` <p class=" text-danger"> Debe ingresar el nombre de un país o ciudad válido.  </p>`;
  }
});

// se escucha evento de carga de página para levantar el localstorage (las búsquedas históricas)

document.addEventListener("DOMContentLoaded", () => {
  // se chequea que hay en local storage
  console.log(datosLocalStorage);

  // se vacía el array de los datos de local storage, donde se guardan previamente antes de enviarlos al LS.

  datosLocalStorage = [];

  // recupero local storage en caso que tenga datos guardados, lo muestro.

  if (localStorage.getItem("data")) {
    datosLocalStorage = JSON.parse(localStorage.getItem("data")); // se parsean y obtienen los datos de LC. se guardan en array.

    console.log(datosLocalStorage);
  }

  // se llama a la funcióin mostrarClima y se pasa como parámetro los datos parseados de LS.

  mostrarClima(datosLocalStorage);
});

// funcion para mostrar datos de la api, se pasa parametro, reciben el json de la respuesta de la api.
function datosMostrarClima(data) {
  console.log(datosLocalStorage);

  // se utiliza la desestructuración que es una expresión de JS que permite desempacar valores de arreglos o propiedades de objetos en distintas variables.
  const {
    name,
    main: { temp, feels_like, temp_min, temp_max, humidity, pressure },
    wind: { deg, speed },
    weather: [array],
    coord: { lon, lat },
  } = data;

  console.log(data);
  console.log(data.name);

  // se parsean lat y longitud, para asegurar que tenga un typeof number. (no funcionaba directo)
  latitud = parseFloat(lat);
  longitud = parseFloat(lon);

  // se realiza una iteración por el array qye guarda los datos en local storage para evitar guardar un dato repetido.

  datosLocalStorage.forEach((item) => {
    // se comparan nombres de las ciudades del objeto que viene de la api y de los objetos que están en el array que viene de local storage.
    if (item.name == data.name) {
      // en caso que encuentre una igualdad la variable inicializada al principio con valor cero, acumula 1.
      ciudadRepetida++;
    }
  });

  // se chequea valor de ciudadRepetida
  console.log(ciudadRepetida);

  // si ciudad Repetida es menor a 1, es porque no se encuentra en el array de objetos que viene de local storage, se procede a pushearla a dicho array para pasarlo a local storage
  if (ciudadRepetida < 1) {
    datosLocalStorage.push(data);

    // para guardar datos en local storage se debe hacer un stringify "hacer string los datos"
    localStorage.setItem("data", JSON.stringify(datosLocalStorage));
  }

  // tal vez es redudante, pero si llego hasta acá la info de la api, debiera tener cód. 200, se re chequea y se pasan los inner html con los resultados.

  if (data.cod == 200) {
    titulo.innerHTML =
      //html

      `

  <p class="fs-2 text-blue"> Resultados obtenidos

  </p>
  `;

    resultado.innerHTML =
      //html

      ` 

  <div class="col-6 mx-auto mb-4 p-1">
  <div class="card" id="apiClima">

    <div class="card-body ps-5 pe-5 pb-0">
    <img src="./img/iconos/${data.weather[0].icon}.png" class="img-fluid" alt="icono clima">

      <div class="d-flex justify-content-between ps-5 pe-5">
        <p class="mb-0 h5 fs-3">${temp} ºC</p>
        <p class="mb-0  fs-3">${name}</p>
      </div>
    </div>
    <hr />
    <div class="card-body pt-0 ps-5 pe-5">
      <p class="mb-0">Sensación Térmica: ${feels_like}ºC  </p>
      <p class="mb-0">Min: ${temp_min}ºC</p>
      <p class="mb-0">Max: ${temp_max}ºC</p>
      <p class="mb-0">Humedad: ${humidity}%</p>
      <p class="mb-0">Presión Atmosférica: ${pressure} hPa</p>
      <p class="mb-0">Vientos: Vel: ${speed} km/h y Dir: ${deg}º</p>

    </div>
    <div id="map"></div>

  </div>
</div>
  
  
  
  
  `;
  } else {
    // si el cod de la ciudad no es 200 se muestra otro resultado.
    resultado.innerHTML = `    <p class="text-blue"> No hemos encontrado ningún resultado. Por favor intente nuevamente</p>
  `;
  }
}

// descripción de la función de google maps para la solicitud. se copia tal cual como indica su documentación.

function initMap(latitud, longitud) {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: parseFloat(latitud), lng: parseFloat(longitud) },
    zoom: 8,
  });
}

// la función de mostrar clima que recibe los datos de local storage y carga con el evento de carga de página.

function mostrarClima(data) {
  tituloHistorico.innerHTML = `  <p class="fs-2 text-blue my-4"> Resultados históricos

  </p>
  `;

  data.forEach((item) => {
    local.innerHTML +=
      //html
      ` 
     
  <div class="col-lg-4 p-1 text-light">
  <div class="card" id="localClima">

    <div class="card-body pb-0">
    <img src="./img/iconos/${item.weather[0].icon}.png " alt="icono clima">
      <div class="d-flex justify-content-between">
        <p class="mb-0 h5">${item.main.temp} ºC</p>
        <p class="mb-0 hour fs-3">${item.name}</p>
      </div>
    </div>
    <hr />
    <div class="card-body pt-0">
      <p class="mb-0">Sensación Térmica: <span class="fw-bold">${item.main.feels_like}ºC </span> </p>
      <p class="mb-0">Min: ${item.main.temp_min}ºC</p>
      <p class="mb-0">Max: ${item.main.temp_max}ºC</p>
      <p class="mb-0">Humedad: ${item.main.humidity}%</p>
      <p class="mb-0">Presión Atmosférica: ${item.main.pressure} hPa</p>
      <p class="mb-0">Vientos: Vel: ${item.wind.speed} km/h y Dir: ${item.wind.deg}º</p>

    </div>
    
  </div>
</div>
  
  
  
  
  `;
  });
}
