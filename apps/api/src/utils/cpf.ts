const cpfLength = 11;

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function normalizeCpf(value: string): string {
  return digitsOnly(value);
}

export function isValidCpf(value: string): boolean {
  const cpf = normalizeCpf(value);

  if (cpf.length !== cpfLength || isRepeatedDigitCpf(cpf)) {
    return false;
  }

  return cpf[9] === cpfCheckDigit(cpf, 9) && cpf[10] === cpfCheckDigit(cpf, 10);
}

export function formatCpf(value: string): string {
  const cpf = normalizeCpf(value);

  if (cpf.length !== cpfLength) {
    return value;
  }

  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
}

function isRepeatedDigitCpf(cpf: string): boolean {
  return /^(\d)\1{10}$/.test(cpf);
}

function cpfCheckDigit(cpf: string, position: 9 | 10): string {
  let sum = 0;

  for (let index = 0; index < position; index += 1) {
    sum += Number(cpf[index]) * (position + 1 - index);
  }

  const remainder = (sum * 10) % 11;
  return String(remainder === 10 ? 0 : remainder);
}
