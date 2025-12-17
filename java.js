document.addEventListener('DOMContentLoaded', function() {
    
// ... definición de datosEquipos ...

    // INICIAR TABLA AUTOMÁTICAMENTE
    renderizarTabla(); 

    // ... resto del código ...
    
    // --- DATOS MAESTROS DE EQUIPOS ---
    // Esta lista permite que los favoritos se muestren en cualquier página (Inicio, Historia, etc.)
    // aunque no esté la tabla presente.
    const datosEquipos = [
        { pos: 1, nombre: 'Arsenal FC', pts: 38 },
        { pos: 2, nombre: 'Manchester City', pts: 35 },
        { pos: 3, nombre: 'FC Barcelona', pts: 32 },
        { pos: 4, nombre: 'Real Madrid', pts: 31 },
        { pos: 5, nombre: 'Bayern München', pts: 29 },
        { pos: 6, nombre: 'Liverpool FC', pts: 28 },
        { pos: 7, nombre: 'Paris Saint-Germain', pts: 26 },
        { pos: 8, nombre: 'Inter de Milán', pts: 25 },
        { pos: 9, nombre: 'Juventus', pts: 24 },
        { pos: 10, nombre: 'AC Milan', pts: 20 },
        { pos: 11, nombre: 'Atlético de Madrid', pts: 20 },
        { pos: 12, nombre: 'Chelsea FC', pts: 19 },
        { pos: 13, nombre: 'Borussia Dortmund', pts: 18 },
        { pos: 14, nombre: 'Manchester United', pts: 17 },
        { pos: 15, nombre: 'Benfica', pts: 15 },
        { pos: 16, nombre: 'Athletic Bilbao', pts: 14 },
        { pos: 17, nombre: 'Napoli', pts: 13 },
        { pos: 18, nombre: 'Ajax Amsterdam', pts: 11 },
        { pos: 19, nombre: 'FC Porto', pts: 8 },
        { pos: 20, nombre: 'Olympique Marseille', pts: 5 }
    ];

    // ==========================================
    // ⬇️ PEGA ESTO JUSTO DEBAJO DE LA LISTA DE EQUIPOS ⬇️
    // ==========================================
    
    // Referencias al HTML
    const selectLocal = document.getElementById('simLocal');
    const selectVisitante = document.getElementById('simVisitante');
    const btnSimular = document.getElementById('btnSimular');
    const divResultado = document.getElementById('resultadoSimulacion');

    // 1. Rellenar los selectores con los equipos
    if (selectLocal && selectVisitante) {
        // Ordenamos alfabéticamente para que sea más fácil buscar
        const equiposOrdenados = [...datosEquipos].sort((a, b) => a.nombre.localeCompare(b.nombre));
        
        equiposOrdenados.forEach(equipo => {
            // Opción para el Local
            const optionL = document.createElement('option');
            optionL.value = equipo.nombre;
            optionL.textContent = equipo.nombre;
            selectLocal.appendChild(optionL);

            // Opción para el Visitante
            const optionV = document.createElement('option');
            optionV.value = equipo.nombre;
            optionV.textContent = equipo.nombre;
            selectVisitante.appendChild(optionV);
        });
    }

   // ==========================================
    // 3. SIMULADOR + APUESTAS PRO (CUOTAS DINÁMICAS)
    // ==========================================
    
    // Variables para guardar las cuotas actuales
    let currentCuota1 = 2.0;
    let currentCuotaX = 3.0;
    let currentCuota2 = 2.0;

    // A) GESTIÓN DEL SALDO
    let saldo = parseInt(localStorage.getItem('superliga_saldo'));
    if (isNaN(saldo)) saldo = 100; 

    const saldoDisplay = document.getElementById('saldoUsuario');
    if (saldoDisplay) saldoDisplay.textContent = saldo;

    function actualizarSaldo(nuevoSaldo) {
        saldo = nuevoSaldo;
        localStorage.setItem('superliga_saldo', saldo);
        if (saldoDisplay) {
            saldoDisplay.textContent = saldo;
            // Efecto visual de cambio
            saldoDisplay.style.color = (nuevoSaldo > parseInt(saldoDisplay.textContent)) ? '#2ecc71' : '#e74c3c';
            // En la barra verde, forzamos color blanco/amarillo para que se vea
            saldoDisplay.style.textShadow = "0 0 10px #fff"; 
            setTimeout(() => {
                saldoDisplay.style.color = '';
                saldoDisplay.style.textShadow = '';
            }, 500);
        }
    }

    // --- NUEVO: LÓGICA DEL BOTÓN RECARGAR ---
    const btnRecargar = document.getElementById('btnRecargar');
    if (btnRecargar) {
        btnRecargar.addEventListener('click', () => {
            actualizarSaldo(saldo + 100);
            mostrarToast("💰 ¡Recarga exitosa! +100€");
            
            // Animación extra del botón
            btnRecargar.style.transform = "rotate(360deg)";
            setTimeout(() => btnRecargar.style.transform = "", 300);
        });
    }
    // ----------------------------------------

    // B) FUNCIÓN PARA CALCULAR CUOTAS REALISTAS
    function calcularYMostrarCuotas() {
        const localVal = document.getElementById('simLocal').value;
        const visitVal = document.getElementById('simVisitante').value;

        // Referencias a los labels de los radio buttons
        const label1 = document.querySelector('input[value="1"]').parentElement;
        const labelX = document.querySelector('input[value="X"]').parentElement;
        const label2 = document.querySelector('input[value="2"]').parentElement;

        if (!localVal || !visitVal || localVal === visitVal) {
            // Si no hay equipos válidos, resetear textos
            label1.innerHTML = `<input type="radio" name="apuesta" value="1" checked> Local (-)`;
            labelX.innerHTML = `<input type="radio" name="apuesta" value="X"> Empate (-)`;
            label2.innerHTML = `<input type="radio" name="apuesta" value="2"> Visitante (-)`;
            return;
        }

        // Obtener datos
        const stats1 = datosEquipos.find(e => e.nombre === localVal);
        const stats2 = datosEquipos.find(e => e.nombre === visitVal);

        // --- ALGORITMO DE CUOTAS ---
        // Basado en diferencia de puntos
        const diferencia = stats1.pts - stats2.pts; 

        // Probabilidad base (50% - 50%)
        let prob1 = 0.35; 
        let prob2 = 0.35;
        let probX = 0.30; // 30% probabilidad de empate base

        // Ajustar probabilidad según puntos (Cada punto de diferencia mueve un 1.5% la probabilidad)
        const ajuste = diferencia * 0.015; 
        
        prob1 += ajuste;
        prob2 -= ajuste;

        // Factor Campo (Pequeña ventaja local del 5%)
        prob1 += 0.05;
        prob2 -= 0.05;

        // Limites de seguridad (para que no de negativo)
        if (prob1 < 0.1) prob1 = 0.1;
        if (prob2 < 0.1) prob2 = 0.1;
        if (prob1 > 0.8) prob1 = 0.8;
        if (prob2 > 0.8) prob2 = 0.8;

        // Recalcular empate basado en lo igualados que estén
        probX = 1 - (prob1 + prob2);
        if (probX < 0.1) probX = 0.15; // Mínimo de empate

        // Convertir Probabilidad a Cuota (Cuota = 1 / Probabilidad * margen casa)
        // Margen de la casa del 10% (x0.9)
        currentCuota1 = (1 / prob1 * 0.9).toFixed(2);
        currentCuota2 = (1 / prob2 * 0.9).toFixed(2);
        currentCuotaX = (1 / probX * 0.9).toFixed(2);

        // Actualizar el HTML visualmente
        label1.innerHTML = `<input type="radio" name="apuesta" value="1" checked> ${localVal} (x${currentCuota1})`;
        labelX.innerHTML = `<input type="radio" name="apuesta" value="X"> Empate (x${currentCuotaX})`;
        label2.innerHTML = `<input type="radio" name="apuesta" value="2"> ${visitVal} (x${currentCuota2})`;
    }

    // Eventos para recalcular cuotas cuando cambias de equipo
    if (document.getElementById('simLocal')) {
        document.getElementById('simLocal').addEventListener('change', calcularYMostrarCuotas);
        document.getElementById('simVisitante').addEventListener('change', calcularYMostrarCuotas);
    }

    // C) LÓGICA DEL BOTÓN JUGAR
    if (btnSimular) {
        // Clonamos para limpiar eventos viejos
        const nuevoBtn = btnSimular.cloneNode(true);
        btnSimular.parentNode.replaceChild(nuevoBtn, btnSimular);
        
        nuevoBtn.addEventListener('click', () => {
            const localVal = document.getElementById('simLocal').value;
            const visitVal = document.getElementById('simVisitante').value;
            const inputDinero = document.getElementById('cantidadApuesta');
            const cantidadApostada = parseInt(inputDinero.value) || 0;

            // VALIDACIONES
            if (!localVal || !visitVal || localVal === visitVal) {
                mostrarToast("Selecciona equipos válidos", "error");
                return;
            }
            if (cantidadApostada > saldo) {
                mostrarToast(`Saldo insuficiente (${saldo}€)`, "error");
                return;
            }
            if (cantidadApostada < 0) return;

            

// --- SIMULACIÓN DEL PARTIDO V3 (ANTI-GOLEADAS) ---
            const stats1 = datosEquipos.find(e => e.nombre === localVal);
            const stats2 = datosEquipos.find(e => e.nombre === visitVal);

            // 1. Calcular "Fuerza Base" pero con un LÍMITE (Tope)
            // Usamos Math.min para que la fuerza por puntos nunca supere 2.5
            // Así, aunque tengan 100 puntos, no meterán 10 goles.
            let potencia1 = Math.min(stats1.pts / 20, 2.5); 
            let potencia2 = Math.min(stats2.pts / 20, 2.5);

            // 2. Factor Aleatorio (La "suerte" del día) - Entre 0 y 2 goles extra
            let suerte1 = Math.random() * 2.0;
            let suerte2 = Math.random() * 2.0;

            // 3. Ventaja Local (Sutil, solo 0.3 goles extra)
            potencia1 += 0.3;

            // 4. Cálculo final de goles (Redondeado hacia abajo)
            let goles1 = Math.floor(potencia1 + suerte1);
            let goles2 = Math.floor(potencia2 + suerte2);

            // 5. FRENO DE EMERGENCIA (Opcional)
            // Para evitar resultados tipo 7-1 o 8-0 si se da una casualidad matemática extrema
            if(goles1 > 5 && Math.random() > 0.2) goles1 = 5; // 80% prob de bajar a 5 si se pasa
            if(goles2 > 5 && Math.random() > 0.2) goles2 = 5;

            // (El resto del código de actualizar DB y mostrar resultados sigue igual...)
            // ACTUALIZAR DB
            stats1.pj++; stats1.gf += goles1; stats1.gc += goles2;
            stats2.pj++; stats2.gf += goles2; stats2.gc += goles1;
            
            // ... sigue con tu código de if(goles1 > goles2)...

            // ACTUALIZAR DB
            stats1.pj++; stats1.gf += goles1; stats1.gc += goles2;
            stats2.pj++; stats2.gf += goles2; stats2.gc += goles1;

            if (goles1 > goles2) {
                stats1.pts += 3; stats1.pg++; stats2.pp++;
            } else if (goles2 > goles1) {
                stats2.pts += 3; stats2.pg++; stats1.pp++;
            } else {
                stats1.pts += 1; stats1.pe++; stats2.pts += 1; stats2.pe++;
            }
            
            localStorage.setItem('superliga_db', JSON.stringify(datosEquipos));
            if (typeof renderizarTabla === "function") renderizarTabla(); 

// RESULTADO VISUAL
            const divRes = document.getElementById('resultadoSimulacion');
            divRes.classList.add('resultado-visible');
            document.getElementById('scoreLocal').textContent = goles1;
            document.getElementById('scoreVisitante').textContent = goles2;
            
            let comentario = goles1 > goles2 ? `¡Gana ${localVal}!` : (goles2 > goles1 ? `¡Gana ${visitVal}!` : "¡Empate!");
            
            // 1. LLAMADA A NARRATIVA (Funcionalidad 5)
            // Generamos el HTML de la alineación
            const htmlNarrativa = generarNarrativa(localVal, visitVal); 
            
            const divComentario = document.getElementById('comentarioPartido');
            divComentario.textContent = comentario; // Ponemos el texto principal
            divComentario.insertAdjacentHTML('beforeend', htmlNarrativa); // Agregamos la caja gris debajo



            // --- RESOLVER APUESTA CON CUOTAS DINÁMICAS ---

            // --- RESOLVER APUESTA CON CUOTAS DINÁMICAS ---

            // --- RESOLVER APUESTA CON CUOTAS DINÁMICAS ---
            const resultadoApuestaEl = document.getElementById('resultadoApuesta');

            if (cantidadApostada > 0) {
                const opcionElegida = document.querySelector('input[name="apuesta"]:checked').value;
                let resultadoReal = 'X';
                if (goles1 > goles2) resultadoReal = '1';
                else if (goles2 > goles1) resultadoReal = '2';

                if (opcionElegida === resultadoReal) {
                    // GANADOR: Usamos la cuota que calculamos antes
                    let cuotaAplicada = 1.0;
                    if (resultadoReal === '1') cuotaAplicada = parseFloat(currentCuota1);
                    if (resultadoReal === 'X') cuotaAplicada = parseFloat(currentCuotaX);
                    if (resultadoReal === '2') cuotaAplicada = parseFloat(currentCuota2);

                    let ganancia = Math.floor(cantidadApostada * cuotaAplicada);
                    let beneficio = ganancia - cantidadApostada;
                    
                    actualizarSaldo(saldo + beneficio);
                    
                    resultadoApuestaEl.innerHTML = `¡Ganaste! Cuota x${cuotaAplicada}. Ganas +${beneficio}€`;
                    resultadoApuestaEl.style.color = "#27ae60"; 
                    if(typeof crearConfeti === 'function') crearConfeti();
                } else {
                    // PERDEDOR
                    actualizarSaldo(saldo - cantidadApostada);
                    resultadoApuestaEl.innerHTML = `Perdiste. Pierdes -${cantidadApostada}€`;
                    resultadoApuestaEl.style.color = "#c0392b";
                }
            } else {
                resultadoApuestaEl.textContent = "";
            }
        });
    }

    // ANIMACIÓN DE CONTEO EN TROFEOS
    const trofeos = document.querySelectorAll('.trofeo-numero');
    trofeos.forEach(trofeo => {
        const final = parseInt(trofeo.textContent);
        trofeo.textContent = '0';
        const duracion = 1200;
        const fps = 60;
        const totalFrames = Math.round((duracion / 1000) * fps);
        let frame = 0;
        const easeOutBounce = t => {
            if (t < (1/2.75)) return 7.5625*t*t;
            else if (t < (2/2.75)) { t -= (1.5/2.75); return 7.5625*t*t + 0.75; }
            else if (t < (2.5/2.75)) { t -= (2.25/2.75); return 7.5625*t*t + 0.9375; }
            else { t -= (2.625/2.75); return 7.5625*t*t + 0.984375; }
        };
        function animate() {
            frame++;
            let progress = frame / totalFrames;
            let val = Math.round(final * easeOutBounce(progress > 1 ? 1 : progress));
            trofeo.textContent = val;
            if (progress < 1) requestAnimationFrame(animate);
            else {
                trofeo.textContent = final;
                trofeo.classList.add('rebote-trofeo');
                setTimeout(()=>trofeo.classList.remove('rebote-trofeo'), 800);
            }
        }
        setTimeout(animate, 300);
    });

    // 1. MODO OSCURO
    const temaGuardado = localStorage.getItem("temaLiga");
    const cuerpo = document.body;
    const boton = document.getElementById("btnTema");

    if (temaGuardado === "oscuro") {
        cuerpo.classList.add("dark-mode");
        if(boton) boton.innerHTML = "Claro";
    }

    if (boton) {
        boton.addEventListener("click", function() {
            cuerpo.classList.toggle("dark-mode");
            if (cuerpo.classList.contains("dark-mode")) {
                localStorage.setItem("temaLiga", "oscuro");
                boton.innerHTML = "Claro";
            } else {
                localStorage.setItem("temaLiga", "claro");
                boton.innerHTML = "Oscuro";
            }
        });
    }

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
        const fechaPartido = new Date("Jan 20, 2026 21:00:00").getTime();
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

    // BUSCADOR EN VIVO
    const inputBuscador = document.getElementById('buscador-equipos');
    if (inputBuscador) {
        inputBuscador.addEventListener('keyup', function() {
            const busqueda = this.value.toLowerCase();
            const filas = document.querySelectorAll('.tabla-pro tbody tr');
            filas.forEach(fila => {
                const nombreEquipo = fila.cells[1].textContent.toLowerCase();
                if (nombreEquipo.includes(busqueda)) {
                    fila.style.display = '';
                    fila.classList.add('fila-destacada');
                    setTimeout(() => fila.classList.remove('fila-destacada'), 300);
                } else {
                    fila.style.display = 'none';
                }
            });
        });
    }

    // CARRUSEL NOTICIAS
    const carruselNoticias = document.querySelector('.carrusel-noticias');
    if (carruselNoticias) {
        let indiceNoticia = 0;
        const noticias = carruselNoticias.querySelectorAll('.noticia-item');
        const mostrarNoticia = () => {
            noticias.forEach(n => n.classList.remove('activa'));
            noticias[indiceNoticia].classList.add('activa');
        };
        document.querySelector('.noticia-prev')?.addEventListener('click', () => {
            indiceNoticia = (indiceNoticia - 1 + noticias.length) % noticias.length;
            mostrarNoticia();
        });
        document.querySelector('.noticia-next')?.addEventListener('click', () => {
            indiceNoticia = (indiceNoticia + 1) % noticias.length;
            mostrarNoticia();
        });
        setInterval(() => {
            indiceNoticia = (indiceNoticia + 1) % noticias.length;
            mostrarNoticia();
        }, 5000);
        mostrarNoticia();
    }

    // CONFETI Y TOAST BÁSICO
    function mostrarToast(mensaje, tipo = 'success') {
        const toast = document.createElement('div');
        toast.textContent = mensaje;
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.backgroundColor = tipo === 'success' ? '#28a745' : '#dc3545';
        toast.style.color = 'white';
        toast.style.padding = '10px 20px';
        toast.style.borderRadius = '5px';
        toast.style.zIndex = '2000';
        toast.style.animation = 'fadeIn 0.5s';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    function crearConfeti() {
        const confeti = document.createElement('div');
        confeti.className = 'confeti';
        confeti.style.left = Math.random() * 100 + '%';
        confeti.style.background = ['#ffd700', '#002244', '#ff6b6b', '#4ecdc4', '#45b7d1'][Math.floor(Math.random() * 5)];
        document.body.appendChild(confeti);
        setTimeout(() => confeti.remove(), 2000);
    }

    // VOTACIÓN ESTRELLAS
    const equipoFilas = document.querySelectorAll('.tabla-pro tbody tr');
    equipoFilas.forEach((fila) => {
        const celdaVoto = document.createElement('td');
        const nombreEquipo = fila.cells[1].textContent.replace('🤍', '').trim();
        
        const contenedorEstrellas = document.createElement('div');
        contenedorEstrellas.className = 'contenedor-estrellas';
        contenedorEstrellas.style.display = 'flex';
        contenedorEstrellas.style.gap = '4px';
        contenedorEstrellas.style.justifyContent = 'center';
        
        const votosGuardados = parseInt(localStorage.getItem(`voto_${nombreEquipo}`)) || 0;
        
        for (let i = 1; i <= 5; i++) {
            const estrella = document.createElement('span');
            estrella.className = 'estrella-individual';
            estrella.textContent = i <= votosGuardados ? '⭐' : '☆';
            estrella.setAttribute('data-valor', i);
            estrella.style.color = i <= votosGuardados ? '#ffd700' : '#ccc';
            
            estrella.addEventListener('mouseover', () => {
                for (let j = 1; j <= 5; j++) {
                    const est = contenedorEstrellas.querySelector(`[data-valor="${j}"]`);
                    est.textContent = j <= i ? '⭐' : '☆';
                    est.style.color = j <= i ? '#ffd700' : '#ccc';
                }
            });
            
            estrella.addEventListener('click', (e) => {
                e.stopPropagation();
                localStorage.setItem(`voto_${nombreEquipo}`, i);
                mostrarToast(`✅ Votaste ${i} estrellas a ${nombreEquipo}`);
                if (i === 5) {
                   for (let k = 0; k < 20; k++) setTimeout(() => crearConfeti(), k * 50);
                }
            });
            
            estrella.addEventListener('mouseout', () => {
                const currentVote = parseInt(localStorage.getItem(`voto_${nombreEquipo}`)) || 0;
                for (let j = 1; j <= 5; j++) {
                    const est = contenedorEstrellas.querySelector(`[data-valor="${j}"]`);
                    est.textContent = j <= currentVote ? '⭐' : '☆';
                    est.style.color = j <= currentVote ? '#ffd700' : '#ccc';
                }
            });
            
            contenedorEstrellas.appendChild(estrella);
        }
        celdaVoto.appendChild(contenedorEstrellas);
        fila.appendChild(celdaVoto);
    });

    // COMPARADOR
    let equiposComparacion = [];
    document.querySelectorAll('.tabla-pro tbody tr').forEach(fila => {
        fila.addEventListener('dblclick', () => {
            const nombreEquipo = fila.cells[1].textContent.replace('🤍', '').replace('❤️', '').trim();
            if (!equiposComparacion.includes(nombreEquipo)) {
                equiposComparacion.push(nombreEquipo);
                fila.style.backgroundColor = 'rgba(255, 215, 0, 0.2)';
            } else {
                equiposComparacion = equiposComparacion.filter(e => e !== nombreEquipo);
                fila.style.backgroundColor = '';
            }
            if (equiposComparacion.length === 2) {
                let msg = `Comparación:\n${equiposComparacion[0]} vs ${equiposComparacion[1]}`;
                alert(msg);
                equiposComparacion = [];
                document.querySelectorAll('.tabla-pro tbody tr').forEach(r => r.style.backgroundColor = '');
            }
        });
    });

    // ==========================================================
    // 18. MODO FAVORITOS (GLOBAL - FUNCIONA EN TODAS LAS PÁGINAS)
    // ==========================================================
    
    // A) Funcionalidad de los corazones (Solo si existe la tabla - pág Clasificación)
    document.querySelectorAll('.corazon-favorito').forEach(corazon => {
        const equipo = corazon.getAttribute('data-equipo');
        
        // 1. Cargar estado inicial
        if (localStorage.getItem(`favorito_${equipo}`) === 'true') {
            corazon.textContent = '❤️';
            corazon.classList.add('favorito-activo');
        }

        // 2. Click para alternar
        corazon.addEventListener('click', (e) => {
            e.stopPropagation(); 
            const esFavorito = localStorage.getItem(`favorito_${equipo}`) === 'true';
            
            if (esFavorito) {
                localStorage.removeItem(`favorito_${equipo}`);
                corazon.textContent = '🤍';
                corazon.classList.remove('favorito-activo');
                mostrarToast(`💔 ${equipo} eliminado de favoritos`, 'error');
            } else {
                localStorage.setItem(`favorito_${equipo}`, 'true');
                corazon.textContent = '❤️';
                corazon.classList.add('favorito-activo');
                mostrarToast(`❤️ ¡${equipo} añadido a favoritos!`);
            }
            // Actualizar panel si está abierto
            renderFavoritos();
        });
    });

    // B) Crear el Panel de Favoritos (Se inyecta en todas las páginas automáticamente)
    const panelFavoritos = document.createElement('div');
    panelFavoritos.id = 'panel-favoritos';
    panelFavoritos.className = 'panel-favoritos hidden';
    document.body.appendChild(panelFavoritos);

    // C) Función para dibujar la lista (Usando los DATOS MAESTROS del principio)
    function renderFavoritos() {
        let html = '<h3>❤️ Tus Equipos Favoritos</h3><div class="lista-favoritos">';
        let hayFavoritos = false;

        // Recorremos la lista maestra de datos en lugar del HTML de la tabla
        datosEquipos.forEach(eq => {
            const esFav = localStorage.getItem(`favorito_${eq.nombre}`) === 'true';
            
            if (esFav) {
                hayFavoritos = true;
                html += `
                <div class="fav-item">
                    <div>
                        <span style="margin-right:8px;">❤️</span>
                        <b>#${eq.pos} ${eq.nombre}</b>
                        <div style="font-size:0.85em;color:#666;">${eq.pts} pts</div>
                    </div>
                    <div class="fav-acciones">
                        <button class="fav-remove" data-equipo="${eq.nombre}" title="Eliminar">✖</button>
                    </div>
                </div>`;
            }
        });

        if (!hayFavoritos) {
            html += '<p style="text-align: center; color: #999; font-size: 0.9em;">No tienes favoritos. Ve a "Clasificación" y marca los corazones.</p>';
        }

        html += '</div><div style="text-align:right; margin-top:8px;"><button id="cerrar-fav" style="background:transparent;border:none;cursor:pointer;">Cerrar</button></div>';
        
        panelFavoritos.innerHTML = html;

        // Eventos para botones de eliminar dentro del panel
        panelFavoritos.querySelectorAll('.fav-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const nombre = btn.getAttribute('data-equipo');
                localStorage.removeItem(`favorito_${nombre}`);
                
                // Si estamos en la página de clasificación, apagar el corazón de la tabla visualmente
                const corazonTabla = document.querySelector(`.corazon-favorito[data-equipo="${nombre}"]`);
                if (corazonTabla) {
                    corazonTabla.textContent = '🤍';
                    corazonTabla.classList.remove('favorito-activo');
                }
                
                // Redibujar el panel
                renderFavoritos();
            });
        });

        panelFavoritos.querySelector('#cerrar-fav').addEventListener('click', () => togglePanel(false));
    }

    // D) Función para abrir/cerrar panel
    function togglePanel(forceOpen) {
        const isHidden = panelFavoritos.classList.contains('hidden');
        const shouldOpen = forceOpen !== undefined ? forceOpen : isHidden;

        if (shouldOpen) {
            renderFavoritos(); // Actualizar datos antes de mostrar
            panelFavoritos.classList.remove('hidden');
        } else {
            panelFavoritos.classList.add('hidden');
        }
    }

    // E) Botón Flotante (Siempre visible en todas las páginas)
    const btnFavoritos = document.createElement('button');
    btnFavoritos.innerHTML = '❤️ Favoritos';
    btnFavoritos.style.cssText = 'position: fixed; bottom: 100px; right: 20px; padding: 10px 20px; background: linear-gradient(90deg, #e74c3c, #c0392b); color: white; border: none; border-radius: 30px; cursor: pointer; font-weight: bold; z-index: 1199; box-shadow: 0 4px 12px rgba(0,0,0,0.3); transition: transform 0.2s;';
    
    // Ajuste para móviles para que no tape el botón de subir
    if(window.innerWidth < 768) {
        btnFavoritos.style.bottom = "80px"; 
        btnFavoritos.style.right = "15px";
        btnFavoritos.style.padding = "8px 15px";
    }

    btnFavoritos.onmouseover = () => btnFavoritos.style.transform = 'scale(1.05)';
    btnFavoritos.onmouseout = () => btnFavoritos.style.transform = 'scale(1)';
    btnFavoritos.onclick = () => togglePanel();
    document.body.appendChild(btnFavoritos);

    // Cerrar panel al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!panelFavoritos.classList.contains('hidden') && !panelFavoritos.contains(e.target) && !btnFavoritos.contains(e.target)) {
            togglePanel(false);
        }
    });

    // FILTRO ZONAS
    const containerFiltros = document.createElement('div');
    containerFiltros.id = 'filtros-zonas';
    containerFiltros.innerHTML = `
        <button class="btn-filtro" data-zona="todos">Todos</button>
        <button class="btn-filtro" data-zona="champions">Champions</button>
        <button class="btn-filtro" data-zona="europa">Europa</button>
        <button class="btn-filtro" data-zona="conference">Conference</button> 
        <button class="btn-filtro" data-zona="descenso">Descenso</button>
    `;

    const tablaContainer = document.querySelector('.contenedor-tabla');
    if (tablaContainer) {
        tablaContainer.parentElement.insertBefore(containerFiltros, tablaContainer);
    }
    document.querySelectorAll('.btn-filtro').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('activo'));
            this.classList.add('activo');
            const zona = this.getAttribute('data-zona');
            document.querySelectorAll('.tabla-pro tbody tr').forEach(fila => {
                if (zona === 'todos') fila.style.display = '';
                else if (fila.classList.contains('zona-' + zona)) fila.style.display = '';
                else fila.style.display = 'none';
            });
        });
    });
    const btnTodos = document.querySelector('.btn-filtro[data-zona="todos"]');
    if(btnTodos) btnTodos.classList.add('activo');

    // TRANSICIÓN PÁGINAS
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('class') !== 'activo') {
                e.preventDefault();
                const href = this.getAttribute('href');
                document.body.style.opacity = '0';
                setTimeout(() => window.location.href = href, 500);
            }
        });
    });
    window.addEventListener('load', () => {
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s ease-in';
        setTimeout(() => document.body.style.opacity = '1', 10);
    });

});

