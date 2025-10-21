const filasPorPaginas = 10;
let paginaActual = 1;
let currentId = null;

document.addEventListener("DOMContentLoaded", async () => {
    const formReserva = document.getElementById("formReserva");
    const formEditReserva = document.getElementById("editReservationForm");
    const btnFiltrar = document.getElementById("btn-filter");
    btnFiltrar.addEventListener("click", () => {
        cargarTabla();
    });


    formReserva.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!formReserva.checkValidity) {
            return;
        }
        await crearReserva();
        formReserva.reset();
    });

    formEditReserva.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!formEditReserva.checkValidity) {
            return;
        }
        await editarReserva(currentId);
        formReserva.reset();
    });



    validarInputsDate();
    await Promise.all([
        cargarRecursosDisponibles(),
        cargarClientes(),
        cargarEstadisticas()
    ])

    cargarTabla();
})

async function cargarRecursosDisponibles() {
    const request = await fetch(`http://localhost:8080/api/resource/disponibles`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    });
    const recursos = await request.json();

    const select = document.getElementById("recurso");
    const selectEdit = document.getElementById("editRecurso");
    const filtroRecurso = document.getElementById("filtro-recurso");

    recursos.forEach(recurs => {
        const option = document.createElement("option");
        switch (recurs.tipo) {
            case "SALON":
                option.textContent = `🏛 Salón Principal (#${recurs.id.toString().padStart(3, '0')})`;
                break;

            case "OFICINA":
                option.textContent = `🏢 Oficina Ejecutiva (#${recurs.id.toString().padStart(3, '0')})`;
                break;

            case "AUDITORIO":
                option.textContent = `🎭 Auditorio Principal (#${recurs.id.toString().padStart(3, '0')})`;
                break;

            case "LABORATORIO":
                option.textContent = `🔬 Laboratorio Cómputo (#${recurs.id.toString().padStart(3, '0')})`;
                break;

            case "VEHICULO":
                option.textContent = `🚗 Vehículo (#${recurs.id.toString().padStart(3, '0')})`;
                break;

        }
        option.value = recurs.id;
        select.appendChild(option);
        selectEdit.appendChild(option.cloneNode(true));
        filtroRecurso.appendChild(option.cloneNode(true));
    });

    // Iniciar en caso que se haya llamado desde Recurso.html
    const paramCliente = new URLSearchParams(window.location.search);
    const clienteId = paramCliente.get("recursoId");

    if (clienteId) {
        const filtroRecurso = document.getElementById("filtro-recurso");
        filtroRecurso.value = clienteId;
        filtroRecurso.dispatchEvent(new Event("change"));
    }
    return new Promise(resolve => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                resolve();
            })
        })
    })
}

async function cargarClientes() {
    const request = await fetch('http://localhost:8080/api/clients', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    });
    const clientes = await request.json();
    const select = document.getElementById("cliente");
    const selectEdit = document.getElementById("editCliente");
    const filtroCliente = document.getElementById("filtro-cliente");

    clientes.forEach(cliente => {
        const option = document.createElement("option");
        option.value = cliente.id;
        option.textContent = `${cliente.nombre} ${cliente.apellido}`;
        select.appendChild(option);
        selectEdit.appendChild(option.cloneNode(true));
        filtroCliente.appendChild(option.cloneNode(true));
    });

    // Iniciar en caso que se haya llamado desde Cliente.html
    const paramCliente = new URLSearchParams(window.location.search);
    const clienteId = paramCliente.get("clienteId");

    if (clienteId) {
        const filtroCliente = document.getElementById("filtro-cliente");
        filtroCliente.value = clienteId;
        filtroCliente.dispatchEvent(new Event("change"));
    }

    return new Promise(resolve => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                resolve();
            })
        })
    })
}

