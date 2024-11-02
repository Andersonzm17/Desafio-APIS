
const monedaSelect = document.getElementById("moneda");
const montoInput = document.getElementById("monto");
const resultadoDiv = document.getElementById("resultado");
const convertirBtn = document.getElementById("convertirBtn"); 
const ctx = document.getElementById("grafico").getContext("2d");
let chart;


async function obtenerTiposDeCambio() {
  try {
    const response = await fetch("https://mindicador.cl/api");
    if (!response.ok) throw new Error("Error en la respuesta de la API");
    const data = await response.json();
    return {
      dolar: data.dolar.valor,
      euro: data.euro.valor,
    };
  } catch (error) {
    resultadoDiv.textContent = `Error al obtener datos: ${error.message}`;
  }
}


async function convertirMoneda() {
  const tiposDeCambio = await obtenerTiposDeCambio();
  const monto = parseFloat(montoInput.value);
  const monedaSeleccionada = monedaSelect.value;

  if (isNaN(monto) || !tiposDeCambio) return;

  let cambio = 0;
  if (monedaSeleccionada === "dolar") {
    cambio = monto / tiposDeCambio.dolar;
  } else if (monedaSeleccionada === "euro") {
    cambio = monto / tiposDeCambio.euro;
  }

  resultadoDiv.textContent = `Resultado: $${cambio.toFixed(2)} `;

  actualizarGrafico(monedaSeleccionada); 
}


async function obtenerDatosHistoricos(moneda) {
  try {
    const response = await fetch(`https://mindicador.cl/api/${moneda}`);
    if (!response.ok) throw new Error("Error al obtener los datos de la API");
    const data = await response.json();
    const serie = data.serie.slice(0, 10).reverse(); 
    return serie;
  } catch (error) {
    resultadoDiv.textContent = `Error al obtener datos históricos: ${error.message}`;
    return null;
  }
}


async function actualizarGrafico(moneda) {
  const datos = await obtenerDatosHistoricos(moneda);
  if (!datos) return;

  const etiquetas = datos.map((d) => new Date(d.fecha).toLocaleDateString());
  const valores = datos.map((d) => d.valor);

  if (chart) {
    chart.destroy(); 
  }

  
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: etiquetas,
      datasets: [
        {
          label: `Valor histórico del ${moneda}`,
          data: valores,
          borderColor: "rgba(0, 128, 0, 1)",
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          fill: true,
          tension: 0.1,
        },
      ],
    },
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: "Fecha",
          },
        },
        y: {
          title: {
            display: true,
            text: "Valor en pesos chilenos",
          },
        },
      },
    },
  });
}

convertirBtn.addEventListener("click", convertirMoneda);


window.addEventListener("load", () => {
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Seleccione una moneda para ver el gráfico",
          data: [],
          borderColor: "rgba(0, 128, 0, 1)",
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          fill: true,
          tension: 0.1,
        },
      ],
    },
    options: {
      scales: {
        x: {
          title: { display: true, text: "Fecha" },
        },
        y: {
          title: { display: true, text: "Valor en pesos chilenos" },
        },
      },
    },
  });
});