// FUNCIONES GLOBALES
function validarFormulario(event) {
    event.preventDefault();
    const nombre = document.getElementById("nombre");
    const email = document.getElementById("email");
    const mensaje = document.getElementById("mensaje");
    const politica = document.getElementById("politica");
    let hayErrores = false;
    
    document.querySelectorAll('.error-msg').forEach(el => el.innerText = '');
    
    if (nombre.value.trim() === "") { document.getElementById("error-nombre").innerText = "⚠️ Nombre obligatorio."; hayErrores = true; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { document.getElementById("error-email").innerText = "⚠️ Email inválido."; hayErrores = true; }
    if (mensaje.value.length < 10) { document.getElementById("error-mensaje").innerText = "⚠️ Mensaje corto."; hayErrores = true; }
    if (!politica.checked) { document.getElementById("error-politica").innerText = "⚠️ Acepta la política."; hayErrores = true; }

    if (!hayErrores) {
        const form = document.getElementById("formContacto");
        const exito = document.getElementById("mensajeExito");
        document.getElementById("btnEnviar").innerHTML = 'Enviando...';
        setTimeout(() => {
            form.style.display = "none";
            exito.style.display = "block";
        }, 1500);
    }
}

window.onscroll = function() { 
    let boton = document.getElementById("btnSubir");
    if(boton) {
        if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) boton.style.display = "block";
        else boton.style.display = "none";
    }
};

