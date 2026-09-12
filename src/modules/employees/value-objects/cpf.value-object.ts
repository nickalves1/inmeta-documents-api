export class Cpf {
  private readonly value: string;

  constructor(raw: string) {
    const digits = raw.replace(/\D/g, '');

    if (digits.length !== 11) {
      throw new Error(`CPF inválido: ${raw}`);
    }

    this.value = digits;
  }

  toString(): string {
    return this.value;
  }
}
