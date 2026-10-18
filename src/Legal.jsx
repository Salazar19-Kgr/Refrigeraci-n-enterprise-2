import { useState } from "react";
import { Snowflake, Lock } from "lucide-react";
import { supabase } from "./supabase";

const WA = "584245095002";
const TEL = "+58 424 5095002";

const TERMINOS = [
  ["1. Servicios","Este sitio muestra un catálogo de equipos y permite solicitar servicios técnicos de instalación, mantenimiento y reparación de equipos de refrigeración y climatización."],
  ["2. Precios","Los precios del catálogo son referenciales y pueden variar según modelo, disponibilidad, instalación y condiciones del servicio. El precio final se confirma con el técnico antes de realizar el trabajo."],
  ["3. Solicitudes","Enviar el formulario no garantiza una cita. El servicio queda confirmado cuando el técnico se comunica contigo. Debes indicar datos de contacto reales y correctos."],
  ["4. Garantía","Las condiciones de garantía se acuerdan e informan al contratar cada servicio o comprar un equipo."],
  ["5. Reseñas","Las reseñas se publican después de ser revisadas. Podemos no publicar o retirar contenido ofensivo, falso o que no se relacione con el servicio."],
  ["6. Responsabilidad","No respondemos por daños causados por información incorrecta del cliente, ni por fallas de servicios de terceros como internet o WhatsApp."],
  ["7. Cambios","Podemos actualizar estos términos en cualquier momento. La versión vigente es la publicada en este sitio."],
  ["8. Contacto","Escríbenos por WhatsApp al "+TEL+"."],
];

const PRIVACIDAD = [
  ["1. Datos que recopilamos","Formulario de servicio: nombre, teléfono, tipo de equipo y descripción. Reseñas: nombre, calificación y comentario. Reportes de errores: tu mensaje y, si quieres, tu nombre."],
  ["2. Para qué los usamos","Para contactarte, gestionar y registrar el servicio, dar seguimiento y garantía, publicar reseñas aprobadas y corregir fallas del sitio."],
  ["3. Dónde se guardan","Los datos se almacenan en Supabase, con acceso restringido al administrador. El sitio está alojado en Cloudflare."],
  ["4. Con quién los compartimos","No vendemos ni cedemos tus datos. Al enviar el formulario se abre WhatsApp con tu mensaje, y ese servicio se rige por sus propias políticas."],
  ["5. Cookies","No usamos cookies de publicidad ni de rastreo. Solo se guarda una sesión técnica en el navegador del administrador."],
  ["6. Tus derechos","Puedes pedir ver, corregir o eliminar tus datos escribiéndonos por WhatsApp al "+TEL+"."],
  ["7. Conservación","Guardamos tus datos mientras sean necesarios para el servicio o hasta que pidas eliminarlos."],
  ["8. Cambios","Podemos actualizar esta política. La versión vigente es la publicada en este sitio."],
];

function Modal({ titulo, cerrar, children }) {
  return (
    <div className="fixed inset-0 bg-black/70 grid place-items-center p-4 z-50" onClick={cerrar}>
      <div onClick={e=>e.stopPropagation()} className="glass p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{titulo}</h3>
          <button onClick={cerrar} className="text-cian text-xl">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Texto({ lista }) {
  return (<div className="space-y-4">
    <p className="text-xs text-slate-500">Última actualización: octubre de 2026</p>
    {lista.map(([t,p])=>(<div key={t}><h4 className="font-semibold text-cian">{t}</h4><p className="text-sm text-slate-300 mt-1">{p}</p></div>))}
  </div>);
}

function Reportar({ cerrar }) {
  const [f,setF] = useState({nombre:"",mensaje:""});
  const [est,setEst] = useState("");
  async function enviar(e) {
    e.preventDefault(); setEst("enviando");
    const {error} = await supabase.from("reportes").insert({nombre:f.nombre.trim()||null,mensaje:f.mensaje,pagina:window.location.href});
    setEst(error?"error":"ok");
  }
  return (
    <Modal titulo="Reportar un error" cerrar={cerrar}>
      {est==="ok" ? <p className="text-cian">¡Gracias! Recibimos tu reporte y lo revisaremos.</p> : (
        <form onSubmit={enviar} className="space-y-3">
          <p className="text-sm text-slate-300">¿Algo no funciona bien? Cuéntanos qué pasó y en qué parte de la página.</p>
          <input placeholder="Tu nombre (opcional)" value={f.nombre} onChange={e=>setF({...f,nombre:e.target.value})}/>
          <textarea required rows={4} placeholder="Describe el error" value={f.mensaje} onChange={e=>setF({...f,mensaje:e.target.value})}/>
          {est==="error" && <p className="text-red-400 text-sm">No se pudo enviar. Inténtalo de nuevo.</p>}
          <button disabled={est==="enviando"} className="w-full py-3 rounded-xl bg-cian text-black font-semibold">{est==="enviando"?"Enviando...":"Enviar reporte"}</button>
        </form>
      )}
    </Modal>
  );
}

export default function Footer({ abrirAdmin }) {
  const [m,setM] = useState("");
  const enlace = "text-slate-400 hover:text-cian text-left";
  return (<>
    <footer className="border-t border-cian/20 mt-10 px-6 pt-12 pb-8">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 text-cian font-bold"><Snowflake/> Refrigeración Enterprise</div>
          <p className="text-sm text-slate-400 mt-3">Soluciones en frío, siempre contigo.</p>
        </div>
        <div className="text-sm">
          <b className="block mb-3">Contacto</b>
          <a href={"https://wa.me/"+WA} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-cian">WhatsApp {TEL}</a>
        </div>
        <div className="text-sm flex flex-col gap-2">
          <b className="mb-1">Información</b>
          <button className={enlace} onClick={()=>setM("t")}>Términos y condiciones</button>
          <button className={enlace} onClick={()=>setM("p")}>Política de privacidad</button>
          <button className={enlace} onClick={()=>setM("r")}>Reportar un error</button>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-white/10 flex justify-between items-center flex-wrap gap-3 text-xs text-slate-500">
        <span>© {new Date().getFullYear()} Refrigeración Enterprise. Todos los derechos reservados.</span>
        <button onClick={abrirAdmin} className="inline-flex items-center gap-1 text-cian"><Lock size={14}/> Administración</button>
      </div>
    </footer>
    {m==="t" && <Modal titulo="Términos y condiciones" cerrar={()=>setM("")}><Texto lista={TERMINOS}/></Modal>}
    {m==="p" && <Modal titulo="Política de privacidad" cerrar={()=>setM("")}><Texto lista={PRIVACIDAD}/></Modal>}
    {m==="r" && <Reportar cerrar={()=>setM("")}/>}
  </>);
}