async function cargarTabla() {
    const filtroRecurso = document.getElementById("filtro-recurso");
    const filtroCliente = document.getElementById("filtro-cliente");

    if (!isNaN(filtroRecurso.value) && !isNaN(filtroCliente.value) && filtroRecurso.value !== "" && filtroCliente.value !== "") {
        await filtrarPorClienteAndRecurso(filtroRecurso.value, filtroCliente.value);
        return;
    }

    if (!isNaN(filtroCliente.value) && filtroCliente.value != "") {
        await filtrarPorCliente(filtroCliente.value);
        return;
    }

    if (!isNaN(filtroRecurso.value) && filtroRecurso.value != "") {
        await filtrarPorRecurso(filtroRecurso.value);
        return;
    }

    await cargarReservas();

    return new Promise(resolve => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                resolve();
            })
        })
    })
}

function validarInputsDate() {
    const inputDate = document.getElementById("fecha");
    const inputDateEdit = document.getElementById("editFecha");
    const hoy = new Date();
    const fechaMin = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
    inputDate.min = fechaMin;
    inputDateEdit.min = fechaMin;
}

async function crearReserva() {
    let datos = {};
    datos.fechaReserva = document.getElementById("fecha").value;
    datos.horaInicio = `${datos.fechaReserva}T${document.getElementById("hora-inicio").value}:00`;
    datos.horaFin = `${datos.fechaReserva}T${document.getElementById("hora-fin").value}:00`;
    datos.estado = 'PENDIENTE';
    datos.id_recurso = document.getElementById("recurso").value;
    datos.id_cliente = document.getElementById("cliente").value;

    const request = await fetch('http://localhost:8080/api/reserva', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
    }).then(res => {
        if (!res.ok)
            return res.json().then(data => {
                throw new Error(data.error);
            });
    }).then(data => {
        mostrarAlerta({
            title: 'Éxito',
            text: 'Reserva realizada con éxito',
            icon: 'success'
        })
    }).catch(error => {
        mostrarAlerta({
            title: 'Error',
            text: error.message,
            icon: 'error',
        })
    });
}

async function cargarReservas() {
    const request = await fetch(`http://localhost:8080/api/reserva`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    });
    const reservas = await request.json();
    updateTabla(reservas, paginaActual);
}

