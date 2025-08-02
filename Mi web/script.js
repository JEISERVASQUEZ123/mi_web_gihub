// Ocultar loader cuando la página esté completamente cargada
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.style.display = 'none';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const registroForm = document.getElementById('registroForm');
  const loginForm = document.getElementById('loginForm');
  const mensajeRegistro = document.getElementById('mensajeRegistro');
  const mensajeLogin = document.getElementById('mensajeLogin');
  const bienvenidaUsuario = document.getElementById('bienvenidaUsuario');
  const cerrarSesionBtn = document.getElementById('cerrarSesionBtn');
  const listaEntradas = document.getElementById('listaEntradas');
  const filtroEvento = document.getElementById('filtroEvento');
  const modoOscuroBtn = document.getElementById('modoOscuroBtn');
  const modal = document.getElementById('modalConfirmacion');
  const cerrarModal = document.getElementById('cerrarModal');
  const mensajeConfirmacion = document.getElementById('mensajeConfirmacion');
  const btnVolverArriba = document.getElementById('btnVolverArriba');

  window.addEventListener('scroll', () => {
    btnVolverArriba.style.display = window.scrollY > 300 ? 'block' : 'none';
  });

  btnVolverArriba.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  modoOscuroBtn.addEventListener('click', () => {
    document.body.classList.toggle('modo-oscuro');
  });

  registroForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const clave = document.getElementById('clave').value.trim();

    if (nombre && correo && clave) {
      localStorage.setItem('usuario', JSON.stringify({ nombre, correo, clave }));
      mensajeRegistro.textContent = '✅ Registro exitoso. Ahora inicia sesión.';
      registroForm.reset();
    } else {
      mensajeRegistro.textContent = '❌ Completa todos los campos.';
    }
  });

  loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const correo = document.getElementById('loginCorreo').value.trim();
    const clave = document.getElementById('loginClave').value.trim();
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    if (usuario && usuario.correo === correo && usuario.clave === clave) {
      localStorage.setItem('sesionActiva', 'true');
      localStorage.setItem('usuarioActivo', JSON.stringify(usuario));
      mostrarBienvenida(usuario.nombre);
      mensajeLogin.textContent = '';
      loginForm.reset();
      location.href = "#eventos";
    } else {
      mensajeLogin.textContent = '❌ Correo o contraseña incorrectos.';
    }
  });

  function mostrarBienvenida(nombre) {
    bienvenidaUsuario.textContent = `👤 Bienvenido, ${nombre}`;
    cerrarSesionBtn.style.display = 'inline-block';
  }

  cerrarSesionBtn?.addEventListener('click', () => {
    localStorage.removeItem('sesionActiva');
    localStorage.removeItem('usuarioActivo');
    bienvenidaUsuario.textContent = '';
    cerrarSesionBtn.style.display = 'none';
    location.href = "#inicio";
  });

  const usuarioGuardado = JSON.parse(localStorage.getItem('usuarioActivo'));
  if (localStorage.getItem('sesionActiva') && usuarioGuardado) {
    mostrarBienvenida(usuarioGuardado.nombre);
  }

  document.querySelectorAll('.comprarBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
      if (!usuario) {
        alert('Debes iniciar sesión para comprar una entrada.');
        return;
      }
      const evento = btn.parentElement.querySelector('h3').textContent;
      const entrada = `🎫 Entrada para: ${evento}`;
      const entradas = JSON.parse(localStorage.getItem('entradasCompradas')) || [];
      entradas.push({ usuario: usuario.correo, evento });
      localStorage.setItem('entradasCompradas', JSON.stringify(entradas));

      mensajeConfirmacion.textContent = entrada;
      modal.style.display = 'block';
      mostrarEntradas();
    });
  });

  function mostrarEntradas() {
    const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
    const entradas = JSON.parse(localStorage.getItem('entradasCompradas')) || [];
    const entradasUsuario = entradas.filter(e => e.usuario === usuario?.correo);

    listaEntradas.innerHTML = '';
    if (entradasUsuario.length === 0) {
      listaEntradas.innerHTML = '<p>No tienes entradas compradas.</p>';
    } else {
      entradasUsuario.forEach(e => {
        const item = document.createElement('div');
        item.classList.add('entradaItem');
        item.textContent = `🎟️ ${e.evento}`;
        listaEntradas.appendChild(item);
      });
    }
  }

  mostrarEntradas();

  cerrarModal?.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  filtroEvento?.addEventListener('input', () => {
    const filtro = filtroEvento.value.toLowerCase();
    document.querySelectorAll('.evento').forEach(evento => {
      const titulo = evento.querySelector('h3').textContent.toLowerCase();
      evento.style.display = titulo.includes(filtro) ? 'block' : 'none';
    });
  });

  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('activo');
    });
  }
});

