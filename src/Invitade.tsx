import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import Conexion from "./Conexion";
import Frutas from "./Frutas";

export default function Invitade() {
  const { salaID: id } = useParams<{ salaID: string }>();
  const conexionCreadaRef = useRef(false);

  const [listo, setListo] = useState(false);
  useEffect(() => {
    if (!id || conexionCreadaRef.current) return;
    conexionCreadaRef.current = true;
    Conexion.ingresarASala(id).then(() => setListo(true));
    return Conexion.cerrarConexion;
  }, []);

  return (
    <section className="section is-large">
      <Link to="/">
        <button>Home</button>
      </Link>
      <h3 className="subtitle">ID: {id}</h3>

      {listo ? <Frutas conexion={Conexion} /> : <p>carganding</p>}
    </section>
  );
}