function subirArriba() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
// FIN FUNCIONES GLOBALES

// --- FUNCIONALIDAD 5: GENERADOR DE NARRATIVA ACTUALIZADO ---
function generarNarrativa(equipoLocal, equipoVisitante) {
    const formaciones = ['4-3-3', '4-4-2', '3-5-2', '5-4-1', '4-2-3-1'];
    
    // BASE DE DATOS DE CAPITANES REALES (Actualizada 2025)
    // La clave debe ser IGUAL al nombre del equipo en tu lista 'datosEquipos'
    const capitanesDB = {
        'Arsenal FC': 'Martin Ødegaard',
        'Manchester City': 'Ruben Dias',
        'FC Barcelona': 'Raphinha',
        'Real Madrid': 'Fede Valverde',
        'Bayern München': 'Manuel Neuer',
        'Liverpool FC': 'Virgil van Dijk',
        'Paris Saint-Germain': 'Marquinhos',
        'Inter de Milán': 'Lautaro Martínez',
        'Juventus': 'Manuel Locatelli',
        'AC Milan': 'Mike Maignan',
        'Atlético de Madrid': 'Koke',
        'Chelsea FC': 'Reece James',
        'Borussia Dortmund': 'Emre Can',
        'Manchester United': 'Bruno Fernandes',
        'Benfica': 'Nicolás Otamendi',
        'Athletic Bilbao': 'Iñaki Williams',
        'Napoli': 'Giovanni Di Lorenzo',
        'Ajax Amsterdam': 'Jordan Henderson',
        'FC Porto': 'Jorge Costa', 
        'Olympique Marseille': 'Valentin Rongier'
    };
    
    // Elegir formaciones aleatorias
    const formL = formaciones[Math.floor(Math.random() * formaciones.length)];
    const formV = formaciones[Math.floor(Math.random() * formaciones.length)];
    
    // Buscar el capitán específico. Si no existe, pone "Capitán"
    const capitanL = capitanesDB[equipoLocal] || "Capitán Local";
    const capitanV = capitanesDB[equipoVisitante] || "Capitán Visitante";
    
    const asistencia = Math.floor(Math.random() * (85000 - 40000) + 40000).toLocaleString();

    return `
        <div class="narrativa-box">
            <div class="dato-tactico"> <strong>Asistencia:</strong> ${asistencia} espectadores</div>
            <div class="dato-tactico"> <strong>${equipoLocal}:</strong> Juega con ${formL}. Capitán: <strong>${capitanL}</strong>.</div>
            <div class="dato-tactico"> <strong>${equipoVisitante}:</strong> Juega con ${formV}. Capitán: <strong>${capitanV}</strong>.</div>
        </div>
    `;
}

