import { ZenlinkAssetId } from './constants';
import { Currency } from './currency';
import { parseAssetId, validateAndParseAssetId } from './utils';

export class Token extends Currency {
  public readonly assetId: string;

  public constructor (assetId: string | ZenlinkAssetId, decimals: number, symbol?: string, name?: string) {
    super(decimals, symbol, name);
    this.assetId = validateAndParseAssetId(assetId);
  }

  public get parsedAssetId (): ZenlinkAssetId {
    return parseAssetId(this.assetId);
  }

  public equals (other: Token): boolean {
    if (this === other) {
      return true;
    }

    return this.assetId === other.assetId;
  }

  public sortsBefore (other: Token): boolean {
    if (this.assetId === other.assetId) throw new Error('AssetId is equal.');

    return this.assetId.toLowerCase() < other.assetId.toLowerCase();
  }
}
