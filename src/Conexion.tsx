import {
  CollectionReference,
  DocumentData,
  QuerySnapshot,
  addDoc,
  deleteDoc,
  collection,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import Firebase from "./Firebase";

const serverConfig = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
    {
      urls: import.meta.env.VITE_TURN_URL,
      credential: import.meta.env.VITE_TURN_CREDENTIAL,
      username: import.meta.env.VITE_TURN_USER,
    },
  ],
  iceCandidatePoolSize: 10,
};

class Conexion {
  peerConnection = new RTCPeerConnection(serverConfig);
  readonly db = getFirestore(Firebase);
  canal: RTCDataChannel | undefined;
  callbackMensaje: Function | undefined;

  constructor() {
    this.agregarPeerConnectionEventListeners();
  }

  agregarCallback(callback: Function) {
    this.callbackMensaje = callback;
  }

  async crearSala(idDeSala: string, callback?: Function) {
    this.canal = this.peerConnection.createDataChannel("canal");
    this.callbackMensaje = callback;

    this.agregarEventListenersAlCanal();

    const { referenciaDeSala, candidatosOferta, candidatosRespuesta } =
      this.sala(idDeSala.toString());

    this.peerConnection.onicecandidate =
      this.agregarIceCandidateLocal(candidatosOferta);

    const descripcionDeOferta = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(descripcionDeOferta);

    const offer = {
      type: descripcionDeOferta.type,
      sdp: descripcionDeOferta.sdp,
    };

    await setDoc(referenciaDeSala, { offer });
    onSnapshot(referenciaDeSala, async (snapshot) => {
      const data = snapshot.data();
      console.log("Got updated room:", data);
      if (!this.peerConnection.currentRemoteDescription && data?.answer) {
        console.log("Set remote description: ", data.answer);
        const answer = new RTCSessionDescription(data.answer);
        await this.peerConnection.setRemoteDescription(answer);
      }
    });

    onSnapshot(candidatosRespuesta, this.agregarIceCandidateExterno);
  }

  async ingresarASala(idDeSala: string, callback?: Function) {
    this.callbackMensaje = callback;
    const { referenciaDeSala, candidatosOferta, candidatosRespuesta } =
      this.sala(idDeSala);
    const snapshotDeSala = await getDoc(referenciaDeSala);
    const informacionDeSala = snapshotDeSala.data();
    const descripcionDeOferta = informacionDeSala?.offer;
    if (!descripcionDeOferta) throw Error("No se encontró oferta en la sala");

    console.log("Got room:", snapshotDeSala.exists);

    this.peerConnection.ondatachannel = (evento) => {
      const canalRecibido = evento.channel;
      console.log("recibido canal, ", canalRecibido);

      this.canal = canalRecibido;

      this.agregarEventListenersAlCanal();
    };

    this.peerConnection.onicecandidate =
      this.agregarIceCandidateLocal(candidatosRespuesta);

    await this.peerConnection.setRemoteDescription(
      new RTCSessionDescription(descripcionDeOferta)
    );

    const descripcionDeRespuesta = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(descripcionDeRespuesta);

    const answer = {
      type: descripcionDeRespuesta.type,
      sdp: descripcionDeRespuesta.sdp,
    };
    await updateDoc(referenciaDeSala, { answer });
    onSnapshot(candidatosOferta, this.agregarIceCandidateExterno);
  }

  enviarMensaje(mensaje: string) {
    this.canal?.send(mensaje);
  }

  cerrarConexion = () => {
    this.canal?.close();
    if (this.peerConnection.connectionState != "closed") {
      this.peerConnection.close();
      this.peerConnection = new RTCPeerConnection(serverConfig);
      this.agregarPeerConnectionEventListeners();
    }
  };

  async limpiarSala(id: string) {
    await deleteDoc(doc(this.db, "rooms", id));
  }

  private agregarEventListenersAlCanal() {
    if (!this.canal) return;

    this.canal.onopen = (evento) => {
      console.log("abierto el canal, ", evento);
    };

    this.canal.onclose = (evento) => {
      console.log("cerrado el canal, ", evento);
    };

    this.canal.onmessage = ({ data }) => {
      console.info(data);
      if (this.callbackMensaje) this.callbackMensaje(data);
    };
  }

  private sala(id: string) {
    const referenciaDeSala = doc(this.db, "rooms", id);

    const candidatosOferta = collection(
      this.db,
      "rooms",
      id,
      "offerCandidates"
    );
    const candidatosRespuesta = collection(
      this.db,
      "rooms",
      id,
      "answerCandidates"
    );

    return { referenciaDeSala, candidatosOferta, candidatosRespuesta };
  }

  private agregarIceCandidateLocal(
    listaCandidatos: CollectionReference<DocumentData>
  ) {
    return function (evento: RTCPeerConnectionIceEvent) {
      if (!evento.candidate) {
        console.log("Got final candidate!");
        return;
      }
      console.log("Got candidate: ", evento.candidate);
      addDoc(listaCandidatos, evento.candidate.toJSON());
    };
  }

  private agregarIceCandidateExterno = async (
    snapshot: QuerySnapshot<DocumentData>
  ) => {
    snapshot.docChanges().forEach((cambio) => {
      if (cambio.type === "added") {
        console.log("se agregó un candidato");
        const candidate = new RTCIceCandidate(cambio.doc.data());
        this.peerConnection.addIceCandidate(candidate);
      }
    });
  };

  private agregarPeerConnectionEventListeners() {
    this.peerConnection.addEventListener("icegatheringstatechange", () => {
      console.log(
        `ICE gathering state changed: ${this.peerConnection.iceGatheringState}`
      );
    });

    this.peerConnection.addEventListener("connectionstatechange", () => {
      console.log(
        `Connection state change: ${this.peerConnection.connectionState}`
      );
    });

    this.peerConnection.addEventListener("signalingstatechange", () => {
      console.log(
        `Signaling state change: ${this.peerConnection.signalingState}`
      );
    });

    this.peerConnection.addEventListener("iceconnectionstatechange ", () => {
      console.log(
        `ICE connection state change: ${this.peerConnection.iceConnectionState}`
      );
    });
  }
}

export default new Conexion();
