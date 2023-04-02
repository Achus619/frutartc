import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import Conexion from "./Conexion";
import Frutas from "./Frutas";

export default function Anfitrion() {
  const { salaID: id } = useParams<{ salaID: string }>();
  const conexionCreadaRef = useRef(false);
  const [listo, setListo] = useState(false);
  useEffect(() => {
    if (!id || conexionCreadaRef.current) return;
    conexionCreadaRef.current = true;
    Conexion.crearSala(id).then(() => setListo(true));
  }, []);

  return (
    <section className="section is-large">
      <Link to="/">
        <button>Home</button>
      </Link>
      <h3 className="subtitle">ID: {id}</h3>
      <h4>anfitrion</h4>

      {listo ? <Frutas conexion={Conexion} /> : <p>carganding</p>}
    </section>
  );
}
