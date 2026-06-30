/**
 * El admin ya tiene su propio loading state interno (login screen + spinners).
 * Devolvemos null para que NO se interponga el loader global mientras hidrata.
 */
export default function AdminLoading() {
  return null;
}
