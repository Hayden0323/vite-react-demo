import BigNumber from 'bignumber.js';
import { BigNumberIsh, Rounding, TEN } from './constants';
import { Fraction } from './fraction';
import { Token } from './token';
import { TokenAmount } from './tokenAmount';
import { currencyEquals } from './utils';

export class Price extends Fraction {
  public readonly baseToken: Token
  public readonly quoteToken: Token
  public readonly scalar: Fraction

  public constructor (baseToken: Token, quoteToken: Token, denominator: BigNumberIsh, numerator: BigNumberIsh) {
    super(numerator, denominator);

    this.baseToken = baseToken;
    this.quoteToken = quoteToken;
    this.scalar = new Fraction(
      TEN.exponentiatedBy(new BigNumber(baseToken.decimals)),
      TEN.exponentiatedBy(new BigNumber(quoteToken.decimals))
    );
  }

  public get raw (): Fraction {
    return new Fraction(this.numerator, this.denominator);
  }

  public get adjusted (): Fraction {
    return super.multipliedBy(this.scalar);
  }

  public invert (): Price {
    return new Price(this.quoteToken, this.baseToken, this.numerator, this.denominator);
  }

  public multipliedBy (other: Price): Price {
    if (!currencyEquals(this.quoteToken, other.baseToken)) {
      throw new Error('Token is not equal.');
    }

    const fraction = super.multipliedBy(other);

    return new Price(this.baseToken, other.quoteToken, fraction.denominator, fraction.numerator);
  }

  public quote (tokenAmount: TokenAmount): TokenAmount {
    if (!currencyEquals(tokenAmount.token, this.baseToken)) {
      throw new Error('Token is not equal.');
    }

    return new TokenAmount(this.quoteToken, super.multipliedBy(tokenAmount.raw).quotient);
  }

  public toPrecision (significantDigits = 6, rounding?: Rounding): string {
    return this.adjusted.toPrecision(significantDigits, rounding);
  }

  public toFixed (significantDigits = 4, rounding?: Rounding): string {
    return this.adjusted.toFixed(significantDigits, rounding);
  }
}
