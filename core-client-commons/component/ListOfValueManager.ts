import { CommonCommunicationData, LookupWithToken, LookupWithTokenResponse } from '../shared/index';


export interface LoadLookupFromCacheDataWrapper {

    /**
     * data lookup yang harus di request ke server
     */
    lookupRequests: CommonCommunicationData.LookupRequestData[]

    /**
     * data lov hasil load dari cach3
     */
    cachedLookups: { [id: string]: CommonCommunicationData.CommonLookupValue[] };
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
    * underlying element. elemetn yang menjadi based dari LOV
    */
    getElement(): HTMLElement;
    /**
     * assign lookup header data
     */
    assignLookupData(lookupData: CommonCommunicationData.CommonLookupValue[]);



}


/**
 * interface look up manager
 */
export interface ListOfValueManager {

    /**
     * membaca lookup dengan lov id + detail code
    */
    getLookup(lookupId: string, valueCode: string): CommonCommunicationData.CommonLookupValue;

    /**
     * register lookup
     */
    register(lov: LOVEnabledComponent);
    /**
     * id dari lookups. dalam editor memerlukan looup apa saja
     */
    getLookupIds(): string[];

    /**
     * request lookup data dengan lov ids
     */
    requestLookupDataWithLovIds(ids: string[], onCacheDataRecieved?: (cache: { [id: string]: CommonCommunicationData.CommonLookupValue[] }) => any): Promise<{ [id: string]: CommonCommunicationData.CommonLookupValue[] }>;
    /**
     * request lookup data ke server
     */
    requestLookupDataWithPromise(lookupParam: LookupWithToken): Promise<LookupWithTokenResponse>;
    /**
     * request lookup data ke server
     */
    requestLookupData(lookupParam: LookupWithToken, onComplete?: (indexedLookup: { [id: string]: CommonCommunicationData.CommonLookupValue[] }) => any);
    /**
     * proses lookup data, di terima dari server , di masukan kembali ke dalam control dan cache
     * return : cache yang di update
     */
    processLookupRequestResult(lookups: CommonCommunicationData.LookupRequestResultWrapper[]): { [id: string]: CommonCommunicationData.CommonLookupValue[] };

    /**
     * load data dari cache
     * @param ids id dari lookup
     */
    loadFromCache(ids: string[]): Promise<{ [id: string]: CommonCommunicationData.CommonLookupValue[] }>;

    /**
     * load data dari lookup dan generate lookup request.
     * ini bisa di pergunakan dalam mode edit. jadinya load temporary item dan request ke server
     */
    loadFromCacheAndGenerateLookupRequestWithPromise(ids: string[] /*onComplete : (reqData : CommonCommunicationData.LookupRequestData []) => any*/): Promise<LoadLookupFromCacheDataWrapper>;

     /**
     * alias dari loadFromCacheAndGenerateLookupRequest
     */
    loadFromCacheAndGenerateLookupRequestUsingPromiseAlias (  ) : Promise<CommonCommunicationData.LookupRequestData []> ;
     /**
     * load data dari lookup dan generate lookup request.
     * ini bisa di pergunakan dalam mode edit. jadinya load temporary item dan request ke server
     */
    loadFromCacheAndGenerateLookupRequest ( onComplete : (reqData : CommonCommunicationData.LookupRequestData []) => any ) : any  ; 
    /**
     * assign data lookup. misal ini di dapat dari generic edit --> /dynamics/rest-api/generic-edit/:pojo/:id, di inject langsung data ke dalam lookup
     */
    assignLookupDataToControls( lookupsData : CommonCommunicationData.CommonLookupHeader[]  ); 
}