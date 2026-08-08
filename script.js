
const EMAILJS_PUBLIC_KEY  = "l_osZXrcc4lbHocZC";
const EMAILJS_SERVICE_ID  = "service_5srkeuq";
const EMAILJS_TEMPLATE_ID = "template_3k3ekak";


const CORREOS_DESTINO = "jibanez@upana.edu.gt, mperdomo@upana.edu.gt";

document.addEventListener('DOMContentLoaded', () => {
  if(window.emailjs && EMAILJS_PUBLIC_KEY && !EMAILJS_PUBLIC_KEY.startsWith('TU_')){
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  document.getElementById('anioActual').textContent = new Date().getFullYear();

  poblarDepartamentos();
  initDropzone();
  initStepper();
  initFormValidationUX();
  initSubmit();
  initModales();
});

/* ==================================================================
   DEPARTAMENTOS DE GUATEMALA
   ================================================================== */
function poblarDepartamentos(){
  const departamentos = [
    "Alta Verapaz","Baja Verapaz","Chimaltenango","Chiquimula","El Progreso",
    "Escuintla","Guatemala","Huehuetenango","Izabal","Jalapa","Jutiapa",
    "Petén","Quetzaltenango","Quiché","Retalhuleu","Sacatepéquez",
    "San Marcos","Santa Rosa","Sololá","Suchitepéquez","Totonicapán","Zacapa"
  ];
  const select = document.getElementById('departamento');
  departamentos.forEach(dep => {
    const opt = document.createElement('option');
    opt.value = dep;
    opt.textContent = dep;
    select.appendChild(opt);
  });
}

/* ==================================================================
   DROPZONE (arrastrar y soltar / botón de archivo)
   ================================================================== */
function initDropzone(){
  const dropzone   = document.getElementById('dropzone');
  const input      = document.getElementById('archivoDocumento');
  const preview    = document.getElementById('filePreview');
  const previewName= document.getElementById('filePreviewName');
  const previewSize= document.getElementById('filePreviewSize');
  const previewIcon= document.getElementById('filePreviewIcon');
  const removeBtn  = document.getElementById('filePreviewRemove');
  const title      = document.getElementById('dropzoneTitle');
  const MAX_BYTES  = 5 * 1024 * 1024;

  const abrirSelector = () => input.click();
  dropzone.addEventListener('click', abrirSelector);
  dropzone.addEventListener('keydown', e => {
    if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); abrirSelector(); }
  });

  ['dragenter','dragover'].forEach(evt => {
    dropzone.addEventListener(evt, e => {
      e.preventDefault(); e.stopPropagation();
      dropzone.classList.add('dragover');
    });
  });
  ['dragleave','drop'].forEach(evt => {
    dropzone.addEventListener(evt, e => {
      e.preventDefault(); e.stopPropagation();
      dropzone.classList.remove('dragover');
    });
  });
  dropzone.addEventListener('drop', e => {
    const file = e.dataTransfer.files[0];
    if(file){ input.files = e.dataTransfer.files; manejarArchivo(file); }
  });

  input.addEventListener('change', () => {
    if(input.files[0]) manejarArchivo(input.files[0]);
  });

  function manejarArchivo(file){
    if(file.size > MAX_BYTES){
      alert('El archivo supera el límite de 5 MB. Por favor selecciona uno más liviano.');
      input.value = '';
      return;
    }
    previewName.textContent = file.name;
    previewSize.textContent = formatearBytes(file.size);

    if(file.type.startsWith('image/')){
      const reader = new FileReader();
      reader.onload = e => {
        previewIcon.style.backgroundImage = `url(${e.target.result})`;
        previewIcon.textContent = '';
      };
      reader.readAsDataURL(file);
    } else {
      previewIcon.style.backgroundImage = 'none';
      previewIcon.textContent = 'PDF';
    }

    preview.classList.remove('hidden');
    title.innerHTML = 'Archivo listo — <span>elegir otro archivo</span>';
  }

  removeBtn.addEventListener('click', e => {
    e.stopPropagation();
    input.value = '';
    preview.classList.add('hidden');
    title.innerHTML = 'Arrastra tu archivo aquí o <span>elige un archivo</span>';
  });
}