async function updateTabla(rows, pagina) {
    const tBody = document.getElementById("tBody");
    const emptyState = document.getElementById("emptyState");
    let inicio = (pagina - 1) * filasPorPaginas;
    let fin = inicio + filasPorPaginas;
    let datos = rows.slice(inicio, fin);
    tBody.innerHTML = "";

    for (const row of datos) {
        const fila = tBody.insertRow();

        // Crear las celdas
        const celdaId = fila.insertCell(0);
        const celdaCliente = fila.insertCell(1);
        const celdaRecurso = fila.insertCell(2);
        const celdaFecha = fila.insertCell(3);
        const celdaHorario = fila.insertCell(4);
        const celdaEstado = fila.insertCell(5);
        const celdaAcciones = fila.insertCell(6);

        // Contenido de las celdas
        const strongId = document.createElement("strong");
        strongId.textContent = `#R${String(row.id).padStart(3, '0')}`;
        celdaId.appendChild(strongId);

        celdaCliente.className = "client-name";
        const cliente = await buscarClienteId(row.id_cliente);
        celdaCliente.textContent = `${cliente.nombre} ${cliente.apellido}`;

        celdaRecurso.className = "resource-info";
        const recurso = await buscarRecursoId(row.id_recurso);

        switch (recurso.tipo) {
            case "SALON":
                celdaRecurso.textContent = `🏛 Salón Principal`;
                break;

            case "OFICINA":
                celdaRecurso.textContent = `🏢 Oficina Ejecutiva`;
                break;

            case "AUDITORIO":
                celdaRecurso.textContent = `🎭 Auditorio Principal`;
                break;

            case "LABORATORIO":
                celdaRecurso.textContent = `🔬 Laboratorio Cómputo`;
                break;

            case "VEHICULO":
                celdaRecurso.textContent = `🚗 Vehículo`;
                break;
        }
        const br = document.createElement("br");
        const smallRecurso = document.createElement("small");
        smallRecurso.textContent = `(Cap. ${recurso.capacidad} personas)`;
        celdaRecurso.appendChild(br);
        celdaRecurso.appendChild(smallRecurso);

        const divFecha = document.createElement("div");
        divFecha.className = "date";
        divFecha.textContent = formatearFecha(row.fechaReserva);
        celdaFecha.appendChild(divFecha);
        const smallFecha = document.createElement("small");
        smallFecha.textContent = obtenerDiaSemana(row.fechaReserva);
        celdaFecha.appendChild(smallFecha);
        celdaFecha.className = "datetime-info";

        const spanStatus = document.createElement("span");
        switch (row.estado) {
            case "ACTIVA":
                spanStatus.className = "status-badge activa";
                spanStatus.textContent = "ACTIVA";
                break;
            case "FINALIZADA":
                spanStatus.className = "status-badge finalizada";
                spanStatus.textContent = "FINALIZADA";
                break;
            case "CANCELADA":
                spanStatus.className = "status-badge cancelada";
                spanStatus.textContent = "CANCELADA";
                break;
            case "PENDIENTE":
                spanStatus.className = "status-badge pendiente";
                spanStatus.textContent = "PENDIENTE";
                break;
        }
        celdaEstado.appendChild(spanStatus);

        const divHorario = document.createElement("div");
        divHorario.className = "time";
        divHorario.textContent = `${formatearHora(row.horaInicio)} - ${formatearHora(row.horaFin)}`;
        const smallHora = document.createElement("small");
        smallHora.textContent = `(${diferenciaHoras(row.horaInicio, row.horaFin)} horas)`;
        celdaHorario.appendChild(divHorario);
        celdaHorario.appendChild(smallHora);
        celdaHorario.className = "datetime-info";

        // Botones de las Acciones
        const btnVerDetalles = document.createElement("button");
        btnVerDetalles.className = "btn btn-info";
        btnVerDetalles.textContent = "ℹ️ Ver Detalles";
        btnVerDetalles.addEventListener("click", () => {
            verDetalles(row, cliente, recurso);
        });

        const btnEditar = document.createElement("button");
        btnEditar.className = "btn btn-edit";
        btnEditar.textContent = "✏ Editar";
        btnEditar.addEventListener("click", () => {
            openModal(row.id);
        })

        const btnCancelar = document.createElement("button");
        btnCancelar.className = "btn btn-cancel";
        btnCancelar.textContent = "❌ Cancelar";
        btnCancelar.addEventListener("click", () => {
            mostrarAlerta({
                tipo: "confirm",
                title: "Advertencia",
                text: "¿Está seguro de querer cancelar la reserva?",
                onConfirm: () => {
                    cancelarReserva(row.id);
                },
                icon: "warning",
                recargar: false,
            })
        })

        const btnEliminar = document.createElement("button");
        btnEliminar.className = "btn btn-delete";
        btnEliminar.textContent = "🗑 Eliminar";
        btnEliminar.addEventListener("click", () => {
            mostrarAlerta({
                tipo: "confirm",
                title: "Advertencia",
                text: "¿Está seguro de querer eliminar la reserva?",
                onConfirm: () => {
                    eliminarReserva(row.id);
                },
                icon: "warning",
                recargar: false
            });
        });

        const divAcciones = document.createElement("div");
        divAcciones.className = "actions-group";
        divAcciones.appendChild(btnVerDetalles);

        switch (row.estado) {
            case "FINALIZADA":
                divAcciones.appendChild(btnEliminar);
                break;
            case "CANCELADA":
                divAcciones.appendChild(btnEliminar);
                break;
            case "PENDIENTE":
                divAcciones.appendChild(btnEditar);
                divAcciones.appendChild(btnCancelar);
                break;
        }

        celdaAcciones.appendChild(divAcciones);
    }
    (tBody.getElementsByTagName("tr").length === 0) ? emptyState.style.display = "block" : emptyState.style.display = "none";
    renderizarPaginacion(rows);
}

function renderizarPaginacion(rows) {
    const contenedor = document.getElementById("paginacion");
    let totalPaginas = Math.ceil(rows.length / filasPorPaginas);
    contenedor.innerHTML = "";

    for (let i = 1; i <= totalPaginas; i++) {
        let boton = document.createElement("button");
        boton.textContent = i;
        boton.className = "btn-pagina";
        if (i === paginaActual) boton.style.fontWeight = "bold";

        boton.addEventListener("click", () => {
            paginaActual = i;
            updateTabla(rows, paginaActual);
        });

        contenedor.appendChild(boton);
    }

}

