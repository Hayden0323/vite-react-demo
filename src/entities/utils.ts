/* eslint-disable sort-keys */

import BigNumber from 'bignumber.js';
import { isString } from 'lodash';
import { ZenlinkAssetId, BigNumberIsh } from './constants';
import { Currency } from './currency';
import { Token } from './token';

export const ASSET_ID_REGEX = /\d+(-\d+)(-\d+)/;

export function parseBigNumberIsh (bignumberIsh: BigNumberIsh): BigNumber {
  return bignumberIsh instanceof BigNumber
    ? bignumberIsh
    : new BigNumber(bignumberIsh);
}

export function currencyEquals (currencyA: Currency, currnecyB: Currency): boolean {
  if (currencyA instanceof Token && currnecyB instanceof Token) {
    return currencyA.equals(currnecyB);
  }

  if (currencyA instanceof Token || currnecyB instanceof Token) {
    return false;
  }

  return currencyA === currnecyB;
}

export function parseAssetId (assetId: string): ZenlinkAssetId {
  if (!ASSET_ID_REGEX.test(assetId)) throw new Error('AssetId is not legal.');
  const assetIds = assetId.split('-');

  return {
    chain_id: Number(assetIds[0]),
    module_index: Number(assetIds[1]),
    asset_index: Number(assetIds[2])
  };
}

export function validateAndParseAssetId (assetId: string | ZenlinkAssetId): string {
  if (isString(assetId) && ASSET_ID_REGEX.test(assetId)) return assetId;
  if (isString(assetId)) throw new Error('AssetId is not legal');

  return [
    assetId.chain_id,
    assetId.module_index,
    assetId.asset_index
  ].join('-');
}

export function getNativeChainId (token: Token): number | undefined {
  const tokenList = localStorage.getItem('rootState');

  if (!tokenList) return undefined;
  const defaultToken = JSON.parse(tokenList).tokenListStore.tokenlist.find(
    (
      defaultToken: { isNative: string; chainId: number; moduleIndex: number; assetIndex: number; }
    ) => defaultToken.isNative === 'N' &&
    defaultToken.chainId === token.parsedAssetId.chain_id &&
    defaultToken.moduleIndex === token.parsedAssetId.module_index &&
    defaultToken.assetIndex === token.parsedAssetId.asset_index
  );

  if (!defaultToken) return undefined;

  return Number(defaultToken.chainId);
}
