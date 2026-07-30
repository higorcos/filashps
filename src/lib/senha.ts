export function formatarSenha(codigo: string, numero: number): string {
  return `${codigo}${String(numero).padStart(3, "0")}`;
}
