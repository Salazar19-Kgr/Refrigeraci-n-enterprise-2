import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "./supabase";

const WA = "584245095002";
const EQUIPOS = ["Aire acondicionado split","Aire de ventana","Aire central","Nevera / Refrigerador","Lavadora","Secadora","Congelador","Otro"];
const fade = { initial:{opacity:0,y:40}, whileInView:{opacity:1,y:0}, viewport:{once:true}, transition:{duration:.7} };

export function preguntar(p) {
  window.dispatchEvent(new CustomEvent("interes", { detail: p }));
  document.getElementById("solicitud")?.scrollIntoView({ behavior: "smooth" });
}

export default function SolicitudNueva() {
  const vacio = {nombre:"",telefono:"",tipo_equipo:EQUIPOS[0],descripcion:""};
  const [f,setF] = useState(vacio);
  const [estado,setEstado] = useState("");
  useEffect(()=>{
    const h = e => setF(x=>({...x, descripcion:"Me interesa: "+e.detail.nombre+" ("+e.detail.categoria+")"}));
    window.addEventListener("interes",h);
    return ()=>window.removeEventListener("interes",h);
  },[]);
  const set = k => e => setF({...f,[k]:e.target.value});
  async function enviar(e) {
    e.preventDefault(); setEstado("enviando");
    const {error} = await supabase.from("solicitudes").insert(f);
    if (error) console.error(error);
    const msg = "Hola, soy "+f.nombre+".\nTeléfono: "+f.telefono+"\nEquipo: "+f.tipo_equipo+"\nDescripción: "+f.descripcion;
    setF(vacio); setEstado(error?"error":"ok");
    setTimeout(()=>{ window.location.href = "https://wa.me/"+WA+"?text="+encodeURIComponent(msg); }, error?1800:400);
  }
  return (
    <section id="solicitud" className="px-6 py-20">
      <motion.form {...fade} onSubmit={enviar} className="glass max-w-xl mx-auto p-6 space-y-3">
        <h2 className="text-2xl font-bold">¿Necesitas un <span className="text-cian">servicio</span>?</h2>
        <input required placeholder="Nombre completo" value={f.nombre} onChange={set("nombre")}/>
        <input required type="tel" placeholder="Teléfono / WhatsApp" value={f.telefono} onChange={set("telefono")}/>
        <select value={f.tipo_equipo} onChange={set("tipo_equipo")}>{EQUIPOS.map(x=><option key={x}>{x}</option>)}</select>
        <textarea required rows={4} placeholder="Describe tu equipo y el problema" value={f.descripcion} onChange={set("descripcion")}/>
        <button disabled={estado==="enviando"} className="w-full py-3 rounded-xl bg-cian text-black font-semibold glow">{estado==="enviando"?"Enviando...":"Enviar solicitud"}</button>
        {estado==="ok" && <p className="text-cian text-sm">✓ Solicitud registrada. Abriendo WhatsApp...</p>}
        {estado==="error" && <p className="text-red-400 text-sm">No se pudo guardar el registro, pero te llevamos a WhatsApp igual.</p>}
      </motion.form>
    </section>
  );
}
