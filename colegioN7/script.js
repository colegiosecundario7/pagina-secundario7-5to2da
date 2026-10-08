// ===== Carrusel de fotos automático =====
(function () {
    const track = document.getElementById('carrusel-track');
    const slides = track ? Array.from(track.children) : [];
    const dotsContainer = document.getElementById('carrusel-dots');
    const btnPrev = document.getElementById('carrusel-prev');
    const btnNext = document.getElementById('carrusel-next');
    const carrusel = document.getElementById('carrusel');

    if (!track || slides.length === 0) return;

    let indiceActual = 0;
    let intervalo;
    const TIEMPO_AUTO = 4500;

    // Crear los puntos (dots) según la cantidad de fotos
    slides.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('activo');
        dot.addEventListener('click', () => irASlide(i));
        dotsContainer.appendChild(dot);
    });
    const dots = Array.from(dotsContainer.children);

    function actualizarCarrusel() {
        track.style.transform = `translateX(-${indiceActual * 100}%)`;
        dots.forEach(d => d.classList.remove('activo'));
        dots[indiceActual].classList.add('activo');
    }

    function irASlide(i) {
        indiceActual = i;
        actualizarCarrusel();
        reiniciarAuto();
    }

    function siguienteSlide() {
        indiceActual = (indiceActual + 1) % slides.length;
        actualizarCarrusel();
    }

    function anteriorSlide() {
        indiceActual = (indiceActual - 1 + slides.length) % slides.length;
        actualizarCarrusel();
    }

    function iniciarAuto() {
        intervalo = setInterval(siguienteSlide, TIEMPO_AUTO);
    }

    function reiniciarAuto() {
        clearInterval(intervalo);
        iniciarAuto();
    }

    btnNext.addEventListener('click', () => { siguienteSlide(); reiniciarAuto(); });
    btnPrev.addEventListener('click', () => { anteriorSlide(); reiniciarAuto(); });

    // Pausar el auto-avance mientras el mouse está sobre el carrusel
    carrusel.addEventListener('mouseenter', () => clearInterval(intervalo));
    carrusel.addEventListener('mouseleave', iniciarAuto);

    iniciarAuto();
})();

// ===== Navegación entre secciones =====
(function () {
    const secciones = Array.from(document.querySelectorAll('main > section'));
    const checkMenu = document.getElementById('check');

    function mostrarSeccion(id) {
        const destino = document.getElementById(id);
        if (!destino || destino.tagName !== 'SECTION') return;
        secciones.forEach(s => s.style.display = 'none');
        destino.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function (e) {
            const id = this.getAttribute('href').substring(1);
            const destino = document.getElementById(id);
            if (destino && destino.tagName === 'SECTION') {
                e.preventDefault();
                mostrarSeccion(id);
                history.pushState(null, '', '#' + id);
            }
            // Cierra el menú hamburguesa en celular al elegir una opción
            if (checkMenu) checkMenu.checked = false;
        });
    });

    // Si la URL ya trae un hash al cargar la página, mostrar esa sección
    window.addEventListener('DOMContentLoaded', () => {
        const hash = window.location.hash.replace('#', '');
        if (hash && document.getElementById(hash)) {
            mostrarSeccion(hash);
        }
    });
})();

// ===== Pestañas de Cursos (año por año, con sus divisiones) =====
(function () {
    const links = document.querySelectorAll('.anio-link');
    const contenidos = document.querySelectorAll('.anio-contenido');

    links.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const anio = this.getAttribute('data-anio');

            links.forEach(l => l.classList.remove('activo'));
            this.classList.add('activo');

            contenidos.forEach(c => c.classList.remove('activo'));
            const destino = document.getElementById('anio-' + anio);
            if (destino) destino.classList.add('activo');
        });
    });
})();

// ===== Submenú "Colegio" desplegable en celular =====
(function () {
    const botones = document.querySelectorAll('.sub-toggle');

    function plegar() {
        botones.forEach(b => {
            b.closest('li').classList.remove('abierto');
            b.setAttribute('aria-expanded', 'false');
        });
    }

    botones.forEach(boton => {
        boton.addEventListener('click', function () {
            const li = this.closest('li');
            const abierto = li.classList.toggle('abierto');
            this.setAttribute('aria-expanded', abierto);
        });
    });

    // Al elegir una opción, el submenú vuelve a quedar plegado
    document.querySelectorAll('.menu a').forEach(a => a.addEventListener('click', plegar));
})();

// ===== Novedades: muestra el aviso solo si no hay ninguna cargada =====
(function () {
    const lista = document.getElementById('noticias-lista');
    const aviso = document.getElementById('sin-novedades');
    if (!lista || !aviso) return;
    aviso.hidden = lista.querySelectorAll('.noticia').length > 0;
})();