// --- FUNCIONALIDAD: GENERAR HISTORIAL PREVIO (FAKE) ---
function actualizarFormaReciente() {
    const local = document.getElementById('simLocal').value;
    const visit = document.getElementById('simVisitante').value;
    const panel = document.getElementById('panelForma');

    // Si falta algún equipo, ocultamos el panel
    if (!local || !visit || local === visit) {
        panel.style.display = 'none';
        return;
    }

    panel.style.display = 'flex';
    document.getElementById('tituloFormaLocal').textContent = `Forma: ${local}`;
    document.getElementById('tituloFormaVisitante').textContent = `Forma: ${visit}`;

    // Generar listas
    document.getElementById('listaFormaLocal').innerHTML = generarPartidosFake(local);
    document.getElementById('listaFormaVisitante').innerHTML = generarPartidosFake(visit);
}

function generarPartidosFake(miEquipo) {
    let html = '';
    // Hacemos 5 partidos
    for (let i = 0; i < 5; i++) {
        // 1. Elegir rival aleatorio que no sea yo
        let rival;
        do {
            rival = datosEquipos[Math.floor(Math.random() * datosEquipos.length)].nombre;
        } while (rival === miEquipo);

        // 2. Generar resultado aleatorio (ligeramente realista)
        // 0 a 3 goles para cada uno
        const golesMios = Math.floor(Math.random() * 4); 
        const golesRival = Math.floor(Math.random() * 4);
        
        // 3. Determinar si fue Win (W), Draw (D) o Loss (L)
        let letra = 'D';
        let clase = 'badge-D';
        
        if (golesMios > golesRival) { letra = 'W'; clase = 'badge-W'; }
        else if (golesMios < golesRival) { letra = 'L'; clase = 'badge-L'; }

        // 4. Crear HTML de la fila
        html += `
            <li class="item-partido">
                <span>
                    <span class="badge-res ${clase}">${letra}</span>
                    <span style="font-size:0.9em">vs ${rival.substring(0, 10)}.</span>
                </span>
                <strong>${golesMios}-${golesRival}</strong>
            </li>
        `;
    }
    return html;
}



