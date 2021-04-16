import BigNumber from 'bignumber.js';

export type BigNumberIsh = BigNumber | number | string

export enum Rounding {
  ROUND_DOWN,
  ROUND_HALF_UP,
  ROUND_UP
}

export type ZenlinkAssetId = {
  chain_id: number;
  module_index: number;
  asset_index: number;
}

export enum PathWarning {
  INSUFFICIENT_GAS = 'INSUFFICIENT_GAS',
  INSUFFICIENT_TOTAL_AMOUNT = 'INSUFFICIENT_TOTAL_AMOUNT'
}

export const ZERO = new BigNumber(0);
export const ONE = new BigNumber(1);
export const TWO = new BigNumber(2);
export const THREE = new BigNumber(3);
export const TEN = new BigNumber(10);
export const ONE_HUNDRED = new BigNumber(100);
export const _997 = new BigNumber(997);
export const _1000 = new BigNumber(1000);

export const GAS_FEE = {
  188: new BigNumber(0.01).multipliedBy(TEN.exponentiatedBy(new BigNumber(12))),
  200: new BigNumber(0.01).multipliedBy(TEN.exponentiatedBy(new BigNumber(12))),
  300: new BigNumber(0.01).multipliedBy(TEN.exponentiatedBy(new BigNumber(12))),
  400: new BigNumber(0.01).multipliedBy(TEN.exponentiatedBy(new BigNumber(12)))
};

export const DEFAULT_LIQUIDITY_CHAINID = 200;
