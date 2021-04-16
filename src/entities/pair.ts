import { BigNumber } from '.';
import { ONE, ZenlinkAssetId, ZERO, _1000, _997 } from './constants';
import { Price } from './price';
import { Token } from './token';
import { TokenAmount } from './tokenAmount';
import { validateAndParseAssetId } from './utils';

export class Pair {
  public readonly chainId: number
  public readonly liquidityToken: Token
  private readonly tokenAmounts: [TokenAmount, TokenAmount]

  public constructor (chainId: number, liquidityAssetId: ZenlinkAssetId | string, tokenAAmount: TokenAmount, tokenBAmount: TokenAmount) {
    const tokenAmounts = tokenAAmount.token.sortsBefore(tokenBAmount.token)
      ? [tokenAAmount, tokenBAmount]
      : [tokenBAmount, tokenAAmount];

    this.chainId = chainId;
    this.liquidityToken = new Token(validateAndParseAssetId(liquidityAssetId), 8, 'ZLK-LP', 'Zenlink LP');
    this.tokenAmounts = tokenAmounts as [TokenAmount, TokenAmount];
  }

  public involvesToken (token: Token): boolean {
    return token.equals(this.token0) || token.equals(this.token1);
  }

  // the ratio of reserve1 to reserve0
  public get token0Price (): Price {
    return new Price(this.token0, this.token1, this.tokenAmounts[0].raw, this.tokenAmounts[1].raw);
  }

  // the ratio of reserve0 to reserve1
  public get token1Price (): Price {
    return new Price(this.token1, this.token0, this.tokenAmounts[1].raw, this.tokenAmounts[0].raw);
  }

  public priceOf (token: Token): Price {
    if (!this.involvesToken(token)) throw new Error('Token is not involved.');

    return token.equals(this.token0) ? this.token0Price : this.token1Price;
  }

  public get token0 (): Token {
    return this.tokenAmounts[0].token;
  }

  public get token1 (): Token {
    return this.tokenAmounts[1].token;
  }

  public get reserve0 (): TokenAmount {
    return this.tokenAmounts[0];
  }

  public get reserve1 (): TokenAmount {
    return this.tokenAmounts[1];
  }

  public reserveOf (token: Token): TokenAmount {
    if (!this.involvesToken(token)) throw new Error('Token is not involved.');

    return token.equals(this.token0) ? this.reserve0 : this.reserve1;
  }

  public getOutputAmount (inputAmount: TokenAmount): [TokenAmount, Pair] {
    if (!this.involvesToken(inputAmount.token)) throw new Error('Token is not involved.');
    if (this.reserve0.raw.isEqualTo(ZERO) || this.reserve1.isEqualTo(ZERO)) throw new Error('Reserve0 or reserve1 is Zero.');
    const inputReserve = this.reserveOf(inputAmount.token);
    const outputReserve = this.reserveOf(inputAmount.token.equals(this.token0) ? this.token1 : this.token0);
    const inputAmountWithFee = inputAmount.raw.multipliedBy(_997);
    const numerator = inputAmountWithFee.multipliedBy(outputReserve.raw);
    const denominator = inputReserve.raw.multipliedBy(_1000).plus(inputAmountWithFee);
    const outputAmount = new TokenAmount(
      inputAmount.token.equals(this.token0) ? this.token1 : this.token0,
      numerator.dividedBy(denominator)
    );

    if (outputAmount.raw.isEqualTo(ZERO)) throw new Error('OutputAmount is Zero.');

    return [outputAmount, new Pair(this.chainId, this.liquidityToken.assetId, inputReserve.plus(inputAmount), outputReserve.minus(outputAmount))];
  }

  public getInputAmount (outputAmount: TokenAmount): [TokenAmount, Pair] {
    if (!this.involvesToken(outputAmount.token)) throw new Error('Token is not involved.');
    if (
      this.reserve0.raw.isEqualTo(ZERO) ||
      this.reserve1.raw.isEqualTo(ZERO)
    ) throw new Error('Insufficient reserve.');

    const outputReserve = this.reserveOf(outputAmount.token);
    const inputReserve = this.reserveOf(outputAmount.token.equals(this.token0) ? this.token1 : this.token0);
    const numerator = inputReserve.raw.multipliedBy(outputAmount.raw).multipliedBy(_1000);
    const denominator = outputReserve.raw.minus(outputAmount.raw).multipliedBy(_997);
    const inputToken = outputAmount.token.equals(this.token0) ? this.token1 : this.token0;

    const inputAmount = outputAmount.raw.isGreaterThanOrEqualTo(this.reserveOf(outputAmount.token).raw)
      ? new TokenAmount(inputToken, 0)
      : new TokenAmount(inputToken, numerator.dividedBy(denominator).plus(ONE));

    return [inputAmount, new Pair(this.chainId, this.liquidityToken.assetId, inputReserve.plus(inputAmount), outputReserve.minus(outputAmount))];
  }

  public getLiquidityMinted (
    totalSupply: TokenAmount,
    tokenAAmount: TokenAmount,
    tokenBAmount: TokenAmount
  ): TokenAmount {
    if (!totalSupply.token.equals(this.liquidityToken)) throw new Error('TotalSupply token is not Equal.');
    const tokenAmounts = tokenAAmount.token.sortsBefore(tokenBAmount.token)
      ? [tokenAAmount, tokenBAmount]
      : [tokenBAmount, tokenAAmount];

    if (!(tokenAmounts[0].token.equals(this.token0) && tokenAmounts[1].token.equals(this.token1))) {
      throw new Error('Tokens are not Equal.');
    }

    let liquidity: BigNumber;

    if (totalSupply.raw.isEqualTo(ZERO)) {
      liquidity = tokenAmounts[0].raw.multipliedBy(tokenAmounts[1].raw).squareRoot();
    } else {
      const amount0 = tokenAmounts[0].raw.multipliedBy(totalSupply.raw).dividedBy(this.reserve0.raw);
      const amount1 = tokenAmounts[1].raw.multipliedBy(totalSupply.raw).dividedBy(this.reserve1.raw);

      liquidity = amount0.isLessThanOrEqualTo(amount1) ? amount0 : amount1;
    }

    // if (!liquidity.isGreaterThan(ZERO)) throw new Error('Insufficient inputAmount.');

    return new TokenAmount(this.liquidityToken, liquidity);
  }

  // get tokenDeposited
  public getLiquidityAmount (
    token: Token,
    totalSupply: TokenAmount,
    liquidity: TokenAmount
  ): TokenAmount {
    if (!this.involvesToken(token)) throw new Error('Token is not involved.');
    if (!totalSupply.token.equals(this.liquidityToken)) throw new Error('TotalSupply is not equal.');
    if (!liquidity.token.equals(this.liquidityToken)) throw new Error('Liquidity is not Equal.');
    if (liquidity.raw.isGreaterThan(totalSupply.raw)) throw new Error('Liquidity is greater than totalSupply.');

    const totalSupplyAdjusted: TokenAmount = totalSupply;

    return new TokenAmount(
      token,
      liquidity.raw.multipliedBy(this.reserveOf(token).raw).dividedBy(totalSupplyAdjusted.raw)
    );
  }
}
