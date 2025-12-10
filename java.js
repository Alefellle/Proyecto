document.addEventListener('DOMContentLoaded', function() {
    // ANIMACIÓN DE CONTEO EN TROFEOS (palmares) MEJORADA
    const trofeos = document.querySelectorAll('.trofeo-numero');
    trofeos.forEach(trofeo => {
        const final = parseInt(trofeo.textContent);
        trofeo.textContent = '0';
        let actual = 0;
        const duracion = 1200;
        const fps = 60;
        const totalFrames = Math.round((duracion / 1000) * fps);
        let frame = 0;
        const easeOutBounce = t => {
            if (t < (1/2.75)) {
                return 7.5625*t*t;
            } else if (t < (2/2.75)) {
                t -= (1.5/2.75);
                return 7.5625*t*t + 0.75;
            } else if (t < (2.5/2.75)) {
                t -= (2.25/2.75);
                return 7.5625*t*t + 0.9375;
            } else {
                t -= (2.625/2.75);
                return 7.5625*t*t + 0.984375;
            }
        };
        function animate() {
            frame++;
            let progress = frame / totalFrames;
            let val = Math.round(final * easeOutBounce(progress > 1 ? 1 : progress));
            trofeo.textContent = val;
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                trofeo.textContent = final;
                trofeo.classList.add('rebote-trofeo');
                // SONIDO OPCIONAL (descomentar si tienes un archivo de sonido)
                // let audio = new Audio('celebracion.mp3'); audio.play();
                setTimeout(()=>trofeo.classList.remove('rebote-trofeo'), 800);
            }
        }
        setTimeout(animate, 300);
    });

    // TOOLTIP ANIMADO EN NOMBRES DE EQUIPOS (tabla clasificacion) MEJORADO
    const equipoCeldas = document.querySelectorAll('.tabla-pro td:nth-child(2), .tabla-pro th:nth-child(2)');
    equipoCeldas.forEach(celda => {
        const nombre = celda.textContent.trim();
        if (!nombre || nombre === 'Equipo') return;
        celda.classList.add('equipo-tooltip');
        // Buscar la posición si está en la misma fila
        let pos = '';
        if (celda.parentElement && celda.parentElement.children[0] && celda.parentElement.children[0] !== celda) {
            pos = celda.parentElement.children[0].textContent.trim();
        }
        celda.setAttribute('data-tooltip', `ℹ️ ${nombre}${pos ? ' (Posición: ' + pos + ')' : ''}`);
    });
    
    // 1. MODO OSCURO
    const temaGuardado = localStorage.getItem("temaLiga");
    const cuerpo = document.body;
    const boton = document.getElementById("btnTema");

    if (temaGuardado === "oscuro") {
        cuerpo.classList.add("dark-mode");
        if(boton) boton.innerHTML = "☀️ Claro";
    }

    if (boton) {
        boton.addEventListener("click", function() {
            cuerpo.classList.toggle("dark-mode");
            if (cuerpo.classList.contains("dark-mode")) {
                localStorage.setItem("temaLiga", "oscuro");
                boton.innerHTML = "☀️ Claro";
            } else {
                localStorage.setItem("temaLiga", "claro");
                boton.innerHTML = "🌙 Oscuro";
            }
        });
    }

    // (Eliminado: animación de conteo duplicada, ahora mejorada más abajo)

    // 2. ANIMACIÓN SCROLL
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) entry.target.classList.add('show');
        });
    });
    document.querySelectorAll('.hidden').forEach((el) => observer.observe(el));

    // 3. CARRUSEL
    const sliderWrapper = document.querySelector('.slider-wrapper');
    if (sliderWrapper) {
        let slideIndex = 0;
        const slides = document.querySelectorAll('.slide');
        setInterval(() => {
            slideIndex++;
            if (slideIndex >= slides.length) slideIndex = 0;
            sliderWrapper.style.transform = `translateX(-${slideIndex * 100}%)`;
        }, 5000);
    }

    // 4. CUENTA ATRÁS
    const reloj = document.getElementById("reloj");
    if (reloj) {
        const fechaPartido = new Date("Dec 10, 2025 21:00:00").getTime();
        const intervalo = setInterval(function() {
            const ahora = new Date().getTime();
            const distancia = fechaPartido - ahora;
            const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
            const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
            const segundos = Math.floor((distancia % (1000 * 60)) / 1000);
            reloj.innerHTML = `<div class="tiempo-unidad">${dias}<span>Días</span></div> : <div class="tiempo-unidad">${horas}<span>Horas</span></div> : <div class="tiempo-unidad">${minutos}<span>Min</span></div> : <div class="tiempo-unidad">${segundos}<span>Seg</span></div>`;
            if (distancia < 0) { clearInterval(intervalo); reloj.innerHTML = "¡PARTIDO EN JUEGO!"; }
        }, 1000);
    }

    // 5. ORDENAR TABLA
    const headers = document.querySelectorAll('th');
    const tableBody = document.querySelector('tbody');
    if (headers.length > 0 && tableBody) {
        headers.forEach((header, index) => {
            header.addEventListener('click', () => {
                const rows = Array.from(tableBody.querySelectorAll('tr'));
                const esNumerico = index > 1; 
                const multiplicador = header.classList.contains('asc') ? 1 : -1;
                rows.sort((rowA, rowB) => {
                    const celdaA = rowA.children[index].innerText;
                    const celdaB = rowB.children[index].innerText;
                    if (esNumerico) return (parseInt(celdaA) - parseInt(celdaB)) * multiplicador;
                    else return celdaA.localeCompare(celdaB) * multiplicador;
                });
                header.classList.toggle('asc');
                rows.forEach(row => tableBody.appendChild(row));
            });
        });
    }

    // 6. ACORDEÓN FAQ (NUEVO)
    const faqs = document.querySelectorAll(".faq-question");
    faqs.forEach(pregunta => {
        pregunta.addEventListener("click", () => {
            const item = pregunta.parentElement;
            item.classList.toggle("active");
        });
    });
});

