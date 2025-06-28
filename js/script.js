// Estado global de la aplicación
let state = {
    variables: [
        { id: 'x1', display: 'x₁' },
        { id: 'x2', display: 'x₂' }
    ],
    restricciones: [],
    specialConstraints: [],
    tipoOptimizacion: 'max'
};

// Función para obtener subíndices
function getSubscript(number) {
    const subscripts = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
    return number.toString().replace(/\d/g, d => subscripts[parseInt(d)]);
}

// ==================== FUNCIONES PRINCIPALES ====================

// Función para agregar nuevas variables
function agregarColumna() {
    const nextIndex = state.variables.length + 1;
    const nuevaVariable = {
        id: `x${nextIndex}`,
        display: `x${getSubscript(nextIndex)}`
    };

    state.variables.push(nuevaVariable);
    actualizarVistaCompleta();
    actualizarOpcionesVariables();
}

// Función para eliminar la última variable
function eliminarUltimaVariable() {
    if (state.variables.length <= 2) {
        alert("Debe haber al menos 2 variables");
        return;
    }

    state.variables.pop();
    actualizarVistaCompleta();
    actualizarOpcionesVariables();
}

// Función para agregar nuevas restricciones
function agregarFila() {
    const tbody = document.getElementById("bodyTabla");
    const nuevaFila = tbody.insertRow();

    nuevaFila.innerHTML = `
        <td><input type="text" placeholder="Restricción ${tbody.rows.length + 0}" class="input-style"></td> 
        ${state.variables.map(v => `
            <td><input type="number" step="any" placeholder=" ${v.display}" 
                 class="input-coef" data-var="${v.id}"></td>
        `).join('')}
        <td>
            <select class="select-style">
                <option value="≤">≤</option>
                <option value="=">=</option>
                <option value="≥">≥</option>
            </select>
        </td>
        <td><input type="number" step="any" placeholder="RHS" class="input-coef"></td>
        <td><button onclick="eliminarFila(this)" class="btn btn-danger"><i class="fa fa-minus-circle"></i></button></td>
    `;
}

// Función para eliminar filas de restricción
function eliminarFila(button) {
    const fila = button.closest('tr');
    const tbody = document.getElementById("bodyTabla");

    if (tbody.rows.length > 1) {
        fila.remove();
        renumerarRestricciones();
    } else {
        alert("Debe haber al menos una restricción");
    }
}

// ==================== FUNCIONES DE ACTUALIZACIÓN ====================

// Función para actualizar toda la vista
function actualizarVistaCompleta() {
    actualizarEncabezados();
    actualizarFuncionObjetivo();
    actualizarFilasRestricciones();
}

function actualizarEncabezados() {
    const thead = document.querySelector("#tablaCanonica thead tr");
    thead.innerHTML = `
        <th>Concepto</th>
        ${state.variables.map(v => `<th>${v.display}</th>`).join('')}
        <th>Signo</th>
        <th>RHS</th>
        <th>Acción</th>
    `;
}

function actualizarFuncionObjetivo() {
    const zFila = document.querySelector("#tablaCanonica tfoot tr");
    zFila.innerHTML = `
        <th>Función Objetivo (Z)</th>
        ${state.variables.map(v => `
            <td><input type="number" step="any" id="z_${v.id}" 
                 placeholder=" ${v.display}" class="input-coef"></td>
        `).join('')}
        <td colspan="2">
            <select id="z_tipo" class="select-style">
                <option value="max" ${state.tipoOptimizacion === 'max' ? 'selected' : ''}>Maximizar</option>
                <option value="min" ${state.tipoOptimizacion === 'min' ? 'selected' : ''}>Minimizar</option>
            </select>
        </td>
    `;
}

function actualizarFilasRestricciones() {
    const tbody = document.getElementById("bodyTabla");
    const filas = tbody.querySelectorAll("tr");

    filas.forEach((fila, index) => {
        const inputs = Array.from(fila.querySelectorAll("input")).map(i => i.value);
        const selectValue = fila.querySelector("select")?.value || "≤";

        fila.innerHTML = `
            <td><input type="text" value="${inputs[0] || ''}" 
                 placeholder="Restricción ${index + 1}" class="input-style"></td>
            ${state.variables.map((v, i) => `
                <td><input type="number" step="any" value="${inputs[i + 1] || ''}" 
                     placeholder=" ${v.display}" class="input-coef" data-var="${v.id}"></td>
            `).join('')}
            <td>
                <select class="select-style">
                    <option value="≤" ${selectValue === '≤' ? 'selected' : ''}>≤</option>
                    <option value="=" ${selectValue === '=' ? 'selected' : ''}>=</option>
                    <option value="≥" ${selectValue === '≥' ? 'selected' : ''}>≥</option>
                </select>
            </td>
            <td><input type="number" step="any" value="${inputs[inputs.length - 1] || ''}" 
                 class="input-coef"></td>         
        `;
    });
}

