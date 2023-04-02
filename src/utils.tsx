export function generador() {
  var array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return array[0] % 100000;
}

export function random(valorMinimo: number, valorMaximo: number) {
  return Math.floor(
    Math.random() * (valorMaximo - valorMinimo + 1) + valorMinimo
  );
}
