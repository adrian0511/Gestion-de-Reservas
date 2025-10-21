let currentId = null;

document.addEventListener("DOMContentLoaded", () => {
    const formCreate = document.getElementById("formCreate");
    const formEdit = document.getElementById("editResourceForm");

    formCreate.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!formCreate.checkValidity) {
            return;
        }
        await crearRecurso();
        formCreate.reset();
    });

    formEdit.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!formEdit.checkValidity) { return; }
        await editarRecurso(currentId);
        formEdit.reset();
    })

    cargarRecursos();
})

async function crearRecurso() {
    let datos = {};

    datos.tipo = document.getElementById("tipo").value;
    datos.descripcion = document.getElementById("descripcion").value;
    datos.capacidad = parseInt(document.getElementById("capacidad").value);
    datos.estado = true;

    const request = await fetch(`http://localhost:8080/api/resource`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
    }).then(res => {
        if (!res.ok) {
            return res.json().then(data => {
                throw new Error(data.error);
            });
        }
    }).then(data => {
        mostrarAlerta({
            title: "Éxito",
            text: "Recurso añadido con éxito",
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

async function cargarRecursos() {
    const request = await fetch(`http://localhost:8080/api/resource`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    });
    const recursos = await request.json();
    updateTabla(recursos);
}

function updateTabla(filas) {
    const tBody = document.getElementById("tBody");
    const tablaEmpty = document.getElementById("emptyState");

    filas.forEach(element => {
        const fila = tBody.insertRow();

        const celdaId = fila.insertCell(0);
        const celdaTipo = fila.insertCell(1);
        const celdaDescripcion = fila.insertCell(2);
        const celdaCapacidad = fila.insertCell(3);
        const celdaEstado = fila.insertCell(4);
        const celdaAcciones = fila.insertCell(5);

        const strongId = document.createElement("strong");
        strongId.textContent = `#${element.id.toString().padStart(3, '0')}`;
        celdaId.appendChild(strongId);

        const spanTipo = document.createElement("span");

        switch (element.tipo) {
            case "SALON":
                spanTipo.className = "resource-type salon";
                spanTipo.textContent = "Salón de Eventos";
                break;

            case "OFICINA":
                spanTipo.className = "resource-type oficina";
                spanTipo.textContent = "Oficina";
                break;

            case "AUDITORIO":
                spanTipo.className = "resource-type auditorio";
                spanTipo.textContent = "Auditorio";
                break;

            case "LABORATORIO":
                spanTipo.className = "resource-type laboratorio";
                spanTipo.textContent = "Laboratorio";
                break;

            case "VEHICULO":
                spanTipo.className = "resource-type vehiculo";
                spanTipo.textContent = "Vehículo";
                break;
        }

        celdaTipo.appendChild(spanTipo);

        celdaDescripcion.textContent = element.descripcion;

        const spanCapacidad = document.createElement("span");
        spanCapacidad.className = "capacity-badge";
        spanCapacidad.textContent = `👥 ${element.capacidad} personas`;
        celdaCapacidad.appendChild(spanCapacidad);

        (element.estado) ? celdaEstado.textContent = "✅ Disponible" : celdaEstado.textContent = "📅 Reservado";

        const btnEdit = document.createElement("button");
        btnEdit.className = "btn btn-edit";
        btnEdit.textContent = "✏ Editar"
        btnEdit.addEventListener("click", () => {
            openModal(element.id);
        })

        const btnDelete = document.createElement("button");
        btnDelete.className = "btn btn-delete";
        btnDelete.textContent = "🗑 Eliminar";
        btnDelete.addEventListener("click", () => {
            mostrarAlerta({
                tipo: "confirm",
                title: "Advertencia",
                text: "¿Está seguro de querer eliminar el recurso?",
                onConfirm: () => {
                    eliminarRecurso(element.id);
                },
                icon: "warning",
                recargar: false
            });
        })

        const btnInfo = document.createElement("button");
        btnInfo.className = "btn btn-info";
        btnInfo.textContent = "📅 Ver Reservas";
        btnInfo.addEventListener("click", () => {
            window.location.href = `../reservas/index.html?recursoId=${element.id}`;
        })

        celdaAcciones.appendChild(btnEdit);
        celdaAcciones.appendChild(btnDelete);
        celdaAcciones.appendChild(btnInfo);
        celdaAcciones.className = "actions";
    });

    (tBody.getElementsByTagName("tr").length === 0) ? tablaEmpty.style.display = "block" : tablaEmpty.style.display = "none";
}

async function eliminarRecurso(id) {
    const request = await fetch(`http://localhost:8080/api/resource/${id}`, {
        method: 'DELETE',
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
            text: "Recurso eliminado con éxito",
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

async function editarRecurso(id) {
    let datos = {};

    datos.tipo = document.getElementById("editTipo").value;
    datos.descripcion = document.getElementById("editDescripcion").value;
    datos.capacidad = parseInt(document.getElementById("editCapacidad").value);

    const request = await fetch(`http://localhost:8080/api/resource/${id}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
    }).then(res => {
        if (!res.ok) {
            return res.json().then(data => {
                throw new Error(data.error);
            });
        }
    }).then(data => {
        mostrarAlerta({
            title: "Éxito",
            text: "Recurso editado con éxito",
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
    const recurso = await buscarId(id);
    const modal = document.getElementById("editModal");
    const btn_secondary = document.getElementById("btn-secondary");
    const btn_cancelar = document.getElementById("close");

    // Llenar los inputs
    document.getElementById("editTipo").value = recurso.tipo;
    document.getElementById("editDescripcion").value = recurso.descripcion;
    document.getElementById("editCapacidad").value = recurso.capacidad;

    modal.style.display = "block";

    btn_secondary.addEventListener("click", () => {
        modal.style.display = "none";
    });

    btn_cancelar.addEventListener("click", () => {
        modal.style.display = "none";
    });

    currentId = id;

    window.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    };

}

async function buscarId(id) {
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