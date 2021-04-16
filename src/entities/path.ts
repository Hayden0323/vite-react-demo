import { FullTokenAmountWithLoading } from '@zenlink-dapp/react-hooks';
import { GAS_FEE, PathWarning, ZenlinkAssetId, ZERO } from './constants';
import { TokenAmount } from './tokenAmount';
import { getNativeChainId } from './utils';

export class Path {
  public readonly executeChainId: number;
  public readonly assetId: ZenlinkAssetId;
  public readonly targetChainId: number;
  public readonly amount: TokenAmount;
  public readonly toTransfer: boolean;
  public readonly warning: PathWarning | undefined;

  public constructor (
    executeChainId: number,
    assetId: ZenlinkAssetId,
    targetChainId: number,
    amount: TokenAmount,
    toTransfer = true,
    warning = undefined
  ) {
    this.executeChainId = executeChainId;
    this.assetId = assetId;
    this.targetChainId = targetChainId;
    this.amount = amount;
    this.toTransfer = toTransfer;
    this.warning = warning;
  }

  public static bestPathsExactIn (
    tokenAmountIn: TokenAmount,
    currentAmount: FullTokenAmountWithLoading,
    targetChainId: number,
    balanceForGasFee: { [chainId: number]: TokenAmount }
  ): [Path[], PathWarning | undefined] {
    if (currentAmount.anyLoading) throw new Error('TokenAmount still loading.');

    const amountInTargetChain = currentAmount.amounts[targetChainId];
    let amountToTransfer = amountInTargetChain
      ? getNativeChainId(tokenAmountIn.token) === targetChainId
        ? tokenAmountIn.minus(amountInTargetChain.minus(
          // ensure gas fee to cover next transaction
          new TokenAmount(tokenAmountIn.token, GAS_FEE[tokenAmountIn.token.parsedAssetId.chain_id])
        ))
        : tokenAmountIn.minus(amountInTargetChain)
      : tokenAmountIn;
    const amountInTragetChainAssumed = amountToTransfer.raw.isGreaterThan(ZERO)
      ? amountInTargetChain
      : amountInTargetChain
        ? new TokenAmount(amountInTargetChain.token, tokenAmountIn.raw)
        : undefined;

    const formattedAmountList = Object.entries(currentAmount.amounts)
      .filter(
        ([chainId, amount]) => Number(chainId) !== targetChainId && amount !== undefined
      ) as [string, TokenAmount][];

    const sortedAmountList = formattedAmountList.sort(([, amountPrev], [, amount]) => {
      if (amountPrev.isLessThan(amount)) return 1;
      if (amountPrev.isGreaterThan(amount)) return -1;

      return 0;
    });

    const bestPaths = sortedAmountList.reduce< Path[] >(
      (previousPath, [id, amount]) => {
        if (!amountToTransfer.isGreaterThan(ZERO)) return previousPath;

        let warning;
        const isCurrentAmountEnough = !(amountToTransfer.isGreaterThan(amount));
        const isNativeToken = getNativeChainId(amount.token) === Number(id);
        const gasTokenAmount = isNativeToken
          ? new TokenAmount(amount.token, GAS_FEE[amount.token.parsedAssetId.chain_id])
          : balanceForGasFee[Number(id)]
            ? new TokenAmount(balanceForGasFee[Number(id)].token, GAS_FEE[amount.token.parsedAssetId.chain_id])
            : undefined;

        let currentAmountToTransfer = isCurrentAmountEnough
          ? amountToTransfer
          : amount;

        if (isNativeToken && gasTokenAmount && !isCurrentAmountEnough) {
          if (currentAmountToTransfer.isGreaterThan(gasTokenAmount)) {
            currentAmountToTransfer = currentAmountToTransfer.minus(gasTokenAmount);
          }
        }

        if (
          (isNativeToken && gasTokenAmount && isCurrentAmountEnough && amount.minus(amountToTransfer).isLessThan(gasTokenAmount)) ||
          (!isNativeToken && gasTokenAmount && balanceForGasFee[id] && balanceForGasFee[id].isLessThan(gasTokenAmount)) ||
          (!isNativeToken && !balanceForGasFee[id])
        ) {
          warning = PathWarning.INSUFFICIENT_GAS;
        }

        currentAmountToTransfer.isGreaterThan(ZERO) && previousPath.push(
          new Path(
            Number(id),
            amount.token.parsedAssetId,
            targetChainId,
            currentAmountToTransfer,
            true, warning
          )
        );

        amountToTransfer = amountToTransfer.minus(currentAmountToTransfer);

        return previousPath;
      },
      amountInTargetChain && amountInTargetChain.raw.isGreaterThan(ZERO)
        ? amountInTragetChainAssumed
          ? [
            new Path(
              targetChainId,
              amountInTargetChain.token.parsedAssetId,
              targetChainId,
              amountInTragetChainAssumed,
              false
            )
          ]
          : []
        : []
    );

    return [
      bestPaths,
      amountToTransfer.isGreaterThan(ZERO) ? PathWarning.INSUFFICIENT_TOTAL_AMOUNT : undefined
    ];
  }
}
