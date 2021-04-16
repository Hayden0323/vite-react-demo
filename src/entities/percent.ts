import { ONE_HUNDRED, Rounding } from './constants';
import { Fraction } from './fraction';

const ONE_HUNDRED_PERCENT = new Fraction(ONE_HUNDRED);

export class Percent extends Fraction {
  public toPrecision (significantDigits = 5, rounding?: Rounding): string {
    return this.multipliedBy(ONE_HUNDRED_PERCENT).toPrecision(significantDigits, rounding);
  }

  public toFixed (significantDigits = 2, rounding?: Rounding): string {
    return this.multipliedBy(ONE_HUNDRED_PERCENT).toFixed(significantDigits, rounding);
  }
}
