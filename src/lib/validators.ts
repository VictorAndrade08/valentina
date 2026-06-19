/**
 * Valida una cédula ecuatoriana con el algoritmo módulo 10 oficial.
 * Reglas:
 *  - 10 dígitos numéricos exactos
 *  - 2 primeros dígitos entre 01 y 24 (códigos de provincia válidos del Ecuador)
 *  - 3er dígito < 6 (persona natural; 6 son consejos provinciales, 9 son sociedades privadas)
 *  - El último dígito (verificador) cumple el algoritmo módulo 10
 */
export function validarCedulaEcuatoriana(cedula: string): boolean {
  if (!/^\d{10}$/.test(cedula)) return false;

  const provincia = parseInt(cedula.substring(0, 2), 10);
  if (provincia < 1 || provincia > 24) return false;

  const tercerDigito = parseInt(cedula[2], 10);
  if (tercerDigito >= 6) return false;

  const digitos = cedula.split("").map(Number);
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let producto = digitos[i] * coeficientes[i];
    if (producto >= 10) producto -= 9;
    suma += producto;
  }
  const verificador = (10 - (suma % 10)) % 10;
  return verificador === digitos[9];
}

/** Mensaje legible si la cédula es inválida. */
export const MSG_CEDULA_INVALIDA =
  "La cédula ingresada no es válida. Verificá los 10 dígitos.";
