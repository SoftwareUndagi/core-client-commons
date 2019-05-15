
import { LookupWithToken , LookupWithTokenResponse, LookupRequestData, CommonLookupValue, LookupRequestResultWrapper, CommonLookupHeader } from 'base-commons-module';
export interface LoadLookupFromCacheDataWrapper {

    /**
     * data lookup yang harus di request ke server
     */
    lookupRequests: LookupRequestData[];
    /**
     * data lov hasil load dari cach3
     */
    cachedLookups: { [id: string]: CommonLookupValue[] };
}
/**
 * data dari cache( localstorage)
 */
export interface CachedLookupDefinition {
    id: string;
    version: string;
    lookupData: CommonLookupValue[];
    timestamp?: Date;
}

/**
 * interface untuk element dengan lookup enabled
 */
export interface LOVEnabledComponent {
    /**
     * id dari lookup. ini untuk di request kembali ke server
     */
    lovId: string;
    /**
     * assign lookup header data
     */
    assignLookupData(lookupData: CommonLookupValue[]): void;

}
/**
 * interface look up manager
 */
export interface ListOfValueManager {
    /**
     * nama untuk debug
     */
    ownerNameForDebug: string  ; 
    /**
     * membaca lookup dengan lov id + detail code
     */
    getLookup(lookupId: string, valueCode: string): CommonLookupValue;
    /**
     * register lookup
     */
    register(lov: LOVEnabledComponent): void;
    /**
     * id dari lookups. dalam editor memerlukan looup apa saja
     */
    getLookupIds(): string[];

    /**
     * request lookup data dengan lov ids
     */
    requestLookupDataWithLovIds(ids: string[], onCacheDataRecieved?: (cache: { [id: string]: CommonLookupValue[] }) => any): Promise<{ [id: string]: CommonLookupValue[] }>;
    /**
     * request lookup data ke server
     */
    requestLookupDataWithPromise(lookupParam: LookupWithToken): Promise<LookupWithTokenResponse>;
    /**
     * request lookup data ke server
     */
    requestLookupData(lookupParam: LookupWithToken, onComplete?: (indexedLookup: { [id: string]: CommonLookupValue[] }) => any): void;
    /**
     * proses lookup data, di terima dari server , di masukan kembali ke dalam control dan cache
     * return : cache yang di update
     */
    processLookupRequestResult(lookups: LookupRequestResultWrapper[]): { [id: string]: CommonLookupValue[] };

    /**
     * load data dari cache
     * @param ids id dari lookup
     */
    loadFromCache(ids: string[]): Promise<{ [id: string]: CommonLookupValue[] }>;
    /**
     * load dari cache (1 saja)
     */
    loadFromCacheSingle(id: string ): Promise<CommonLookupValue[]> ; 
    /**
     * load data dari lookup dan generate lookup request.
     * ini bisa di pergunakan dalam mode edit. jadinya load temporary item dan request ke server
     */
    loadFromCacheAndGenerateLookupRequestWithPromise(ids: string[] /*onComplete : (reqData : LookupRequestData []) => any*/): Promise<LoadLookupFromCacheDataWrapper>;
    /**
     * alias dari loadFromCacheAndGenerateLookupRequest
     */
    loadFromCacheAndGenerateLookupRequestUsingPromiseAlias(): Promise<LookupRequestData[]>;
    /**
     * load data dari lookup dan generate lookup request.
     * ini bisa di pergunakan dalam mode edit. jadinya load temporary item dan request ke server
     */
    loadFromCacheAndGenerateLookupRequest(onComplete: (reqData: LookupRequestData[]) => any): any;
    /**
     * assign data lookup. misal ini di dapat dari generic edit --> /dynamics/rest-api/generic-edit/:pojo/:id, di inject langsung data ke dalam lookup
     */
    assignLookupDataToControls(lookupsData: CommonLookupHeader[]): void;
}