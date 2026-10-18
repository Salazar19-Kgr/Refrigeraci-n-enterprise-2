import { useEffect, useState } from "react";
import { supabase } from "./supabase";

const CATS = ["Aires split","Aires de ventana","Neveras","Lavadoras","Secadoras","Otros"];
const fila = "glass p-4 flex justify-between items-center gap-3 flex-wrap";
const mini = "px-3 py-1 rounded-full border border-cian/40 text-sm text-cian";
const num = v => v === "" ? null : Number(v);

function Productos() {
  const vacio = {nombre:"",categoria:CATS[0],descripcion:"",precio:""};
  const [lista,setLista] = useState([]); const [f,setF] = useState(vacio); const [img,setImg] = useState(null);
  const cargar = () => supabase.from("productos").select("*").order("created_at",{ascending:false}).then(({data})=>setLista(data||[]));
  useEffect(()=>{cargar();},[]);
  async function agregar(e) {
    e.preventDefault(); let imagen_url = null;
    if (img) {
      const ruta = Date.now()+"-"+img.name.replace(/\s/g,"_");
      const {error} = await supabase.storage.from("productos").upload(ruta,img);
      if (!error) imagen_url = supabase.storage.from("productos").getPublicUrl(ruta).data.publicUrl;
    }
    await supabase.from("productos").insert({...f,precio:num(f.precio),imagen_url});
    setF(vacio); setImg(null); e.target.reset(); cargar();
  }
  async function precio(p) {
    const v = prompt("Nuevo precio para "+p.nombre, p.precio ?? ""); if (v===null) return;
    await supabase.from("productos").update({precio:num(v)}).eq("id",p.id); cargar();
  }
  async function borrar(p) {
    if (confirm("¿Eliminar "+p.nombre+"?")) { await supabase.from("productos").delete().eq("id",p.id); cargar(); }
  }
  return (<div className="space-y-3">
    <form onSubmit={agregar} className="glass p-4 space-y-3">
      <b>Agregar producto</b>
      <input required placeholder="Nombre" value={f.nombre} onChange={e=>setF({...f,nombre:e.target.value})}/>
      <select value={f.categoria} onChange={e=>setF({...f,categoria:e.target.value})}>{CATS.map(c=><option key={c}>{c}</option>)}</select>
      <input placeholder="Descripción" value={f.descripcion} onChange={e=>setF({...f,descripcion:e.target.value})}/>
      <input type="number" step="0.01" placeholder="Precio" value={f.precio} onChange={e=>setF({...f,precio:e.target.value})}/>
      <input type="file" accept="image/*" onChange={e=>setImg(e.target.files[0])}/>
      <button className="px-6 py-2.5 rounded-xl bg-cian text-black font-semibold">Guardar</button>
    </form>
    {lista.map(p=>(<div key={p.id} className={fila}>
      <div><b>{p.nombre}</b><div className="text-xs text-slate-400">{p.categoria} · {p.precio!=null?"$"+p.precio:"Sin precio"}</div></div>
      <div className="flex gap-2"><button className={mini} onClick={()=>precio(p)}>Precio</button><button className={mini} onClick={()=>borrar(p)}>Eliminar</button></div>
    </div>))}
  </div>);
}

function Solicitudes() {
  const [l,setL] = useState([]);
  const cargar = () => supabase.from("solicitudes").select("*").order("created_at",{ascending:false}).then(({data})=>setL(data||[]));
  useEffect(()=>{cargar();},[]);
  async function atender(s) {
    const costo = prompt("Costo del trabajo (opcional)",""); if (costo===null) return;
    const {data:c} = await supabase.from("clientes").upsert({nombre:s.nombre,telefono:s.telefono},{onConflict:"telefono"}).select().single();
    await supabase.from("trabajos").insert({cliente_id:c.id,equipo:s.tipo_equipo,descripcion:s.descripcion,costo:num(costo)});
    await supabase.from("solicitudes").update({estado:"atendida"}).eq("id",s.id); cargar();
  }
  return (<div className="space-y-3">
    {l.map(s=>(<div key={s.id} className={fila}>
      <div><b>{s.nombre}</b> · {s.telefono}<div className="text-sm text-slate-300">{s.tipo_equipo}: {s.descripcion}</div><div className="text-xs text-slate-500">{new Date(s.created_at).toLocaleString()} · {s.estado}</div></div>
      {s.estado!=="atendida" && <button className={mini} onClick={()=>atender(s)}>Registrar trabajo</button>}
    </div>))}
    {!l.length && <p className="text-slate-400">Sin solicitudes.</p>}
  </div>);
}

function Trabajos() {
  const [l,setL] = useState([]);
  const cargar = () => supabase.from("trabajos").select("*, clientes(nombre,telefono)").order("fecha",{ascending:false}).then(({data})=>setL(data||[]));
  useEffect(()=>{cargar();},[]);
  async function cambiar(t) {
    await supabase.from("trabajos").update({estado:t.estado==="pendiente"?"terminado":"pendiente"}).eq("id",t.id); cargar();
  }
  return (<div className="space-y-3">
    {l.map(t=>(<div key={t.id} className={fila}>
      <div><b>{t.clientes?.nombre}</b> · {t.clientes?.telefono}<div className="text-sm text-slate-300">{t.equipo}: {t.descripcion}</div><div className="text-xs text-slate-500">{t.fecha} · {t.costo!=null?"$"+t.costo:"Sin costo"}</div></div>
      <button className={mini} onClick={()=>cambiar(t)}>{t.estado}</button>
    </div>))}
    {!l.length && <p className="text-slate-400">Sin trabajos registrados.</p>}
  </div>);
}

function ResenasAdmin() {
  const [l,setL] = useState([]);
  const cargar = () => supabase.from("resenas").select("*").order("created_at",{ascending:false}).then(({data})=>setL(data||[]));
  useEffect(()=>{cargar();},[]);
  async function aprobar(r) { await supabase.from("resenas").update({aprobada:!r.aprobada}).eq("id",r.id); cargar(); }
  async function borrar(r) { if (confirm("¿Eliminar reseña?")) { await supabase.from("resenas").delete().eq("id",r.id); cargar(); } }
  return (<div className="space-y-3">
    {l.map(r=>(<div key={r.id} className={fila}>
      <div><b>{r.nombre}</b> <span className="text-yellow-300">{"★".repeat(r.calificacion)}</span><div className="text-sm text-slate-300">{r.comentario}</div></div>
      <div className="flex gap-2"><button className={mini} onClick={()=>aprobar(r)}>{r.aprobada?"Ocultar":"Aprobar"}</button><button className={mini} onClick={()=>borrar(r)}>Eliminar</button></div>
    </div>))}
    {!l.length && <p className="text-slate-400">Sin reseñas.</p>}
  </div>);
}

export default function Admin({salir}) {
  const [tab,setTab] = useState("Productos");
  const V = {Productos:<Productos/>,Solicitudes:<Solicitudes/>,Trabajos:<Trabajos/>,Reseñas:<ResenasAdmin/>};
  return (<div className="p-5 max-w-4xl mx-auto">
    <div className="flex justify-between items-center"><h1 className="text-2xl font-bold text-cian">Administración</h1><button onClick={salir} className={mini}>Salir</button></div>
    <div className="flex gap-2 mt-5 flex-wrap">{Object.keys(V).map(t=><button key={t} onClick={()=>setTab(t)} className={"px-4 py-1.5 rounded-full border text-sm "+(tab===t?"bg-cian text-black border-cian":"border-cian/30")}>{t}</button>)}</div>
    <div className="mt-6">{V[tab]}</div>
  </div>);
}