async function buscarClienteId(id) {
    const request = await fetch(`http://localhost:8080/api/clients/${id}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    });
    const cliente = await request.json();

    return cliente;
}

async function buscarRecursoId(id) {
    const request = await fetch(`http://localhost:8080/api/resource/${id}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    });
    const recurso = await request.json();

    return recurso;
}

function obtenerDiaSemana(fecha) {
    const fecha1 = new Date(fecha);
    const dias = [
        'Domingo', 'Lunes', 'Martes', 'Miércoles',
        'Jueves', 'Viernes', 'Sábado'
    ];

    return dias[fecha1.getUTCDay()];
}

function formatearFecha(fecha) {
    const fecha1 = new Date(fecha);
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul",
        "Ago", "Sep", "Oct", "Nov", "Dic"
    ]
    const dia = fecha1.getUTCDate().toString().padStart(2, '0');
    const mes = meses[fecha1.getUTCMonth()];
    const anio = fecha1.getUTCFullYear();

    return `${dia} ${mes} ${anio}`
}

function formatearHora(hora) {
    const date = new Date(hora);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

function diferenciaHoras(horaInicio, horaFin) {
    const fechaInicio = new Date(horaInicio);
    const fechaFin = new Date(horaFin);

    const diferenciaMs = fechaFin - fechaInicio;

    const minutosTotales = Math.floor(diferenciaMs / (1000 * 60));
    const horas = Math.floor(minutosTotales / 60);
    const minutos = minutosTotales % 60;

    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
}

function mostrarAlerta({ tipo = 'default', title = '', text = '', icon = 'info', html = '', recargar = true, onConfirm = null, timer = null }) {
    let config = {
        title,
        text,
        icon,
        timer,
        showConfirmButton: true,
        html
    };

    if (tipo === 'confirm') {
        config.showCancelButton = true;
        config.confirmButtonText = 'Sí';
        config.cancelButtonText = 'No';
        config.reverseButtons = true;
    }

    Swal.fire(config).then((result) => {
        if (tipo === 'confirm' && result.isConfirmed && onConfirm) {
            onConfirm();
        }

        if (recargar) location.reload();
    });
}

async function cancelarReserva(id) {
    const request = await fetch(`http://localhost:8080/api/reserva/cancelar/${id}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    }).then(res => {
        if (!res.ok) {
            return res.json().then(data => {
                throw new Error(data.error);
            });
        }
    }).then(data => {
        mostrarAlerta({
            title: "Éxito",
            text: "Reserva cancelada con éxito",
            icon: 'success'
        })
    }).catch(error => {
        mostrarAlerta({
            title: 'Error',
            text: error.message,
            icon: 'error',
        })
    });
}

function verDetalles(reserva, cliente, recurso) {
    let tipo;
    switch (recurso.tipo) {
        case "SALON":
            tipo = `🏛 Salón Principal`;
            break;

        case "OFICINA":
            tipo = `🏢 Oficina Ejecutiva`;
            break;

        case "AUDITORIO":
            tipo = `🎭 Auditorio Principal`;
            break;

        case "LABORATORIO":
            tipo = `🔬 Laboratorio Cómputo`;
            break;

        case "VEHICULO":
            tipo = `🚗 Vehículo`;
            break;
    }
    let html = `<div style="text-aling:left;">
    <p><b>ID:</b> #R${String(reserva.id).padStart(3, '0')}</p>
    <p><b>Cliente:</b> ${cliente.nombre} ${cliente.apellido}</p>
    <p><b>Recurso:</b> ${tipo} <small>(Cap ${recurso.capacidad} personas)</small></p>
    <p><b>Inicio:</b> ${new Date(reserva.horaInicio).toLocaleString()}</p>
    <p><b>Fin:</b> ${new Date(reserva.horaFin).toLocaleString()}</p>
    <p><b>Estado:</b> ${reserva.estado}</p>
    </div>`;

    mostrarAlerta({
        title: 'Detalles de la reserva',
        html: html,
        icon: 'info',
        recargar: false,
    });
}

async function eliminarReserva(id) {
    const request = await fetch(`http://localhost:8080/api/reserva/${id}`, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    }).then(res => {
        if (!res.ok)
            return res.json().then(data => {
                throw new Error(data.error);
            });
    }).then(data => {
        mostrarAlerta({
            title: 'Éxito',
            text: 'Reserva eliminada con éxito',
            icon: 'success'
        })
    }).catch(error => {
        mostrarAlerta({
            title: 'Error',
            text: error.message,
            icon: 'error',
        })
    });
}

