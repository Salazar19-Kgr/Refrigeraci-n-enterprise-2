import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Snowflake, Lock } from "lucide-react";
import { supabase } from "./supabase";
import Admin from "./Admin";

const WA = "584245095002";
const EQUIPOS = ["Aire acondicionado split","Aire de ventana","Aire central","Nevera / Refrigerador","Lavadora","Secadora","Congelador","Otro"];
const fade = { initial:{opacity:0,y:40}, whileInView:{opacity:1,y:0}, viewport:{once:true}, transition:{duration:.7} };

function Fondo() {
  const copos = useMemo(() => Array.from({length:18}, () => ({
    left: Math.random()*100, size: 10+Math.random()*16, dur: 8+Math.random()*10, delay: -Math.random()*12 })), []);
  return (<>
    <div className="grid-bg"/>
    <div className="orb" style={{width:420,height:420,background:"#22e6d6",top:-120,left:-100}}/>
    <div className="orb" style={{width:380,height:380,background:"#2563eb",bottom:-100,right:-80,animationDelay:"-6s"}}/>
    {copos.map((c,i)=><span key={i} className="copo" style={{left:c.left+"%",fontSize:c.size,animationDuration:c.dur+"s",animationDelay:c.delay+"s"}}>❄</span>)}
  </>);
}

function Hero() {
  return (
    <section className="min-h-[90vh] flex items-center px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div {...fade} className="flex items-center gap-2 text-cian mb-8"><Snowflake/> <b>Refrigeración Enterprise</b></motion.div>
        <motion.p {...fade} className="tracking-[.3em] text-xs text-cian">ESPECIALISTAS EN</motion.p>
        <motion.h1 {...fade} className="text-5xl md:text-7xl font-bold mt-3">Refrigeración<br/>y <span className="text-cian">Climatización</span></motion.h1>
        <motion.p {...fade} className="mt-5 text-slate-300 max-w-xl">Equipos de alta eficiencia, mantenimiento profesional y soluciones confiables para tu hogar, negocio o industria.</motion.p>
        <motion.div {...fade} className="mt-8 flex gap-3 flex-wrap">
          <a href="#solicitud" className="px-7 py-3 rounded-full bg-cian text-black font-semibold glow">Solicitar servicio</a>
          <a href="#catalogo" className="px-7 py-3 rounded-full border border-cian/50">Ver catálogo</a>
        </motion.div>
      </div>
    </section>
  );
}

function Catalogo() {
  const [items,setItems] = useState([]);
  const [cat,setCat] = useState("Todos");
  useEffect(()=>{ supabase.from("productos").select("*").order("created_at",{ascending:false}).then(({data})=>setItems(data||[])); },[]);
  const cats = ["Todos",...new Set(items.map(p=>p.categoria))];
  const lista = items.filter(p=>cat==="Todos"||p.categoria===cat);
  return (
    <section id="catalogo" className="px-6 py-20 max-w-6xl mx-auto">
      <motion.h2 {...fade} className="text-3xl md:text-4xl font-bold">Equipos de las <span className="text-cian">mejores marcas</span></motion.h2>
      <div className="flex gap-2 flex-wrap mt-6">
        {cats.map(c=><button key={c} onClick={()=>setCat(c)} className={"px-4 py-1.5 rounded-full border text-sm "+(cat===c?"bg-cian text-black border-cian":"border-cian/30")}>{c}</button>)}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {lista.map((p,i)=>(
          <motion.div key={p.id} initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.08}} whileHover={{y:-8}} className="glass glow overflow-hidden">
            {p.imagen_url && <img src={p.imagen_url} alt={p.nombre} className="h-48 w-full object-cover"/>}
            <div className="p-5">
              <span className="text-xs text-cian">{p.categoria}</span>
              <h3 className="text-lg font-semibold">{p.nombre}</h3>
              <p className="text-sm text-slate-400 mt-1">{p.descripcion}</p>
              <div className="flex justify-between items-center mt-4">
                <b className="text-xl">{p.precio!=null?"$"+p.precio:"Consultar"}</b>
                <a href={`https://wa.me/${WA}?text=${encodeURIComponent("Hola, me interesa: "+p.nombre)}`} target="_blank" rel="noreferrer" className="text-cian text-sm">Preguntar →</a>
              </div>
            </div>
          </motion.div>
        ))}
        {!lista.length && <p className="text-slate-400">Pronto agregaremos productos.</p>}
      </div>
    </section>
  );
}