fetch('js/eventos.json') // Asegúrate que la ruta sea correcta
  .then(response => response.json())
  .then(data => {
    const contenedor = document.getElementById('contenedorEventos');
    contenedor.innerHTML = ''; // Limpiar

    data.forEach(evento => {
      const tarjeta = document.createElement('div');
      tarjeta.className = 'tarjeta-evento evento';

      tarjeta.innerHTML = `
        <img src="${evento.imagen}" alt="${evento.titulo}">
        <div class="contenido">
          <h3>${evento.titulo}</h3>
          <p>${evento.descripcion}</p>
          <button class="comprarBtn">Comprar entrada</button>
        </div>
      `;

      contenedor.appendChild(tarjeta);
    });

    // Reactivar botones de compra para los eventos cargados
    document.querySelectorAll('.comprarBtn').forEach(btn => {
      btn.addEventListener('click', () => {
        const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
        if (!usuario) {
          alert('Debes iniciar sesión para comprar una entrada.');
          return;
        }
        const evento = btn.parentElement.querySelector('h3').textContent;
        const entrada = `🎫 Entrada para: ${evento}`;
        const entradas = JSON.parse(localStorage.getItem('entradasCompradas')) || [];
        entradas.push({ usuario: usuario.correo, evento });
        localStorage.setItem('entradasCompradas', JSON.stringify(entradas));

        const modal = document.getElementById('modalConfirmacion');
        const mensajeConfirmacion = document.getElementById('mensajeConfirmacion');
        mensajeConfirmacion.textContent = entrada;
        modal.style.display = 'block';
      });
    });
  })

  .catch(error => console.error('Error al cargar eventos:', error));

  document.addEventListener('DOMContentLoaded', () => {
    // Código existente que ya tengas en script.js, como el loader, modo oscuro, etc.
    // ... (Tu código actual de script.js aquí) ...

    // ----- FUNCIONALIDAD DEL BUSCADOR DE EVENTOS -----

    const filtroEventoInput = document.getElementById('filtroEvento');
    const contenedorEventos = document.querySelector('.contenedor-eventos');
    const tarjetasEvento = contenedorEventos ? contenedorEventos.querySelectorAll('.tarjeta-evento') : []; // Asegura que existan tarjetas

    if (filtroEventoInput) {
        filtroEventoInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim(); // Obtiene el término de búsqueda y lo normaliza

            tarjetasEvento.forEach(tarjeta => {
                const tituloEvento = tarjeta.querySelector('h3') ? tarjeta.querySelector('h3').textContent.toLowerCase() : '';
                const lugarFechaEvento = tarjeta.querySelector('p') ? tarjeta.querySelector('p').textContent.toLowerCase() : '';

                // Combina el título y la descripción/lugar para buscar en ambos
                const contenidoCompleto = `${tituloEvento} ${lugarFechaEvento}`;

                if (contenidoCompleto.includes(searchTerm)) {
                    tarjeta.style.display = 'flex'; // Muestra la tarjeta si coincide
                } else {
                    tarjeta.style.display = 'none'; // Oculta la tarjeta si no coincide
                }
            });
        });
    }

    // ----- FIN FUNCIONALIDAD DEL BUSCADOR DE EVENTOS -----


    // Ejemplo de cómo podrías manejar Mis Entradas con JavaScript
    // Esto es solo una sugerencia si aún no tienes esta lógica
    const listaEntradasDiv = document.getElementById('listaEntradas');
    if (listaEntradasDiv) {
        // Simulación de algunas entradas. En un caso real, esto vendría de una API o localStorage.
        const misEntradas = [
            { id: 1, evento: 'Concierto de Rock', fecha: '30/08/2025', lugar: 'Lima', cantidad: 1 },
            { id: 2, evento: 'Maratón Solidaria', fecha: '20/09/2025', lugar: 'Trujillo', cantidad: 2 },
            { id: 3, evento: 'ExpoTecnología 2025', fecha: '05/10/2025', lugar: 'Arequipa', cantidad: 1 }
        ];

        function mostrarMisEntradas() {
            if (listaEntradasDiv) {
                listaEntradasDiv.innerHTML = ''; // Limpia el contenido anterior
                if (misEntradas.length === 0) {
                    listaEntradasDiv.innerHTML = '<p style="text-align: center;">Aún no tienes entradas.</p>';
                } else {
                    misEntradas.forEach(entrada => {
                        const entradaItem = document.createElement('div');
                        entradaItem.classList.add('entradaItem');
                        entradaItem.innerHTML = `
                            <h3>${entrada.evento}</h3>
                            <p>Fecha: ${entrada.fecha}</p>
                            <p>Lugar: ${entrada.lugar}</p>
                            <p>Cantidad: ${entrada.cantidad}</p>
                        `;
                        listaEntradasDiv.appendChild(entradaItem);
                    });
                }
            }
        }

        // Llama a la función para mostrar las entradas al cargar la página
        mostrarMisEntradas();
    }
});

