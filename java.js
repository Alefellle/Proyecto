document.addEventListener('DOMContentLoaded', function() {
    
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