// ===== Galería de fotos con zoom (visor) =====
(function () {
    const items = Array.from(document.querySelectorAll('.galeria-item'));
    if (items.length === 0) return;

    const visor = document.createElement('div');
    visor.className = 'visor';
    visor.hidden = true;
    visor.setAttribute('role', 'dialog');
    visor.setAttribute('aria-modal', 'true');
    visor.setAttribute('aria-label', 'Visor de fotos');
    visor.innerHTML =
        '<div class="visor-barra">' +
            '<span class="visor-contador"></span>' +
            '<div class="visor-acciones">' +
                '<button type="button" data-accion="menos" aria-label="Alejar"><i class="fa-solid fa-magnifying-glass-minus"></i></button>' +
                '<button type="button" data-accion="mas" aria-label="Acercar"><i class="fa-solid fa-magnifying-glass-plus"></i></button>' +
                '<button type="button" data-accion="cerrar" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>' +
            '</div>' +
        '</div>' +
        '<div class="visor-escena"><img class="visor-img" alt=""></div>' +
        '<button type="button" class="visor-nav prev" data-accion="anterior" aria-label="Foto anterior"><i class="fa-solid fa-chevron-left"></i></button>' +
        '<button type="button" class="visor-nav next" data-accion="siguiente" aria-label="Foto siguiente"><i class="fa-solid fa-chevron-right"></i></button>' +
        '<p class="visor-pie"></p>';
    document.body.appendChild(visor);

    const escena = visor.querySelector('.visor-escena');
    const img = visor.querySelector('.visor-img');
    const pie = visor.querySelector('.visor-pie');
    const contador = visor.querySelector('.visor-contador');
    const btnCerrar = visor.querySelector('[data-accion="cerrar"]');

    const ZOOM_MAX = 4;
    let actual = 0;
    let zoom = 1;
    let anchoBase = 0;

    function ajustar() {
        if (zoom === 1) {
            img.style.width = '';
            img.style.maxWidth = '';
            img.style.maxHeight = '';
            anchoBase = img.getBoundingClientRect().width;
        } else {
            img.style.maxWidth = 'none';
            img.style.maxHeight = 'none';
            img.style.width = (anchoBase * zoom) + 'px';
        }
        visor.classList.toggle('con-zoom', zoom > 1);
    }

    function setZoom(nuevo) {
        nuevo = Math.min(ZOOM_MAX, Math.max(1, nuevo));
        if (nuevo === zoom) return;
        const cx = (escena.scrollLeft + escena.clientWidth / 2) / escena.scrollWidth;
        const cy = (escena.scrollTop + escena.clientHeight / 2) / escena.scrollHeight;
        zoom = nuevo;
        ajustar();
        escena.scrollLeft = cx * escena.scrollWidth - escena.clientWidth / 2;
        escena.scrollTop = cy * escena.scrollHeight - escena.clientHeight / 2;
    }

    function mostrar(i) {
        actual = (i + items.length) % items.length;
        const fig = items[actual];
        const foto = fig.querySelector('img');
        const texto = fig.querySelector('figcaption');
        zoom = 1;
        escena.scrollLeft = 0;
        escena.scrollTop = 0;
        img.onload = ajustar;
        img.src = foto.currentSrc || foto.src;
        img.alt = foto.alt;
        ajustar();
        pie.textContent = texto ? texto.textContent.trim() : '';
        pie.style.display = pie.textContent ? '' : 'none';
        contador.textContent = (actual + 1) + ' / ' + items.length;
    }

    function abrir(i) {
        visor.hidden = false;
        document.body.style.overflow = 'hidden';
        mostrar(i);
        btnCerrar.focus();
    }

    function cerrar() {
        visor.hidden = true;
        document.body.style.overflow = '';
        items[actual].focus();
    }

    items.forEach((fig, i) => {
        fig.tabIndex = 0;
        fig.setAttribute('role', 'button');
        fig.setAttribute('aria-label', 'Ampliar foto: ' + (fig.querySelector('img').alt || ''));
        fig.addEventListener('click', () => abrir(i));
        fig.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                abrir(i);
            }
        });
    });

    visor.addEventListener('click', e => {
        const boton = e.target.closest('[data-accion]');
        if (boton) {
            const accion = boton.getAttribute('data-accion');
            if (accion === 'cerrar') cerrar();
            if (accion === 'anterior') mostrar(actual - 1);
            if (accion === 'siguiente') mostrar(actual + 1);
            if (accion === 'mas') setZoom(zoom + 0.75);
            if (accion === 'menos') setZoom(zoom - 0.75);
            return;
        }
        // Tocar la foto alterna entre tamaño normal y zoom; tocar el fondo cierra
        if (e.target === img) setZoom(zoom === 1 ? 2.5 : 1);
        else if (e.target === escena) cerrar();
    });

    document.addEventListener('keydown', e => {
        if (visor.hidden) return;
        if (e.key === 'Escape') cerrar();
        if (e.key === 'ArrowLeft') mostrar(actual - 1);
        if (e.key === 'ArrowRight') mostrar(actual + 1);
        if (e.key === '+' || e.key === '=') setZoom(zoom + 0.75);
        if (e.key === '-') setZoom(zoom - 0.75);
    });

    // Rueda del mouse con Ctrl: zoom
    escena.addEventListener('wheel', e => {
        if (!e.ctrlKey) return;
        e.preventDefault();
        setZoom(zoom + (e.deltaY < 0 ? 0.5 : -0.5));
    }, { passive: false });

    // Celular: pellizcar para hacer zoom y deslizar para cambiar de foto
    let distInicial = null;
    let zoomInicial = 1;
    let xInicial = null;

    function distancia(t) {
        return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    }

    escena.addEventListener('touchstart', e => {
        if (e.touches.length === 2) {
            distInicial = distancia(e.touches);
            zoomInicial = zoom;
            xInicial = null;
        } else if (e.touches.length === 1) {
            xInicial = e.touches[0].clientX;
        }
    }, { passive: true });

    escena.addEventListener('touchmove', e => {
        if (e.touches.length === 2 && distInicial) {
            e.preventDefault();
            setZoom(zoomInicial * distancia(e.touches) / distInicial);
        }
    }, { passive: false });

    escena.addEventListener('touchend', e => {
        if (e.touches.length < 2) distInicial = null;
        if (xInicial !== null && zoom === 1 && e.changedTouches.length === 1) {
            const dx = e.changedTouches[0].clientX - xInicial;
            if (Math.abs(dx) > 60) mostrar(dx < 0 ? actual + 1 : actual - 1);
        }
        xInicial = null;
    });

    window.addEventListener('resize', () => {
        if (!visor.hidden && zoom === 1) ajustar();
    });
})();