async function editarReserva(id) {
    let datos = {};
    datos.fechaReserva = document.getElementById("editFecha").value;
    datos.horaInicio = `${datos.fechaReserva}T${document.getElementById("editHoraInicio").value}:00`;
    datos.horaFin = `${datos.fechaReserva}T${document.getElementById("editHoraFin").value}:00`;
    datos.estado = 'PENDIENTE';
    datos.id_recurso = document.getElementById("editRecurso").value;
    datos.id_cliente = document.getElementById("editCliente").value;

    const request = await fetch(`http://localhost:8080/api/reserva/${id}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
    }).then(res => {
        if (!res.ok)
            return res.json().then(data => {
                throw new Error(data.error);
            });
    }).then(data => {
        mostrarAlerta({
            title: 'Éxito',
            text: 'Reserva editada con éxito',
            icon: 'success'
        })
    }).catch(error => {
        mostrarAlerta({
            title: 'Error',
            text: error.message,
            icon: 'error',
        })
    });
}

async function openModal(id) {
    const reserva = await buscarId(id);
    const modal = document.getElementById("editReservationModal");
    const btn_secondary = document.getElementById("btn-secondary");
    const btn_close = document.getElementById("close");

    // Llenar los inputs
    document.getElementById("editCliente").value = reserva.id_cliente;
    document.getElementById("editRecurso").value = reserva.id_recurso;
    document.getElementById("editFecha").value = reserva.fechaReserva;
    document.getElementById("editHoraInicio").value = formatearHora(reserva.horaInicio);
    document.getElementById("editHoraFin").value = formatearHora(reserva.horaFin);

    modal.style.display = "block";

    btn_secondary.addEventListener("click", () => {
        modal.style.display = "none";
    });

    btn_close.addEventListener("click", () => {
        modal.style.display = "none";
    })

    currentId = id;

    window.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    };

}

async function buscarId(id) {
    const request = await fetch(`http://localhost:8080/api/reserva/${id}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    });
    const recurso = await request.json();

    return recurso;
}

async function cargarEstadisticas() {
    const request = await fetch(`http://localhost:8080/api/reserva/estadisticas`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    });
    const response = await request.json();

    const totalReservasDiv = document.getElementById("total");
    totalReservasDiv.textContent = response.total;

    const hoyReservasDiv = document.getElementById("hoy");
    hoyReservasDiv.textContent = response.hoy;

    const activasReservasDiv = document.getElementById("activas");
    activasReservasDiv.textContent = response.activas;

    const canceladasReservasDiv = document.getElementById("canceladas");
    canceladasReservasDiv.textContent = response.canceladas;

    return new Promise(resolve => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                resolve();
            })
        })
    })
}

async function filtrarPorCliente(id) {
    const request = await fetch(`http://localhost:8080/api/reserva/filter/cliente/${id}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    });
    const reservas = await request.json();
    updateTabla(reservas, paginaActual)
}

async function filtrarPorRecurso(id) {
    const request = await fetch(`http://localhost:8080/api/reserva/filter/recurso/${id}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    });
    const reservas = await request.json();
    updateTabla(reservas, paginaActual)
}

async function filtrarPorClienteAndRecurso(id_recurso, id_cliente) {
    const request = await fetch(`http://localhost:8080/api/reserva/filter?id_recurso=${id_recurso}&id_cliente=${id_cliente}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    });
    const reservas = await request.json();
    updateTabla(reservas, paginaActual)
}