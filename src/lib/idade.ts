export function calcularIdade(dataNascimento: Date, referencia: Date = new Date()): number {
  let idade = referencia.getFullYear() - dataNascimento.getFullYear();
  const diferencaMes = referencia.getMonth() - dataNascimento.getMonth();

  if (diferencaMes < 0 || (diferencaMes === 0 && referencia.getDate() < dataNascimento.getDate())) {
    idade--;
  }

  return idade;
}