// ==========================================
// 🚀 3. RENDERIZADO DINÁMICO DE LA TABLA
// ==========================================

function renderizarTabla() {
    const tbody = document.getElementById('tabla-cuerpo');
    if (!tbody) return; // Si no estamos en la página de clasificación, salimos.

    tbody.innerHTML = ''; // 1. Limpiamos la tabla actual

    // 2. Ordenar equipos: Puntos > Diferencia Goles > Goles a Favor
    datosEquipos.sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        const difA = (a.gf || 0) - (a.gc || 0);
        const difB = (b.gf || 0) - (b.gc || 0);
        if (difB !== difA) return difB - difA;
        return (b.gf || 0) - (a.gf || 0);
    });

    // 3. Generar filas
    datosEquipos.forEach((equipo, index) => {
        // Calcular posición real (index + 1)
        equipo.pos = index + 1;
        const diferenciaGoles = (equipo.gf || 0) - (equipo.gc || 0);

        // Determinar Zona (Colores)
        let claseZona = '';
        if (index < 4) claseZona = 'zona-champions';       // 1-4 Champions
        else if (index < 6) claseZona = 'zona-europa';     // 5-6 Europa League
        else if (index === 6) claseZona = 'zona-conference'; // 7 Conference
        else if (index >= 17) claseZona = 'zona-descenso'; // 18-20 Descenso

        // Verificar Favorito
        const esFavorito = localStorage.getItem(`favorito_${equipo.nombre}`) === 'true';
        const corazon = esFavorito ? '❤️' : '🤍';
        const claseFav = esFavorito ? 'favorito-activo' : '';

        // Generar Estrellas (Recuperando votos guardados)
        const votosGuardados = parseInt(localStorage.getItem(`voto_${equipo.nombre}`)) || 0;
        let htmlEstrellas = '<div class="contenedor-estrellas" style="display:flex; justify-content:center; gap:2px;">';
        for (let i = 1; i <= 5; i++) {
            const color = i <= votosGuardados ? '#ffd700' : '#ccc';
            const simbolo = i <= votosGuardados ? '⭐' : '☆';
            htmlEstrellas += `<span class="estrella-dinamica" data-equipo="${equipo.nombre}" data-valor="${i}" style="color:${color}; cursor:pointer;">${simbolo}</span>`;
        }
        htmlEstrellas += '</div>';

        // Construir la fila HTML
        const filaHTML = `
            <tr class="${claseZona}">
                <td>${equipo.pos}</td>
                <td style="text-align:left; font-weight:bold; display:flex; align-items:center; gap:10px;">
                    ${equipo.nombre} 
                    <span class="corazon-favorito ${claseFav}" data-equipo="${equipo.nombre}" title="Añadir a favoritos">${corazon}</span>
                </td>
                <td><strong>${equipo.pts}</strong></td>
                <td>${equipo.pj || 0}</td>
                <td>${equipo.pg || 0}</td>
                <td>${equipo.pe || 0}</td>
                <td>${equipo.pp || 0}</td>
                <td>${equipo.gf || 0}</td>
                <td>${equipo.gc || 0}</td>
                <td>${diferenciaGoles}</td>
                <td>${htmlEstrellas}</td>
            </tr>
        `;
        tbody.innerHTML += filaHTML;
    });

    // 4. REACTIVAR LOS LISTENERS (Importante: porque hemos borrado y creado nuevos elementos)
    activarListenersTabla();
}

