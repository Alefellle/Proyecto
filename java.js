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

    // TOOLTIP ANIMADO EN NOMBRES DE EQUIPOS - DESACTIVADO
    // const equipoCeldas = document.querySelectorAll('.tabla-pro td:nth-child(2), .tabla-pro th:nth-child(2)');
    // equipoCeldas.forEach(celda => {
    //     const nombre = celda.textContent.trim();
    //     if (!nombre || nombre === 'Equipo') return;
    //     celda.classList.add('equipo-tooltip');
    //     let pos = '';
    //     if (celda.parentElement && celda.parentElement.children[0] && celda.parentElement.children[0] !== celda) {
    //         pos = celda.parentElement.children[0].textContent.trim();
    //     }
    //     celda.setAttribute('data-tooltip', `ℹ️ ${nombre}${pos ? ' (Posición: ' + pos + ')' : ''}`);
    // });
    
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

    // 6. ACORDEÓN FAQ (NUEVO)
    const faqs = document.querySelectorAll(".faq-question");
    faqs.forEach(pregunta => {
        pregunta.addEventListener("click", () => {
            const item = pregunta.parentElement;
            item.classList.toggle("active");
        });
    });

    // 1. BUSCADOR EN VIVO PARA TABLA DE CLASIFICACIÓN
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

    // 2. CARRUSEL DE NOTICIAS MEJORADO
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

    // 3. NOTIFICACIONES TOAST (deshabilitadas)
    function mostrarToast(mensaje, tipo = 'success') {
        // Toast notifications disabled by user request.
        return;
    }

    // 9. CONFETI AL VOTAR 5 ESTRELLAS
    function crearConfeti() {
        const confeti = document.createElement('div');
        confeti.className = 'confeti';
        confeti.style.left = Math.random() * 100 + '%';
        confeti.style.delay = Math.random() * 0.2 + 's';
        confeti.style.background = ['#ffd700', '#002244', '#ff6b6b', '#4ecdc4', '#45b7d1'][Math.floor(Math.random() * 5)];
        document.body.appendChild(confeti);
        setTimeout(() => confeti.remove(), 1000);
    }

    // 3. SISTEMA DE VOTACIÓN CON ESTRELLAS (mejorado con Toast y Confeti)
    const equipoFilas = document.querySelectorAll('.tabla-pro tbody tr');
    equipoFilas.forEach((fila) => {
        const celdaVoto = document.createElement('td');
        celdaVoto.className = 'celda-voto';
        const nombreEquipo = fila.cells[1].textContent;
        
        // Crear contenedor con 5 estrellas individuales
        const contenedorEstrellas = document.createElement('div');
        contenedorEstrellas.className = 'contenedor-estrellas';
        contenedorEstrellas.style.display = 'flex';
        contenedorEstrellas.style.gap = '4px';
        
        const votosGuardados = parseInt(localStorage.getItem(`voto_${nombreEquipo}`)) || 0;
        
        for (let i = 1; i <= 5; i++) {
            const estrella = document.createElement('span');
            estrella.className = 'estrella-individual';
            estrella.textContent = i <= votosGuardados ? '⭐' : '☆';
            estrella.style.cursor = 'pointer';
            estrella.style.fontSize = '1.3em';
            estrella.style.transition = 'all 0.2s ease';
            estrella.style.display = 'inline-block';
            estrella.setAttribute('data-valor', i);
            // Establecer color inicial basado en votosGuardados
            estrella.style.color = i <= votosGuardados ? '#ffd700' : '#ccc';
            
            // Hover effect - preview de votación
            estrella.addEventListener('mouseover', () => {
                for (let j = 1; j <= 5; j++) {
                    const est = contenedorEstrellas.querySelector(`[data-valor="${j}"]`);
                    if (j <= i) {
                        est.textContent = '⭐';
                        est.style.color = '#ffd700';
                        est.style.transform = 'scale(1.2)';
                    } else {
                        est.textContent = '☆';
                        est.style.color = '#ccc';
                        est.style.transform = 'scale(1)';
                    }
                }
            });
            
            // Click - guardar voto
            estrella.addEventListener('click', (e) => {
                e.stopPropagation();
                localStorage.setItem(`voto_${nombreEquipo}`, i);
                
                // Actualizar display inmediatamente
                for (let j = 1; j <= 5; j++) {
                    const est = contenedorEstrellas.querySelector(`[data-valor="${j}"]`);
                    est.textContent = j <= i ? '⭐' : '☆';
                    est.style.color = j <= i ? '#ffd700' : '#ccc';
                    est.style.transform = 'scale(1)';
                }
                
                mostrarToast(`✅ ¡Votaste ${nombreEquipo} con ${i} ⭐!`, 'success');
                
                if (i === 5) {
                    for (let k = 0; k < 20; k++) {
                        setTimeout(() => crearConfeti(), k * 50);
                    }
                    mostrarToast(`🎉 ¡5 ESTRELLAS! ¡${nombreEquipo} te ama!`, 'celebrar');
                }
            });
            
            // Mouse out - restaurar estado
            estrella.addEventListener('mouseout', () => {
                for (let j = 1; j <= 5; j++) {
                    const est = contenedorEstrellas.querySelector(`[data-valor="${j}"]`);
                    const votosActuales = parseInt(localStorage.getItem(`voto_${nombreEquipo}`)) || 0;
                    est.textContent = j <= votosActuales ? '⭐' : '☆';
                    est.style.color = j <= votosActuales ? '#ffd700' : '#ccc';
                    est.style.transform = 'scale(1)';
                }
            });
            
            contenedorEstrellas.appendChild(estrella);
        }
        
        celdaVoto.appendChild(contenedorEstrellas);
        celdaVoto.className = 'celda-voto';
        celdaVoto.style.textAlign = 'center';
        fila.appendChild(celdaVoto);
    });


    // 13. HISTÓRICO DE CAMBIOS EN CLASIFICACIÓN
    const registroClasificacion = localStorage.getItem('clasificacion-historico');
    if (!registroClasificacion) {
        const equiposDatos = Array.from(document.querySelectorAll('.tabla-pro tbody tr')).map(r => ({
            pos: r.cells[0].textContent,
            nombre: r.cells[1].textContent,
            puntos: r.cells[8].textContent
        }));
        localStorage.setItem('clasificacion-historico', JSON.stringify([{fecha: new Date().toLocaleDateString(), datos: equiposDatos}]));
    }

    // 14. COMPARADOR DE EQUIPOS (doble clic en equipos)
    let equiposComparacion = [];
    document.querySelectorAll('.tabla-pro tbody tr').forEach(fila => {
        fila.addEventListener('dblclick', () => {
            const nombreEquipo = fila.cells[1].textContent;
            if (!equiposComparacion.includes(nombreEquipo)) {
                equiposComparacion.push(nombreEquipo);
                fila.style.backgroundColor = 'rgba(255, 215, 0, 0.2)';
            } else {
                equiposComparacion = equiposComparacion.filter(e => e !== nombreEquipo);
                fila.style.backgroundColor = '';
            }
            if (equiposComparacion.length === 2) {
                mostrarComparacion(equiposComparacion);
            }
        });
    });

    function mostrarComparacion(equipos) {
        let comparacion = '<h3>📊 Comparación: ' + equipos.join(' vs ') + '</h3><table class="tabla-comparacion"><tr>';
        equipos.forEach(nombre => {
            const fila = Array.from(document.querySelectorAll('.tabla-pro tbody tr')).find(r => r.cells[1].textContent === nombre);
            if (fila) {
                comparacion += '<td><b>' + nombre + '</b><br>PJ: ' + fila.cells[2].textContent + '<br>PG: ' + fila.cells[3].textContent + '<br>Pts: ' + fila.cells[8].textContent + '</td>';
            }
        });
        comparacion += '</tr></table>';
        const modal = document.createElement('div');
        modal.className = 'modal-comparacion';
        modal.innerHTML = comparacion + '<button onclick="this.parentElement.remove()">Cerrar</button>';
        document.body.appendChild(modal);
    }


    // 18. MODO FAVORITOS (equipos marcados con corazón)
    // Funcionalidad del corazón para marcar favoritos
    document.querySelectorAll('.corazon-favorito').forEach(corazon => {
        const equipo = corazon.getAttribute('data-equipo');
        const esFavorito = localStorage.getItem(`favorito_${equipo}`);
        if (esFavorito === 'true') {
            corazon.textContent = '❤️';
            corazon.classList.add('favorito-activo');
        }
        corazon.addEventListener('click', (e) => {
            e.stopPropagation();
            const estaFavorito = localStorage.getItem(`favorito_${equipo}`) === 'true';
            if (estaFavorito) {
                localStorage.removeItem(`favorito_${equipo}`);
                corazon.textContent = '🤍';
                corazon.classList.remove('favorito-activo');
                mostrarToast(`💔 Eliminaste ${equipo} de favoritos`, 'error');
            } else {
                localStorage.setItem(`favorito_${equipo}`, 'true');
                corazon.textContent = '❤️';
                corazon.classList.add('favorito-activo');
                mostrarToast(`❤️ ¡${equipo} agregado a favoritos!`, 'success');
            }
        });
    });

    // Botón + Panel flotante para ver favoritosConference League (15-16)

    const panelFavoritos = document.createElement('div');
    panelFavoritos.id = 'panel-favoritos';
    panelFavoritos.className = 'panel-favoritos hidden';
    panelFavoritos.setAttribute('aria-hidden', 'true');
    document.body.appendChild(panelFavoritos);

    function renderFavoritos() {
        let html = '<h3>❤️ Tus Equipos Favoritos</h3><div class="lista-favoritos">';
        const equipos = Array.from(document.querySelectorAll('.tabla-pro tbody tr'));
        let hayFavoritos = false;
        equipos.forEach(eq => {
            const celda = eq.cells[1];
            const corazon = celda.querySelector('.corazon-favorito');
            if (corazon && localStorage.getItem(`favorito_${corazon.getAttribute('data-equipo')}`) === 'true') {
                hayFavoritos = true;
                const nombre = corazon.getAttribute('data-equipo');
                const puntos = eq.cells[8].textContent;
                const posicion = eq.cells[0].textContent;
                html += `<div class="fav-item"><div><span style="margin-right:8px;">❤️</span><b>#${posicion} ${nombre}</b><div style="font-size:0.85em;color:#666;">${puntos} pts</div></div><div class="fav-acciones"><button class="fav-remove" data-equipo="${nombre}" title="Eliminar favorito">✖</button></div></div>`;
            }
        });
        if (!hayFavoritos) {
            html += '<p style="text-align: center; color: #999;">No tienes favoritos aún. ¡Haz clic en los corazones para agregar equipos!</p>';
        }
        html += '</div>';
        html += '<div style="text-align:right; margin-top:8px;"><button id="cerrar-fav" style="background:transparent;border:none;color:#666;cursor:pointer;">Cerrar</button></div>';
        panelFavoritos.innerHTML = html;

        // Delegación para botones de eliminar
        panelFavoritos.querySelectorAll('.fav-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const equipo = btn.getAttribute('data-equipo');
                localStorage.removeItem(`favorito_${equipo}`);
                // Actualizar corazones en la tabla
                document.querySelectorAll(`.corazon-favorito[data-equipo="${equipo}"]`).forEach(c => {
                    c.textContent = '🤍';
                    c.classList.remove('favorito-activo');
                });
                renderFavoritos();
            });
        });

        const cerrar = panelFavoritos.querySelector('#cerrar-fav');
        if (cerrar) cerrar.addEventListener('click', () => { togglePanel(false); });
    }

    function togglePanel(forceOpen) {
        const open = typeof forceOpen === 'boolean' ? forceOpen : panelFavoritos.classList.contains('hidden');
        if (open) {
            renderFavoritos();
            panelFavoritos.classList.remove('hidden');
            panelFavoritos.setAttribute('aria-hidden', 'false');
        } else {
            panelFavoritos.classList.add('hidden');
            panelFavoritos.setAttribute('aria-hidden', 'true');
        }
    }

    const btnFavoritos = document.createElement('button');
    btnFavoritos.id = 'btn-favoritos';
    btnFavoritos.innerHTML = '❤️ Mis Favoritos';
    btnFavoritos.style.cssText = 'position: fixed; bottom: 160px; right: 30px; padding: 12px 20px; background: linear-gradient(90deg, #e74c3c, #c0392b); color: white; border: none; border-radius: 30px; cursor: pointer; font-weight: bold; z-index: 1199; box-shadow: 0 4px 12px rgba(0,0,0,0.3); transition: all 0.15s;';
    btnFavoritos.onmouseover = () => { btnFavoritos.style.transform = 'scale(1.06)'; };
    btnFavoritos.onmouseout = () => { btnFavoritos.style.transform = 'scale(1)'; };
    btnFavoritos.onclick = () => { togglePanel(); };
    document.body.appendChild(btnFavoritos);

    // Cerrar panel al hacer click fuera de él
    document.addEventListener('click', (e) => {
        if (!panelFavoritos.classList.contains('hidden')) {
            const dentroPanel = panelFavoritos.contains(e.target);
            const esBoton = btnFavoritos.contains(e.target);
            if (!dentroPanel && !esBoton) togglePanel(false);
        }
    });

    // 1. FILTRO POR ZONAS
    const containerFiltros = document.createElement('div');
    containerFiltros.id = 'filtros-zonas';
    containerFiltros.innerHTML = `
        <button class="btn-filtro" data-zona="todos">Todos</button>
        <button class="btn-filtro" data-zona="champions">Champions</button>
        <button class="btn-filtro" data-zona="europa">Europa</button>
        <button class="btn-filtro" data-zona="conference">Conference</button> 
        <button class="btn-filtro" data-zona="descenso">⬇Descenso</button>
    `;
    // Nota: He añadido la línea del botón Conference justo encima de Descenso

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
                if (zona === 'todos') {
                    fila.style.display = '';
                } else if (zona === 'champions' && fila.classList.contains('zona-champions')) {
                    fila.style.display = '';
                } else if (zona === 'europa' && fila.classList.contains('zona-europa')) {
                    fila.style.display = '';
                } else if (zona === 'conference' && fila.classList.contains('zona-conference')) { // <--- AGREGAR ESTA CONDICIÓN
                    fila.style.display = '';
                } else if (zona === 'descenso' && fila.classList.contains('zona-descenso')) {
                    fila.style.display = '';
                } else {
                    fila.style.display = 'none';
                }
            });
        });
    });
    document.querySelector('.btn-filtro[data-zona="todos"]').classList.add('activo');

    // 3. NOTIFICACIONES TOAST (deshabilitadas)
    function mostrarToast(mensaje, tipo = 'success') {
        // Toast notifications disabled by user request.
        return;
    }

    // 9. CONFETI AL VOTAR 5 ESTRELLAS
    function crearConfeti() {
        const confeti = document.createElement('div');
        confeti.className = 'confeti';
        confeti.style.left = Math.random() * 100 + '%';
        confeti.style.delay = Math.random() * 0.2 + 's';
        confeti.style.background = ['#ffd700', '#002244', '#ff6b6b', '#4ecdc4', '#45b7d1'][Math.floor(Math.random() * 5)];
        document.body.appendChild(confeti);
        setTimeout(() => confeti.remove(), 2000);
    }

    // 10. TRANSICIÓN SUAVE ENTRE PÁGINAS
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('class') !== 'activo') {
                e.preventDefault();
                const href = this.getAttribute('href');
                document.body.style.opacity = '0';
                document.body.style.transition = 'opacity 0.5s ease-out';
                setTimeout(() => {
                    window.location.href = href;
                }, 500);
            }
        });
    });
    window.addEventListener('load', () => {
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s ease-in';
        setTimeout(() => { document.body.style.opacity = '1'; }, 10);
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