function formatearBytes(bytes){
  if(bytes < 1024) return bytes + ' B';
  if(bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
  return (bytes/(1024*1024)).toFixed(1) + ' MB';
}

/* ==================================================================
   STEPPER — vástago de crecimiento (scroll-spy) + navegación móvil
   ================================================================== */
function initStepper(){
  const secciones = ['sec-personales','sec-documento','sec-academico','sec-carrera']
    .map(id => document.getElementById(id));
  const nodosDesktop = Array.from(document.querySelectorAll('.stem-node'));
  const dotsMovil    = Array.from(document.querySelectorAll('.stem-mobile-dots .dot'));
  const stemFill      = document.getElementById('stemFill');
  const stemFillMobile= document.getElementById('stemFillMobile');

  function irA(id){
    const el = document.getElementById(id);
    if(el) el.scrollIntoView({ behavior:'smooth', block:'start' });
  }
  nodosDesktop.forEach(btn => btn.addEventListener('click', () => irA(btn.dataset.target)));
  dotsMovil.forEach(dot => dot.addEventListener('click', () => irA(dot.dataset.target)));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const idx = secciones.findIndex(s => s.id === entry.target.id);
        actualizarActivo(idx);
      }
    });
  }, { rootMargin: '-15% 0px -55% 0px', threshold: 0 });

  secciones.forEach(s => s && observer.observe(s));

  function actualizarActivo(idx){
    nodosDesktop.forEach((n,i) => {
      n.classList.toggle('active', i === idx);
      n.classList.toggle('done', i < idx);
    });
    dotsMovil.forEach((d,i) => d.classList.toggle('active', i === idx));
    const pct = secciones.length > 1 ? (idx / (secciones.length - 1)) * 100 : 0;
    stemFill.style.height = pct + '%';
    stemFillMobile.style.width = pct + '%';
  }
  actualizarActivo(0);
}

/* ==================================================================
   VALIDACIÓN — feedback visual por campo
   ================================================================== */
function initFormValidationUX(){
  const form = document.getElementById('formInscripcion');
  form.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('blur', () => validarCampo(el));
    el.addEventListener('input', () => {
      if(el.closest('.field').classList.contains('has-error')) validarCampo(el);
    });
  });
}
function validarCampo(el){
  const field = el.closest('.field');
  if(!field) return true;
  let msg = field.querySelector('.field-error');
  const valido = el.checkValidity();
  if(!valido){
    field.classList.add('has-error');
    if(!msg){
      msg = document.createElement('span');
      msg.className = 'field-error';
      field.appendChild(msg);
    }
    msg.textContent = mensajeDeError(el);
  } else {
    field.classList.remove('has-error');
    if(msg) msg.remove();
  }
  return valido;
}
function mensajeDeError(el){
  if(el.validity.valueMissing) return 'Este campo es obligatorio.';
  if(el.validity.typeMismatch && el.type === 'email') return 'Ingresa un correo electrónico válido.';
  if(el.validity.patternMismatch) return 'Verifica el formato de este campo.';
  if(el.validity.rangeOverflow || el.validity.rangeUnderflow) return 'El valor está fuera del rango permitido.';
  return 'Revisa este campo.';
}

/* ==================================================================
   ENVÍO DEL FORMULARIO (EmailJS)
   ================================================================== */