// Función auxiliar para reconectar los clicks (Corazones, Estrellas, Comparador)
function activarListenersTabla() {
    
    // A) Favoritos (Corazones)
    document.querySelectorAll('.corazon-favorito').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitar que salte el comparador
            const nombre = btn.getAttribute('data-equipo');
            const estadoActual = localStorage.getItem(`favorito_${nombre}`) === 'true';
            
            if (estadoActual) {
                localStorage.removeItem(`favorito_${nombre}`);
                mostrarToast(`💔 ${nombre} eliminado de favoritos`, 'error');
            } else {
                localStorage.setItem(`favorito_${nombre}`, 'true');
                mostrarToast(`❤️ ${nombre} añadido a favoritos`);
            }
            renderizarTabla(); // Re-renderizar para actualizar icono
            if(typeof renderFavoritos === 'function') renderFavoritos(); // Actualizar panel lateral
        });
    });

    // B) Votación Estrellas
    document.querySelectorAll('.estrella-dinamica').forEach(star => {
        star.addEventListener('click', (e) => {
            e.stopPropagation();
            const nombre = star.getAttribute('data-equipo');
            const valor = star.getAttribute('data-valor');
            localStorage.setItem(`voto_${nombre}`, valor);
            mostrarToast(`Has votado ${valor} estrellas a ${nombre}`);
            if(valor == 5) crearConfeti();
            renderizarTabla(); // Actualizar visualmente
        });
    });

    // C) Comparador (Doble Click en la fila)
    let equiposComparacion = [];
    document.querySelectorAll('#tabla-cuerpo tr').forEach(fila => {
        fila.addEventListener('dblclick', function() {
            // Buscamos el nombre dentro de la celda (cuidado con el texto del corazón)
            const celdaNombre = this.querySelector('td:nth-child(2)');
            // Hack para obtener solo el texto del equipo y no el corazón
            const nombreEquipo = celdaNombre.firstChild.textContent.trim(); 

            if (!equiposComparacion.includes(nombreEquipo)) {
                equiposComparacion.push(nombreEquipo);
                this.style.backgroundColor = 'rgba(255, 215, 0, 0.4)'; // Resaltar
            } else {
                equiposComparacion = equiposComparacion.filter(e => e !== nombreEquipo);
                this.style.backgroundColor = ''; // Quitar resaltado
            }

            if (equiposComparacion.length === 2) {
                // Aquí podrías hacer algo más complejo, de momento un alert:
                const eq1 = datosEquipos.find(e => e.nombre === equiposComparacion[0]);
                const eq2 = datosEquipos.find(e => e.nombre === equiposComparacion[1]);
                
                alert(`📊 COMPARATIVA:\n\n${eq1.nombre}: ${eq1.pts} pts (${eq1.gf} GF)\nVs\n${eq2.nombre}: ${eq2.pts} pts (${eq2.gf} GF)`);
                
                // Resetear
                equiposComparacion = [];
                renderizarTabla(); // Limpia los colores de fondo
            }
        });
    });
}

// ==========================================
// FIN RENDERIZADO DINÁMICO
// ==========================================