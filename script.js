// --- REFERENCIAS A ELEMENTOS DEL DOM ---
const canvas = document.getElementById('lienzoJuego');
const ctx = canvas.getContext('2d');
const iniciarBtn = document.getElementById('iniciarBtn');
const cambiarNivelBtn = document.getElementById('cambiarNivelBtn');
const coordenadasDisplay = document.getElementById('coordenadasDiana');
const intentosDisplay = document.getElementById('intentosRestantes');
const mensajeDisplay = document.getElementById('mensajeJuego');
const aInput = document.getElementById('a');
const bInput = document.getElementById('b');
const cInput = document.getElementById('c');

// --- CONFIGURACIÓN DEL JUEGO ---
const anchoCanvas = canvas.width;
const altoCanvas = canvas.height;
const escala = 25;
const centroX = 50;
const centroY = altoCanvas - 50;
const maxYValue = Math.floor((centroY) / escala);

// --- VARIABLES DE ESTADO DEL JUEGO ---
let animacionId;
let x_pelota;
let targetX, targetY;
let juegoActivo = false;
let intentosRestantes = 3;

// --- FUNCIONES DE DIBUJO ---
function dibujarEjes() {
    ctx.beginPath();
    ctx.moveTo(0, centroY);
    ctx.lineTo(anchoCanvas, centroY);
    ctx.moveTo(centroX, 0);
    ctx.lineTo(centroX, altoCanvas);
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.stroke();
}

function dibujarMarcasDiana(x, y) {
    const colorMarca = '#005A9C';
    ctx.strokeStyle = colorMarca;
    ctx.lineWidth = 2;
    const canvasX = centroX + x * escala;
    ctx.beginPath();
    ctx.moveTo(canvasX, centroY - 6);
    ctx.lineTo(canvasX, centroY + 6);
    ctx.stroke();
    const canvasY = centroY - y * escala;
    ctx.beginPath();
    ctx.moveTo(centroX - 6, canvasY);
    ctx.lineTo(centroX + 6, canvasY);
    ctx.stroke();
    ctx.fillStyle = colorMarca;
    ctx.font = 'bold 14px Poppins';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(x, canvasX, centroY + 10);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(y, centroX - 10, canvasY);
}

function dibujarPelota(x, y) {
    ctx.beginPath();
    ctx.arc(centroX + x * escala, centroY - y * escala, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#d9534f'; // Rojo
    ctx.fill();
    ctx.closePath();
}

function dibujarDiana(x, y) {
    ctx.beginPath();
    ctx.arc(centroX + x * escala, centroY - y * escala, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#0275d8'; // Azul
    ctx.fill();
    ctx.strokeStyle = '#005A9C';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
}

// --- FUNCIONES PARA MANEJAR MENSAJES ---
function mostrarMensaje(texto, tipo = 'info') {
    mensajeDisplay.textContent = texto;
    mensajeDisplay.className = ''; // Limpia clases anteriores
    mensajeDisplay.classList.add('visible', tipo);
}

function ocultarMensaje() {
    mensajeDisplay.className = '';
}

// --- FUNCIONES DE LÓGICA DEL JUEGO ---
function generarNuevaDiana() {
    const maxGraphX = (anchoCanvas - centroX) / escala - 2;
    const maxGraphY = maxYValue - 2;
    targetX = Math.floor(Math.random() * (maxGraphX - 5) + 5);
    targetY = Math.floor(Math.random() * (maxGraphY - 3) + 3);
}

function reiniciarNivel() {
    cancelAnimationFrame(animacionId);
    x_pelota = 0;
    juegoActivo = false;
    
    ctx.clearRect(0, 0, anchoCanvas, altoCanvas);
    dibujarEjes();
    dibujarMarcasDiana(targetX, targetY);
    dibujarDiana(targetX, targetY);
    const c = parseFloat(cInput.value) || 0;
    dibujarPelota(0, c);
    
    coordenadasDisplay.textContent = `Objetivo: (X: ${targetX}, Y: ${targetY})`;
    actualizarPantallaIntentos();
}

function actualizarPantallaIntentos() {
    intentosDisplay.textContent = `Intentos: ${intentosRestantes}`;
    iniciarBtn.disabled = (intentosRestantes === 0);
}

function manejarFallo() {
    intentosRestantes--;
    actualizarPantallaIntentos();
    
    if (intentosRestantes > 0) {
        mostrarMensaje("¡Fallaste! Quedan " + intentosRestantes + " intentos.", 'error');
        setTimeout(() => { // Espera para que el mensaje se lea
            ocultarMensaje();
            reiniciarNivel();
        }, 2000);
    } else {
        mostrarMensaje("¡PERDISTE!" + "\n" + "Intenta de Nuevo", 'error');
        // El juego se queda bloqueado hasta presionar "Nuevo Nivel"
    }
}

function animar() {
    if (!juegoActivo) return;

    const a = parseFloat(aInput.value);
    const b = parseFloat(bInput.value);
    const c = parseFloat(cInput.value);

    ctx.clearRect(0, 0, anchoCanvas, altoCanvas);
    dibujarEjes();
    dibujarMarcasDiana(targetX, targetY);
    dibujarDiana(targetX, targetY);

    const y_pelota = a * x_pelota * x_pelota + b * x_pelota + c;
    dibujarPelota(x_pelota, y_pelota);

    const distancia = Math.sqrt(Math.pow(x_pelota - targetX, 2) + Math.pow(y_pelota - targetY, 2));

    if (distancia < 0.7) {
        juegoActivo = false;
        mostrarMensaje("¡GANASTE!", 'exito');
        iniciarBtn.disabled = true;
        return;
    }

    const x_pelota_canvas = centroX + x_pelota * escala;
    if (x_pelota_canvas > anchoCanvas || y_pelota < -5) {
        juegoActivo = false;
        manejarFallo();
        return;
    }

    x_pelota += 0.1;
    animacionId = requestAnimationFrame(animar);
}

// --- EVENT LISTENERS ---
iniciarBtn.addEventListener('click', () => {
    if (juegoActivo || intentosRestantes === 0) return;
    
    if (aInput.value === '' || bInput.value === '' || cInput.value === '') {
        mostrarMensaje("Ingresa valores para a, b y c.", 'info');
        return;
    }
    
    ocultarMensaje(); // Ocultar mensaje al iniciar
    x_pelota = 0;
    juegoActivo = true;
    animar();
});

cambiarNivelBtn.addEventListener('click', () => {
    ocultarMensaje();
    intentosRestantes = 3;
    generarNuevaDiana();
    reiniciarNivel();
});

cInput.addEventListener('input', () => {
    let cValue = parseFloat(cInput.value);
    if (!isNaN(cValue)) {
        if (cValue > maxYValue) cInput.value = maxYValue;
        else if (cValue < 0) cInput.value = 0;
    }
    if (!juegoActivo) {
        reiniciarNivel();
    }
});

// --- ESTADO INICIAL AL CARGAR LA PÁGINA ---
cInput.setAttribute('max', maxYValue);
generarNuevaDiana();
reiniciarNivel();
