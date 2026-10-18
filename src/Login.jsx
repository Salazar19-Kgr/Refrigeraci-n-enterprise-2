import { useEffect, useState } from "react";
import { supabase } from "./supabase";

const U = import.meta.env.VITE_SUPABASE_URL;
const K = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function Login({ cerrar, entrar }) {
  const [email,setEmail] = useState("");
  const [codigo,setCodigo] = useState("");
  const [paso,setPaso] = useState(1);
  const [msg,setMsg] = useState("");
  const [net,setNet] = useState("probando...");
  useEffect(()=>{
    if (!U) { setNet("FALTA la variable VITE_SUPABASE_URL"); return; }
    fetch(U+"/auth/v1/health",{headers:{apikey:K}})
      .then(r=>setNet(r.ok?"OK":"error "+r.status))
      .catch(()=>setNet("SIN CONEXIÓN con "+U));
  },[]);
  async function pedir(e) {
    e.preventDefault(); setMsg("Enviando código...");
    const {error} = await supabase.auth.signInWithOtp({email:email.trim().toLowerCase(),options:{shouldCreateUser:false}});
    if (error) setMsg(error.message); else { setPaso(2); setMsg("Te enviamos un código a tu correo."); }
  }
  async function verificar(e) {
    e.preventDefault();
    const {error} = await supabase.auth.verifyOtp({email:email.trim().toLowerCase(),token:codigo.trim(),type:"email"});
    if (error) setMsg(error.message); else entrar();
  }
  return (
    <div className="fixed inset-0 bg-black/70 grid place-items-center p-6 z-50" onClick={cerrar}>
      <form onClick={e=>e.stopPropagation()} onSubmit={paso===1?pedir:verificar} className="glass p-6 w-full max-w-sm space-y-3">
        <h3 className="text-xl font-bold">Administración</h3>
        {paso===1
          ? <input required type="email" placeholder="Correo de administrador" value={email} onChange={e=>setEmail(e.target.value)}/>
          : <input required inputMode="numeric" placeholder="Código del correo" value={codigo} onChange={e=>setCodigo(e.target.value)}/>}
        {msg && <p className="text-sm text-cian">{msg}</p>}
        <button className="w-full py-3 rounded-xl bg-cian text-black font-semibold">{paso===1?"Enviar código":"Entrar"}</button>
        <p className="text-xs text-slate-500">Conexión: {net}</p>
      </form>
    </div>
  );
}
