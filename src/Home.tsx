import { useState } from "react";
import { Link } from "react-router-dom";
import { generador } from "./utils";

export default function Home() {
  const [salaID, setSalaID] = useState("");
  return (
    <section className="section is-large">
      <h1 className="title">Holis</h1>
      <div className="columns">
        <div className="column is-half">
          <div className="block">
            <Link to={`/${generador()}/anfitrion`}>
              <button className="button is-success is-fullwidth">
                Crear partida
              </button>
            </Link>
          </div>
          <div className="block">
            <input
              onChange={(event) => setSalaID(event.currentTarget.value)}
              className="input"
            ></input>
          </div>
          <div className="block">
            <Link to={`/${salaID}`}>
              <button className="button is-info" disabled={!salaID}>
                Unirse a una partida
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
