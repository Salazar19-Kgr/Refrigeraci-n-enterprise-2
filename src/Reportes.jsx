import { useEffect, useState } from "react";
import { supabase } from "./supabase";

const mini = "px-3 py-1 rounded-full border border-cian/40 text-sm text-cian";

export default function Reportes() {
  const [l,setL] = useState([]);
  const cargar = () => supabase.from("reportes").select("*").order("created_at",{ascending:false}).then(({data})=>setL(data||[]));
  useEffect(()=>{cargar();},[]);
  async function cambiar(r) {
    await supabase.from("reportes").update({estado:r.estado==="nuevo"?"resuelto":"nuevo"}).eq("id",r.id); cargar();
  }
  async function borrar(r) {
    if (confirm("¿Eliminar este reporte?")) { await supabase.from("reportes").delete().eq("id",r.id); cargar(); }
  }
  return (<div className="space-y-3">
    {l.map(r=>(<div key={r.id} className="glass p-4 flex justify-between items-center gap-3 flex-wrap">
      <div><b>{r.nombre||"Anónimo"}</b><div className="text-sm text-slate-300">{r.mensaje}</div><div className="text-xs text-slate-500">{new Date(r.created_at).toLocaleString()}</div></div>
      <div className="flex gap-2"><button className={mini} onClick={()=>cambiar(r)}>{r.estado}</button><button className={mini} onClick={()=>borrar(r)}>Eliminar</button></div>
    </div>))}
    {!l.length && <p className="text-slate-400">Sin reportes.</p>}
  </div>);
}