// 7. FUNCIÓN DE VALIDACIÓN (RESTAURADA FUERA DEL DOMContentLoaded)
function validarFormulario(event) {
    event.preventDefault();
    const nombre = document.getElementById("nombre");
    const email = document.getElementById("email");
    const departamento = document.getElementById("departamento");
    const mensaje = document.getElementById("mensaje");
    const politica = document.getElementById("politica");
    let hayErrores = false;

    // Limpiar errores previos
    document.querySelectorAll('.error-msg').forEach(el => el.innerText = '');
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));

    // Validaciones
    if (nombre.value.trim() === "") {
        document.getElementById("error-nombre").innerText = "⚠️ Nombre obligatorio.";
        nombre.classList.add("input-error");
        hayErrores = true;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
        document.getElementById("error-email").innerText = "⚠️ Email inválido.";
        email.classList.add("input-error");
        hayErrores = true;
    }
    if (departamento.value === "") {
        document.getElementById("error-dep").innerText = "⚠️ Selecciona departamento.";
        departamento.classList.add("input-error");
        hayErrores = true;
    }
    if (mensaje.value.length < 10) {
        document.getElementById("error-mensaje").innerText = "⚠️ Mensaje muy corto.";
        mensaje.classList.add("input-error");
        hayErrores = true;
    }
    if (!politica.checked) {
        document.getElementById("error-politica").innerText = "⚠️ Acepta la política.";
        hayErrores = true;
    }

    if (!hayErrores) {
        const boton = document.getElementById("btnEnviar");
        const form = document.getElementById("formContacto");
        const exito = document.getElementById("mensajeExito");
        
        boton.innerHTML = 'Enviando...';
        boton.disabled = true;

        setTimeout(() => {
            form.style.display = "none";
            exito.style.display = "block";
        }, 1500);
    }
}
/* --- BOTÓN VOLVER ARRIBA (Scroll) --- */

// Detectar cuando el usuario hace scroll
window.onscroll = function() { mostrarBotonSubir() };

function mostrarBotonSubir() {
    let boton = document.getElementById("btnSubir");
    // Si bajamos más de 300px, mostramos el botón
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        if(boton) boton.style.display = "block";
    } else {
        if(boton) boton.style.display = "none";
    }
}

// Función para subir suavemente
function subirArriba() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}