function Solicitud() {
  const [f,setF] = useState({nombre:"",telefono:"",tipo_equipo:EQUIPOS[0],descripcion:""});
  const [cargando,setCargando] = useState(false);
  const set = k => e => setF({...f,[k]:e.target.value});
  async function enviar(e) {
    e.preventDefault(); setCargando(true);
    await supabase.from("solicitudes").insert(f);
    const msg = `Hola, soy ${f.nombre}.\nTeléfono: ${f.telefono}\nEquipo: ${f.tipo_equipo}\nDescripción: ${f.descripcion}`;
    window.location.href = `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
  }
  return (
    <section id="solicitud" className="px-6 py-20">
      <motion.form {...fade} onSubmit={enviar} className="glass max-w-xl mx-auto p-6 space-y-3">
        <h2 className="text-2xl font-bold">¿Necesitas un <span className="text-cian">servicio</span>?</h2>
        <input required placeholder="Nombre completo" value={f.nombre} onChange={set("nombre")}/>
        <input required type="tel" placeholder="Teléfono / WhatsApp" value={f.telefono} onChange={set("telefono")}/>
        <select value={f.tipo_equipo} onChange={set("tipo_equipo")}>{EQUIPOS.map(x=><option key={x}>{x}</option>)}</select>
        <textarea required rows={4} placeholder="Describe tu equipo y el problema" value={f.descripcion} onChange={set("descripcion")}/>
        <button disabled={cargando} className="w-full py-3 rounded-xl bg-cian text-black font-semibold glow">{cargando?"Enviando...":"Enviar solicitud"}</button>
      </motion.form>
    </section>
  );
}

function Resenas() {
  const [lista,setLista] = useState([]);
  const [f,setF] = useState({nombre:"",calificacion:5,comentario:""});
  const [ok,setOk] = useState(false);
  useEffect(()=>{ supabase.from("resenas").select("*").order("created_at",{ascending:false}).limit(6).then(({data})=>setLista(data||[])); },[]);
  async function enviar(e) {
    e.preventDefault();
    await supabase.from("resenas").insert({...f,calificacion:Number(f.calificacion)});
    setOk(true);
  }
  return (
    <section className="px-6 py-20 max-w-6xl mx-auto">
      <motion.h2 {...fade} className="text-3xl font-bold">Lo que dicen <span className="text-cian">nuestros clientes</span></motion.h2>
      <div className="grid md:grid-cols-3 gap-5 mt-8">
        {lista.map(r=>(
          <motion.div key={r.id} {...fade} className="glass p-5">
            <div className="text-yellow-300">{"★".repeat(r.calificacion)}</div>
            <p className="text-sm mt-2 text-slate-300">{r.comentario}</p>
            <b className="block mt-3 text-cian text-sm">{r.nombre}</b>
          </motion.div>
        ))}
      </div>
      {ok ? <p className="mt-8 text-cian">¡Gracias! Tu reseña se publicará al ser aprobada.</p> : (
        <form onSubmit={enviar} className="glass p-5 mt-8 max-w-xl space-y-3">
          <b>Deja tu reseña</b>
          <input required placeholder="Tu nombre" value={f.nombre} onChange={e=>setF({...f,nombre:e.target.value})}/>
          <select value={f.calificacion} onChange={e=>setF({...f,calificacion:e.target.value})}>{[5,4,3,2,1].map(n=><option key={n} value={n}>{"★".repeat(n)}</option>)}</select>
          <textarea required rows={3} placeholder="Cuéntanos tu experiencia" value={f.comentario} onChange={e=>setF({...f,comentario:e.target.value})}/>
          <button className="px-6 py-2.5 rounded-xl bg-cian text-black font-semibold">Publicar reseña</button>
        </form>
      )}
    </section>
  );
}

function Login({cerrar,entrar}) {
  const [id,setId] = useState(""); const [pw,setPw] = useState(""); const [err,setErr] = useState("");
  async function ir(e) {
    e.preventDefault();
    const {error} = await supabase.auth.signInWithPassword({email:`${id.trim()}@refrigeracion.app`,password:pw});
    error ? setErr("ID o contraseña incorrectos") : entrar();
  }
  return (
    <div className="fixed inset-0 bg-black/70 grid place-items-center p-6 z-50" onClick={cerrar}>
      <form onClick={e=>e.stopPropagation()} onSubmit={ir} className="glass p-6 w-full max-w-sm space-y-3">
        <h3 className="text-xl font-bold">Administración</h3>
        <input required placeholder="ID" value={id} onChange={e=>setId(e.target.value)}/>
        <input required type="password" placeholder="Contraseña" value={pw} onChange={e=>setPw(e.target.value)}/>
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <button className="w-full py-3 rounded-xl bg-cian text-black font-semibold">Entrar</button>
      </form>
    </div>
  );
}

export default function App() {
  const [login,setLogin] = useState(false);
  const [admin,setAdmin] = useState(false);
  useEffect(()=>{ supabase.auth.getSession().then(({data})=>setAdmin(!!data.session)); },[]);
  if (admin) return <Admin salir={async()=>{await supabase.auth.signOut();setAdmin(false);}}/>;
  return (
    <>
      <Fondo/><Hero/><Catalogo/><Solicitud/><Resenas/>
      <footer className="text-center py-10 text-sm text-slate-500">
        © Refrigeración Enterprise ·{" "}
        <button onClick={()=>setLogin(true)} className="inline-flex items-center gap-1 text-cian"><Lock size={14}/> Administración</button>
      </footer>
      {login && <Login cerrar={()=>setLogin(false)} entrar={()=>{setLogin(false);setAdmin(true);}}/>}
    </>
  );
}
