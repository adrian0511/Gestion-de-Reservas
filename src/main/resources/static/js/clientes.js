let currentId = null;

document.addEventListener("DOMContentLoaded", () => {
    const formEdit = document.getElementById("editForm");
    const formClient = document.getElementById("clientForm");
    const limpiarForm = document.getElementById("btn-clear");

    formClient.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!formClient.checkValidity) {
            return;
        }
        await crearCliente();
        formClient.reset();
    });

    formEdit.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!formEdit.checkValidity) {
            return;
        }
        await editarCliente(currentId);
        formEdit.reset();
    });

    limpiarForm.addEventListener("click", () => {
        formClient.reset();
    })

    cargarClientes();
})



async function crearCliente() {
    let datos = {};
    datos.nombre = document.getElementById("nombre").value;
    datos.apellido = document.getElementById("apellido").value;
    datos.email = document.getElementById("email").value;
    datos.telefono = document.getElementById("telefono").value;

    const request = await fetch('http://localhost:8080/api/clients', {
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
            text: "Cliente añadido con éxito",
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

async function cargarClientes() {
    const request = await fetch('http://localhost:8080/api/clients', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    });
    const clientes = await request.json();
    updateTabla(clientes);

}

function updateTabla(filas) {
    const tBody = document.getElementById("clientsTableBody");
    const tablaEmpty = document.getElementById("emptyState");

    filas.forEach(element => {

        const fila = tBody.insertRow();

        // Crear las celdas
        const celdaId = fila.insertCell(0);
        const celdaNombre = fila.insertCell(1);
        const celdaEmail = fila.insertCell(2);
        const celdaTelefono = fila.insertCell(3);
        const celdaAcciones = fila.insertCell(4);

        // Contenido de las celdas
        celdaId.textContent = element.id;
        celdaNombre.textContent = `${element.nombre} ${element.apellido}`;
        celdaEmail.textContent = element.email;
        celdaTelefono.textContent = element.telefono;

        // Crear los botones de las acciones
        const btnVer = document.createElement("button");
        btnVer.textContent = "📅 Ver Reservas";
        btnVer.className = "btn btn-info";
        btnVer.addEventListener("click", () => {
            window.location.href = `../reservas/index.html?clienteId=${element.id}`;
        })

        const btnEditar = document.createElement("button");
        btnEditar.textContent = "✏ Editar";
        btnEditar.className = "btn btn-edit";
        btnEditar.addEventListener("click", () => {
            openModal(element.id);
        })

        const btnDelete = document.createElement("button");
        btnDelete.textContent = "🗑 Eliminar";
        btnDelete.className = "btn btn-delete";
        btnDelete.addEventListener("click", () => {
            mostrarAlerta({
                tipo: "confirm",
                title: "Advertencia",
                text: "¿Está seguro de querer eliminar el cliente?",
                onConfirm: () => {
                    eliminarCliente(element.id);
                },
                icon: "warning",
                recargar: false
            });
        });

        celdaAcciones.appendChild(btnVer);
        celdaAcciones.appendChild(btnEditar);
        celdaAcciones.appendChild(btnDelete);
        celdaAcciones.className = "actions";
    });

    if (tBody.getElementsByTagName("tr").length === 0) {
        tablaEmpty.style.display = "block";
    } else {
        tablaEmpty.style.display = "none";

    }
}

async function eliminarCliente(id) {
    const request = await fetch(`http://localhost:8080/api/clients/${id}`, {
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
            text: "Cliente eliminado con éxito",
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

async function editarCliente(id) {
    let datos = {};
    datos.nombre = document.getElementById("editNombre").value;
    datos.apellido = document.getElementById("editApellido").value;
    datos.email = document.getElementById("editEmail").value;
    datos.telefono = document.getElementById("editTelefono").value;

    const request = await fetch(`http://localhost:8080/api/clients/${id}`, {
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
            text: "Cliente editado con éxito",
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

async function buscarId(id) {
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

async function openModal(id) {
    const cliente = await buscarId(id);
    const modal = document.getElementById("editModal");
    const btn_secondary = document.getElementById("btn-secondary");
    const btn_cancelar = document.getElementById("close");

    // Llenar los inputs
    document.getElementById("editNombre").value = cliente.nombre;
    document.getElementById("editApellido").value = cliente.apellido;
    document.getElementById("editEmail").value = cliente.email;
    document.getElementById("editTelefono").value = cliente.telefono;

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