function initSubmit(){
  const form = document.getElementById('formInscripcion');
  const btn  = document.getElementById('btnSubmit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Valida todos los campos requeridos y salta al primero con error
    const campos = Array.from(form.querySelectorAll('input, select'));
    let primerInvalido = null;
    campos.forEach(el => {
      const ok = validarCampo(el);
      if(!ok && !primerInvalido) primerInvalido = el;
    });
    if(primerInvalido){
      primerInvalido.closest('section').scrollIntoView({ behavior:'smooth', block:'center' });
      primerInvalido.focus({ preventScroll:true });
      return;
    }

    if(!window.emailjs || EMAILJS_PUBLIC_KEY.startsWith('TU_')){
      mostrarError('El envío por correo aún no está configurado. Añade tus credenciales de EmailJS en script.js (EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID y EMAILJS_TEMPLATE_ID) para activar el envío real.');
      return;
    }

    ponerCargando(true);
    try{
      const params = construirParametrosCorreo(form);
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
      abrirModal('successOverlay');
      form.reset();
      document.getElementById('filePreview').classList.add('hidden');
      document.getElementById('dropzoneTitle').innerHTML = 'Arrastra tu archivo aquí o <span>elige un archivo</span>';
      form.querySelectorAll('.has-error').forEach(f => f.classList.remove('has-error'));
    }catch(err){
      console.error('Error al enviar con EmailJS:', err);
      mostrarError('Ocurrió un problema al enviar tu inscripción. Verifica tu conexión e intenta nuevamente.');
    }finally{
      ponerCargando(false);
    }
  });

  function ponerCargando(activo){
    btn.disabled = activo;
    btn.classList.toggle('loading', activo);
    btn.querySelector('.btn-submit-text').textContent = activo ? 'Enviando…' : 'Enviar inscripción';
  }
}

/* Arma el desglose completo de campos para el cuerpo del correo */
function construirParametrosCorreo(form){
  const data = new FormData(form);
  const etiquetas = {
    nombre_completo: 'Nombre completo',
    telefono: 'Teléfono',
    direccion: 'Dirección de residencia',
    departamento: 'Departamento de residencia',
    fecha_nacimiento: 'Fecha de nacimiento',
    nacionalidad: 'Nacionalidad',
    estado_civil: 'Estado civil',
    correo_electronico: 'Correo electrónico',
    tipo_documento: 'Tipo de documento',
    numero_documento: 'Número de documento',
    institucion_procedencia: 'Institución de procedencia',
    promedio_academico: 'Promedio académico',
    lugar_trabajo: 'Lugar de trabajo',
    carrera_interes: 'Carrera de interés'
  };

  let desglose = '';
  Object.entries(etiquetas).forEach(([name, etiqueta]) => {
    const valor = (data.get(name) || '').toString().trim();
    desglose += `${etiqueta}: ${valor || '—'}\n`;
  });

  const archivo = document.getElementById('archivoDocumento').files[0];
  desglose += `Archivo adjunto: ${archivo ? archivo.name : 'No se adjuntó archivo'}\n`;

  return {
    asunto: 'Tienes un nuevo proceso de inscripción',
    to_email: CORREOS_DESTINO,
    mensaje: `Tienes un nuevo proceso de inscripción\n\n${desglose}`,
    ...Object.fromEntries(data.entries())
  };
}

/* ==================================================================
   MODALES
   ================================================================== */
function initModales(){
  document.getElementById('btnCloseModal').addEventListener('click', () => cerrarModal('successOverlay'));
  document.getElementById('btnCloseErrorModal').addEventListener('click', () => cerrarModal('errorOverlay'));
  [document.getElementById('successOverlay'), document.getElementById('errorOverlay')].forEach(overlay => {
    overlay.addEventListener('click', e => { if(e.target === overlay) cerrarModal(overlay.id); });
  });
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape'){ cerrarModal('successOverlay'); cerrarModal('errorOverlay'); }
  });
}
function abrirModal(id){ document.getElementById(id).classList.add('open'); }
function cerrarModal(id){ document.getElementById(id).classList.remove('open'); }
function mostrarError(mensaje){
  document.getElementById('errorMessage').textContent = mensaje;
  abrirModal('errorOverlay');
}
