import { BigNumber } from 'bignumber.js';
import { BigNumberIsh, Rounding, TEN } from './constants';
import { Currency } from './currency';
import { Fraction } from './fraction';
import { currencyEquals } from './utils';

export class CurrencyAmount extends Fraction {
  public readonly currency: Currency;

  public constructor (currency: Currency, amount: BigNumberIsh) {
    super(amount, TEN.exponentiatedBy(new BigNumber(currency?.decimals)));
    this.currency = currency;
  }

  public get raw (): BigNumber {
    return this.numerator;
  }

  public plus (other: CurrencyAmount): CurrencyAmount {
    if (!currencyEquals(this.currency, other.currency)) {
      throw new Error('Token is not euqal.');
    }

    return new CurrencyAmount(this.currency, this.raw.plus(other.raw));
  }

  public minus (other: CurrencyAmount): CurrencyAmount {
    if (!currencyEquals(this.currency, other.currency)) {
      throw new Error('Token is not euqal.');
    }

    return new CurrencyAmount(this.currency, this.raw.minus(other.raw));
  }

  public toPrecision (significantDigits = 6, rounding: Rounding = Rounding.ROUND_DOWN): string {
    return super.toPrecision(significantDigits, rounding);
  }

  public toFixed (significantDigits = this.currency.decimals, rounding: Rounding = Rounding.ROUND_DOWN): string {
    return super.toFixed(significantDigits, rounding);
  }

  public toFormat (format = { decimalSeparator: '.', groupSeparator: '' }): string {
    return new BigNumber(this.numerator.toString()).dividedBy(new BigNumber(this.denominator.toString())).toFormat(format);
  }
}