function renumerarRestricciones() {
    document.querySelectorAll("#bodyTabla tr").forEach((fila, index) => {
        fila.cells[0].querySelector('input').placeholder = `Restricción ${index + 1}`;
    });
}

// ==================== RESTRICCIONES ESPECIALES ====================

function actualizarOpcionesVariables() {
    const selectVarEsp = document.getElementById("varEsp");
    selectVarEsp.innerHTML = state.variables.map(v =>
        `<option value="${v.id}">${v.display}</option>`
    ).join('');
}

function agregarRestriccionEspecial() {
    const varEsp = document.getElementById("varEsp").value;
    const opEsp = document.getElementById("opEsp").value;
    const valorEsp = document.getElementById("valorEsp").value;

    if (!valorEsp || isNaN(valorEsp)) {
        alert("Ingrese un valor válido");
        return;
    }

    const variable = state.variables.find(v => v.id === varEsp);
    const nuevaRestriccion = {
        texto: `${variable.display} ${opEsp} ${valorEsp}`,
        variable: varEsp,
        operador: opEsp,
        valor: valorEsp
    };

    state.specialConstraints.push(nuevaRestriccion);
    actualizarListaRestricciones();
}

function actualizarListaRestricciones() {
    const lista = document.getElementById("listaRestricciones");
    lista.innerHTML = state.specialConstraints.map((r, i) => `
        <div class="constraint-item">
            <span class="constraint-text">${r.texto}</span>
            <button onclick="eliminarRestriccionEspecial(${i})" class="btn btn-danger btn-sm">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

function eliminarRestriccionEspecial(index) {
    state.specialConstraints.splice(index, 1);
    actualizarListaRestricciones();
}

// ==================== GENERACIÓN DEL MODELO ====================

function generarModelo() {
    if (!validarInputs()) {
        alert("Corrija los valores inválidos antes de generar el modelo");
        return;
    }

    state.tipoOptimizacion = document.getElementById("z_tipo").value;

    const modelo = {
        objetivo: generarFuncionObjetivo(),
        restricciones: generarRestricciones(),
        variablesNoNegativas: state.variables.map(v => v.display).join(", "),
        restriccionesEspeciales: state.specialConstraints.map(r => r.texto)
    };

    mostrarResultado(modelo);
}

function generarFuncionObjetivo() {
    return state.variables.map(v => {
        const coef = parseFloat(document.getElementById(`z_${v.id}`).value) || 0;
        return coef !== 0 ? `${coef}${v.display}` : null;
    }).filter(Boolean).join(" + ") || "0";
}

function generarRestricciones() {
    const filas = document.querySelectorAll("#bodyTabla tr");
    return Array.from(filas).map(fila => {
        const inputs = fila.querySelectorAll("input, select");
        const terminos = state.variables.map((v, i) => {
            const coef = parseFloat(inputs[i + 1].value) || 0;
            return coef !== 0 ? `${coef}${v.display}` : null;
        }).filter(Boolean).join(" + ") || "0";

        return `${terminos} ${inputs[state.variables.length + 1].value} ${inputs[state.variables.length + 2].value}`;
    });
}

function mostrarResultado(modelo) {
    const resultado = document.getElementById("resultado");
    let salida = `<h3>Modelo Matemático (Forma Canónica)</h3><pre>`;

    salida += `${state.tipoOptimizacion === 'max' ? 'Max' : 'Min'} Z = ${modelo.objetivo}\n\ns.a.\n`;
    salida += modelo.restricciones.map(r => r).join('\n');
    salida += `\n\n${modelo.variablesNoNegativas} ≥ 0`;

    if (modelo.restriccionesEspeciales.length > 0) {
        salida += `\n\nRestricciones especiales:\n${modelo.restriccionesEspeciales.join('\n')}`;
    }

    salida += `</pre>`;
    resultado.innerHTML = salida;
}

// ==================== VALIDACIÓN ====================

function validarInputs() {
    let isValid = true;

    document.querySelectorAll('input[type="number"]').forEach(input => {
        if (input.value && isNaN(input.value)) {
            input.classList.add('input-error');
            isValid = false;
        } else {
            input.classList.remove('input-error');
        }
    });

    return isValid;
}

// ==================== INICIALIZACIÓN ====================

document.addEventListener('DOMContentLoaded', () => {
    // Configurar eventos
    document.getElementById('eliminarVariableBtn')?.addEventListener('click', eliminarUltimaVariable);

    // Inicializar vista
    actualizarVistaCompleta();
    actualizarOpcionesVariables();

    // Agregar primera restricción si no existe
    if (document.getElementById("bodyTabla").rows.length === 0) {
        agregarFila();
    }
});


// Verifica la orientación al cargar y al girar
function checkOrientation() {
    if (window.innerWidth < 768 && window.matchMedia("(orientation: portrait)").matches) {
        document.getElementById('orientation-warning').style.display = 'flex';
    } else {
        document.getElementById('orientation-warning').style.display = 'none';
    }
}

// Ejecutar al cargar y al cambiar tamaño/orientación
window.addEventListener('load', checkOrientation);
window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', checkOrientation);