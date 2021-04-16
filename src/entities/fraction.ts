import BigNumber from 'bignumber.js';
import { BigNumberIsh, ONE, Rounding } from './constants';
import { parseBigNumberIsh } from './utils';

const toPrecisionRounding = {
  [Rounding.ROUND_DOWN]: BigNumber.ROUND_DOWN,
  [Rounding.ROUND_HALF_UP]: BigNumber.ROUND_HALF_UP,
  [Rounding.ROUND_UP]: BigNumber.ROUND_UP
};

const toFixedRounding = {
  [Rounding.ROUND_DOWN]: BigNumber.ROUND_DOWN,
  [Rounding.ROUND_HALF_UP]: BigNumber.ROUND_HALF_UP,
  [Rounding.ROUND_UP]: BigNumber.ROUND_UP
};

export class Fraction {
  public readonly numerator: BigNumber
  public readonly denominator: BigNumber

  public constructor (numerator: BigNumberIsh, denominator: BigNumberIsh = ONE) {
    this.numerator = parseBigNumberIsh(numerator);
    this.denominator = parseBigNumberIsh(denominator);
  }

  public get quotient (): BigNumber {
    return this.numerator.dividedBy(this.denominator);
  }

  public invert (): Fraction {
    return new Fraction(this.denominator, this.numerator);
  }

  public plus (other: Fraction | BigNumberIsh): Fraction {
    const otherParsed = other instanceof Fraction ? other : new Fraction(parseBigNumberIsh(other));

    if (this.denominator.isEqualTo(otherParsed.denominator)) {
      return new Fraction(this.numerator.plus(otherParsed.numerator), this.denominator);
    }

    return new Fraction(
      this.numerator.multipliedBy(otherParsed.denominator)
        .plus(otherParsed.numerator.multipliedBy(this.denominator)),
      this.denominator.multipliedBy(otherParsed.denominator)
    );
  }

  public minus (other: Fraction | BigNumberIsh): Fraction {
    const otherParsed = other instanceof Fraction ? other : new Fraction(parseBigNumberIsh(other));

    if (this.denominator.isEqualTo(otherParsed.denominator)) {
      return new Fraction(this.numerator.minus(otherParsed.numerator), this.denominator);
    }

    return new Fraction(
      this.numerator.multipliedBy(otherParsed.denominator)
        .minus(otherParsed.numerator.multipliedBy(this.denominator)),
      this.denominator.multipliedBy(otherParsed.denominator)
    );
  }

  public isLessThan (other: Fraction | BigNumberIsh): boolean {
    const otherParsed = other instanceof Fraction ? other : new Fraction(parseBigNumberIsh(other));

    return this.numerator.multipliedBy(otherParsed.denominator)
      .isLessThan(otherParsed.numerator.multipliedBy(this.denominator));
  }

  public isEqualTo (other: Fraction | BigNumberIsh): boolean {
    const otherParsed = other instanceof Fraction ? other : new Fraction(parseBigNumberIsh(other));

    return this.numerator.multipliedBy(otherParsed.denominator)
      .isEqualTo(otherParsed.numerator.multipliedBy(this.denominator));
  }

  public isGreaterThan (other: Fraction | BigNumberIsh): boolean {
    const otherParsed = other instanceof Fraction ? other : new Fraction(parseBigNumberIsh(other));

    return this.numerator.multipliedBy(otherParsed.denominator)
      .isGreaterThan(otherParsed.numerator.multipliedBy(this.denominator));
  }

  public multipliedBy (other: Fraction | BigNumberIsh): Fraction {
    const otherParsed = other instanceof Fraction ? other : new Fraction(parseBigNumberIsh(other));

    return new Fraction(
      this.numerator.multipliedBy(otherParsed.numerator),
      this.denominator.multipliedBy(otherParsed.denominator)
    );
  }

  public dividedBy (other: Fraction | BigNumberIsh): Fraction {
    const otherParsed = other instanceof Fraction ? other : new Fraction(parseBigNumberIsh(other));

    return new Fraction(
      this.numerator.multipliedBy(otherParsed.denominator),
      this.denominator.multipliedBy(otherParsed.numerator)
    );
  }

  public toPrecision (significantDigits: number, rounding: Rounding = Rounding.ROUND_HALF_UP): string {
    if (!Number.isInteger(significantDigits)) {
      throw new Error(`${significantDigits} is not an integer.`);
    }

    if (significantDigits <= 0) {
      throw new Error(`${significantDigits} is not positive.`);
    }

    BigNumber.set({ POW_PRECISION: significantDigits + 1, ROUNDING_MODE: toPrecisionRounding[rounding] });
    const quotient = this.numerator.dividedBy(this.denominator)
    const integerLength = quotient.integerValue().toString().length

    if (integerLength > significantDigits) significantDigits = integerLength

    return quotient.toPrecision(significantDigits)
  }

  public toFixed (significantDigits: number, rounding: Rounding = Rounding.ROUND_HALF_UP): string {
    if (!Number.isInteger(significantDigits)) {
      throw new Error(`${significantDigits} is not an integer.`);
    }

    if (significantDigits < 0) {
      throw new Error(`${significantDigits} is not positive.`);
    }

    BigNumber.set({ POW_PRECISION: significantDigits + 1, ROUNDING_MODE: toFixedRounding[rounding] });
    const quotient = this.numerator.dividedBy(this.denominator).toFixed(significantDigits);

    return quotient;
  }
}
