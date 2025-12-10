// 1. MODO OSCURO
function cambiarTema() {
    let cuerpo = document.body;
    let boton = document.getElementById("btnTema");
    
    cuerpo.classList.toggle("dark-mode");

    if (cuerpo.classList.contains("dark-mode")) {
        localStorage.setItem("tema", "oscuro");
        boton.innerText = "☀️ Claro";
    } else {
        localStorage.setItem("tema", "claro");
        boton.innerText = "🌗 Oscuro";
    }
}

// Cargar tema al inicio
window.onload = function() {
    let temaGuardado = localStorage.getItem("tema");
    let boton = document.getElementById("btnTema");

    if (temaGuardado === "oscuro") {
        document.body.classList.add("dark-mode");
        if(boton) boton.innerText = "☀️ Claro";
    }
}

// 2. FUNCIONALIDAD DE LA TIENDA
function comprar(producto) {
    // Simplemente mostramos una alerta confirmando la acción
    alert("¡Has añadido " + producto + " al carrito! 🛒");
}

// 3. VALIDACIÓN FORMULARIO CONTACTO
function validarFormulario() {
    let nombre = document.getElementById("nombre").value;
    let email = document.getElementById("email").value;

    if (nombre === "" || email === "") {
        alert("⚠️ Por favor, rellena nombre y email para poder contactarte.");
        return false;
    } else {
        alert("✅ Mensaje enviado. ¡Gracias por escribirnos, " + nombre + "!");
        return true;
    }
}