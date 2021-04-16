import { BigNumberIsh } from './constants';
import { CurrencyAmount } from './currencyAmount';
import { Token } from './token';

export class TokenAmount extends CurrencyAmount {
  public readonly token: Token;

  public constructor (token: Token, amount: BigNumberIsh) {
    super(token, amount);
    this.token = token;
  }

  public plus (other: TokenAmount): TokenAmount {
    if (!this.token.equals(other.token)) {
      throw new Error('Token is not equal');
    }

    return new TokenAmount(this.token, this.raw.plus(other.raw));
  }

  public minus (other: TokenAmount): TokenAmount {
    if (!this.token.equals(other.token)) {
      throw new Error('Token is not equal');
    }

    return new TokenAmount(this.token, this.raw.minus(other.raw));
  }
}
