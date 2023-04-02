import { useState } from "react";
import type Conexion from "./Conexion";
import { random } from "./utils";

export type FrutaType = "🥝" | "🍎" | "🍌";

type FrutaConId = {
  fruta: FrutaType;
  id: string;
};

export default function Frutas({ conexion }: { conexion: typeof Conexion }) {
  const agregarFruta = (fruta: FrutaType) => {
    const nuevaFruta = {
      fruta,
      id: (crypto as any).randomUUID(),
    };
    setFrutas([...frutas, nuevaFruta]);
  };
  conexion.agregarCallback(agregarFruta);

  const [frutas, setFrutas] = useState<FrutaConId[]>([]);

  const enviarFruta = (fruta: FrutaType) => {
    conexion.enviarMensaje(fruta);
  };

  return (
    <>
      <div className="columns">
        <div className="column is-one-third is-offset-one-quarter">
          <button
            className="button is-medium is-fullwidth"
            onClick={() => enviarFruta("🥝")}
          >
            🥝
          </button>
          <button
            className="button is-medium is-fullwidth"
            onClick={() => enviarFruta("🍎")}
          >
            🍎
          </button>
          <button
            className="button is-medium is-fullwidth"
            onClick={() => enviarFruta("🍌")}
          >
            🍌
          </button>
        </div>
      </div>

      {frutas.map(({ fruta, id }) => (
        <Fruta key={id} fruta={fruta} />
      ))}
    </>
  );
}

const POSICION_MINIMA = 10;
const POSICION_MAXIMA = 85;

function Fruta({ fruta }: { fruta: FrutaType }) {
  const [posicionX] = useState(random(POSICION_MINIMA, POSICION_MAXIMA));
  const [posicionY] = useState(random(POSICION_MINIMA, POSICION_MAXIMA));
  return (
    <div
      className="fruta"
      style={{
        top: `${posicionY}%`,
        left: `${posicionX}%`,
      }}
    >
      {fruta}
    </div>
  );
}
