/**
 * data untuk di pass ke server 
 */
export namespace CommonCommunicationData {
     /**
     * untuk data response list
     */
    export interface ParameterizedListDataAjaxResponse<DATA>{
        /**
         * data yang di kembalikan ke client
         */
        data? : DATA[]  ;
        /**
         * flag have error atau tidak
         */
        haveError : boolean ;
        /**
         * error code. ini untuk register error ke berapa
         */
        errorCode? : string  ;
        /**
         * additional error
         */
        errorMessage? : string ;
    }


    /**
     * untuk data response tunggal
     */
    export interface ParameterizedSingleDataAjaxResponse<DATA>{

        /**
         * data yang di kembalikan ke client
         */
        data? : DATA  ;
        /**
         * flag have error atau tidak
         */
        haveError : boolean ;
        /**
         * error code. ini untuk register error ke berapa
         */
        errorCode? : string  ;
        /**
         * additional error
         */
        errorMessage? : string ;
    }
    
    
    
    
    
    
    
    /**
     * data dengan token untuk edit. ini untuk memfetch data sekali + edit data
     */
    export interface DataWithEditToken<DATA> {
        
        /**
         * token untuk edit data
         */
        editDataToken : string ;
        
        /**
         * data untuk di edit
          */ 
        data : DATA ; 
        
    }
    
    
    

    /**
     * commons response dari data ajax request
     */
    export interface CommonsAjaxResponse {
        /**
         * data yang di kembalikan ke client
         */
        data? : any  ;
        /**
         * flag have error atau tidak
         */
        haveError : boolean ;
        /**
         * error code. ini untuk register error ke berapa
         */
        errorCode? : string  ;
        /**
         * additional error
         */
        errorMessage? : string ;
    }



    /**
     * header common lookup
     */
    export interface CommonLookupHeader {
        /**
         * id dari lookup
         * column : lov_id*/
        id :string;
        /**
         * catatan dalam LOV
         * column : lov_remark*/
        remark? :string;
        /**
         *  lookup details
         */
        details? : CommonLookupValue[] ;
        
        
        /**
         * versi dari lookup
         */
        version? : string ; 
        
        
    }

    /**
     * interface untuk lookup simple. ini bagian details
     */
    export interface CommonLookupValue {
        /**
         * id dari data
         * column : id*/
        id? :number;
        /**
         * kode lookup detail. ini untuk value
         * column : detail_code*/
        detailCode? :string;
        /**
         * id LOV header
         * column : lov_id*/
        lovId? :string;
        /**
         * label dari lookup
         * column : lov_label*/
        label? :string;
        /**
         * value 1
         * column : val_1*/
        value1? :string;
        /**
         * value 2
         * column : val_2*/
        value2? :string;
        /**
         * key internalization dari data. di ambil dari local client
         * column : i18n_key*/
        i18nKey? :string;
        /**
         * urutan data
         * column : seq_no*/
        sequenceNo? :number;
    }

    /**
     * di pergunakan untuk editor, pada saat add, di kirimi data lookup + token 
     */
    export interface LookupRequestResultWithEditTokenData {
        
        /**
         * token untuk editor
         */
        token : string ; 
        
        /**
         * data lookups
         */
        lookups : LookupRequestResultWrapper [] ; 
        
    }    

    export interface LookupRequestData {

        /**
         * id dari lookup
         */
        lovId:string   ;
        /**
         * versi dari lookup
         */
        version? : string ;

        /**
         * kode yang di ambil dari lookup
         */
        filteredCodes? : string[] ;
    }
    
    /**
     * parameter untuk included fields
     */
    export interface IncludeModelParam {
        /**
         * nama model . sequelize model
         */
        modelName : string ;
        
         /**
         * false = left outer, true = inner join
         */
        required ? : boolean ; 
        
        
        
        /**
         * where clause. standard sequelize
         */
        where? : any  ; 
        
          /**
         * nama alias dari model. kalau misal 1 data ada 2 reference ke model yang sama. 
         */
        as? : string ;  


        /**
         * sub include param. untuk level beriktu dari include
         */
        includeModels ? : IncludeModelParam[] ; 
    }
    
    
    
    /**
     * query untuk paged data
     */
    export interface PagedDataQueryResult <DATA> {
        /**
         * data rows yang di baca
         */
        rows? : DATA[] ;
        
        /**
         * total data yang tersedia
         */
        count ? : number ; 
         
    }


    /**
     * requestor untuk membaca data berupa list. di harapkan untuk mengeluarkan list sederhana
     */
    export interface ListDataQueryRequestParam {

        /**
         * nama model untuk di baca
         */
        modelName : string ; 


        /** 
         * filter data
        */
        where ?  : any ; 

        /**
         * model di include dalam search
         */
        includeModels ? : IncludeModelParam[] ; 

        /**
         * parameter sorting
         */
        order ? : SortParam[] |SortParamAssociated[] ; 




        /**
         * param loookup untuk data berupa list. data akan di cari berdasarkan dalam data list
         */
        lookupParams ? : LookupRequestForLookupOnListDataParam[]; 

    }



     /**
     * requestor data dengan hasil single data
     */
    export interface SingleDataQueryRequestParam {

        /**
         * nama model untuk di baca
         */
        modelName : string ; 


        /** 
         * filter data
        */
        where ?  : any ; 

        /**
         * model di include dalam search
         */
        includeModels ? : IncludeModelParam[] ; 



        /**
         * param loookup untuk data berupa list. data akan di cari berdasarkan dalam data list
         */
        lookupParams ? : LookupRequestForLookupOnListDataParam[]; 

    }


    /**
     * parameter untuk request dengan data packed, list + single data di request dengan 1 parameter 
     */
    export interface MixedDataQueryRequestParam {
        /**
         * parameter single result data
         * key : indexer data. predefined oleh developer untuk trigger
         * value : parameter query
         */
        singleDataParameters : {[id:string] : SingleDataQueryRequestParam} ; 



        /**
         * parameter untuk data dengan hasil list
         * 
         */
        listDataParameters : {[id:string] : ListDataQueryRequestParam}; 


    }


    /**
     * hasil query multiple
     */
    export interface MixedDataQueryRequestParamResult {

        /**
         * data tunggal
         */
        singleDataResult : {[id:string ] : any} ; 

        /**
         * hasil data berupa array 
         */
        arrayDataResult : {[id:string] : any[]}; 

        /**
         * data lookups, baik dari parameter lookup, ataupun dari list + single data
         */
        lookups : {[id:string] : CommonCommunicationData.CommonLookupValue}
    }



    
    /**
    * param untuk sorting
    */
    export interface SortParam {


        /**
        * nama field untuk js
        */
        fieldName: string;


        /**
         * flag asc
         */
        asc: boolean;

    }

    /**
    * param untuk sorting
    */
    export interface SortParamAssociated extends SortParam {

        /**
         * mana model untuk join
         */
        modelName : string ; 

        /**
         * as untuk join
         */
        as? : string ; 

    }




    /**
    * parameter untuk grid data request
    */
    export interface GridDataRequest {


        /**
        * nama model untuk di baca(table apa)
        */
        modelName: string; 

        /**
        * page berapa yang akan di baca
        */
        page: number;

        /**
        * ukuran page di baca
        */
        pageSize: number; 

        /**
        * association apa saja yang di sertakan ( join)
        */
        includeModels : CommonCommunicationData.IncludeModelParam[]; 



        /**
        * where untuk query 
        */
        where?: any;

        /**
        * param untuk sort
        */
        sorts?: SortParam[]; 

        /**
        * kalau di perlukan model lookup 
        */
        lookupParams ?: CommonCommunicationData.LookupRequestForLookupOnListDataParam[]; 
        /**
        * kalau ada field yang di include, atau di hapus. ini demi optimasi grid
        */
        includeExcludeFieldParams?: {
            /**
            * field-field yang di proses
            */
            fields: string[]; 
            /**
            * true = di pergunakan exclude, dan sebaliknya
            */
            useExclude: boolean; 
        }
    }



    /**
    * grid dengan paging support
    */
    export interface GridDataRequestResponse<DATA> extends PagedDataQueryResult<DATA> {
        /**
         * data lookup dari grid
         */
        lookupsData: { [id: string]: CommonLookupValue[] };
    }


    /**
     * parameter untuk lookup param ke table lookup, ini untuk data bertipe list. jadinya bisa di sertakan lookup bersama data list. 
     * ini untuk di pergunakan misal dalam grid, yang refer ke tmp lain
     */
    export interface LookupRequestForLookupOnListDataParam {
        /**
         * nama field, field mana yang refer ke lookup
         */
        fieldName : string ; 
        /**
         * kode lookup, refer ke table m_lookup_header
         */
        lookupCode : string ; 
    }
    /**
     * data lookup response
     */
    export interface LookupRequestResultWrapper {
        
        
        /**
         * ID dari lookup
         */
        loookupId : string ; 
        /**
         * flag data masih up-todate atau tidak
         */
        stillUptodate : boolean ; 
        
        /**
         * data lookup. di isi kalau stillUptodate = false
         */
        lookupData? : CommonLookupHeader ; 
    }
    
    
    
    /**
     * wrapper result search param. ini  untuk di inject ke dalam search form
     */
    export interface SimpleWrappedSearchParam {
        /**
         * where param 
         */
        where ?: any , 
        /**
         * order by
         */
        order ? : string[][] ; 
        /**
         * include param. kalau ada keperluan 
         */
        includeModels? : IncludeModelParam[] ;
        
    }
    
    /**
     * wrapper utnuk edit data
     */
    export interface EditDataWrapper<M> {
        
        
        /**
         * token untuk edit 
         */
        editDataToken? : string 

        /**
         * data item yang di edit
         */
        editedData? : M ;
        /**
         * data lookups. ini sesuai dengan parameter edit
         */
        lookups? : LookupRequestResultWrapper[] ;

    }
    
    /**
         * param report request dari client
         */
        export interface ClientReportRequestHeader {
           
            /**
            * Kode dari report
            * column : report_code*/
            reportCode? :string;
            
             /**
             * nama file untuk download
             * column : file_name
             */
            fileName? : string ; 
           
            /**
            * format report, pdf, excel atau ms word
            * column : report_format*/
            reportFormat? :string;
            
            /**
             * parameters dari report
             */
            parameters ? : ClientReportRequestDetail[]
            

        }
    
      /**
         * param detail report, cross check ke jasper file
         */
        export interface ClientReportRequestDetail  {
            
            /**
            * nama parameter dalam report
            * column : param_name*/
            paramName? :string;
            /**
            * tipe data, kalau ada[], berarti array
            * column : param_type*/
            paramType? :string;
            /**
            * parameter value, versi string
            * column : param_value*/
            paramValue? :string;

        }

    /**
     * request data terpaging
      */    
    export interface PagedDataRequest<DATA> {

        /**
         * nama model untuk di baca
         */
        modelName : string ;
        /**
         * page yang akan di baca
         */
        page  : number; 

        /**
         * ukuran page per pembacaan
         */
        pageSize   : number ; 

        /**
         * where untuk data
         */
        where ? : any ; 

        /**
         * ini di kirim kembali pada saat query page berikutnya 
         */
        latestCount ? : number ; 
         /**
         * hapus audit trail atau tidak
         */
        eraseAuditTrail?: boolean ; 
        /**
         * field-field yang tidak di sertakan dalam data. versi ini akan  menghapus field-field yang tidak di sertakan
         */
        excludedFields ? : string[] ; 

        /**
         * field di include. ini di pergunakan. ini kalau membatasi field-field mana saja yang di ambil dari server. kalau perlu pembatasan field 
         */
        includedFields ? : string []; 

        /**
         * orders dalam data
         */
        orders ? : Array<string[]>|Array<SortParamAssociated> ;


        /**
         * include model params
         */
        includeModels? : IncludeModelParam[] ; 


        /**
         * kalau ada field yang merupakan lookup ke tmp lain, maka di sertakan di sini. ini menyertakan nama field + lookup id. nama field bisa nested
         */
        lookupFields? : LookupRequestForLookupOnListDataParam[] ; 

    }



    /**
     * request data terpaging
      */    
    export interface PagedDataRequestResult<DATA>{

        /**
         * row data di baca
         */
        rows : DATA [] ; 

         /**
         * total data yang tersedia
         */
        count ? : number ; 

        /**
         * data lookups. di cari berdasarkan data yang di request. item-item yang match saja yang di kirimkan
         */
        lookups : {[id:string] : CommonLookupValue[] } ; 
    }


    /**
    * container untuk modifikasi data dengan model bulk. ini di pergunakan dalam proses modifikasi dengan bulk
    */
    export interface BulkDataModificationContainer<DATA, ID> {


        /**
        * data yang baru di tambahkan. ini untuk di insert ke dalam database
        */
        appendedItems: DATA[];


        /**
        * data item-item yang di modifikasi
        */
        modifiedItems: DATA[];

        /**
        * id dari item-item yang di hapus
        */
        erasedItems: ID[];

    }

    
    /**
     * untuk panjang dari satu field
     */
    export interface DbFieldMaxLength {

        /**
         * nama field yang di cek panjang nya
         */
        name : string ; 

        /**
         * panjang maksimal dari karakter
         */
        length : number ;

    }


    /**
     * definisi dari lebar field dalam 1 model . 
     */
    export interface ModelFieldLength {

        /**
         * nama model untuk 1 kelompok definsi field
         */
        modelName : string ; 

        /**
         * length dari masing-masih data
         */
        fields : DbFieldMaxLength[] ; 
    }



    /**
     * nama locale
     */
    export interface LocaleDefinition {

        /**
         * nama locale 
         */
        code ? : string ; 

        /**
         * nama dari locale
         */
        name ? : string ; 


        /**
         * tousand separator
         */
        dotForThousandSeparator ? : 'Y'|'N'  ; 

        /**
         * date pattern
         */
        dateFormatPattern ? : string ; 

        /**
         * format jam menit second
         */
        timePattern ? : string ; 


        /**
         * urutan dari data
         */
        sequenceNo ? : number ; 
    }



    /**
     * table : ct_i18n_text_group. 
     * kelompok i18n
     */
    export interface I18nTextGroup {

        /**
         * column : group_code
         * kode group label
         */
        code ? : string ; 
        /**
         * keterangan
         */
        description ? : string ; 
    }


    /**
     * table : ct_i18n_text
     * katalog i18n
     */
    export interface I18nText {
        /**
         * id internal data
         * column : id 
         */
        id ? : number ; 

        /**
         * key dari label
         * column : text_key
         */
        key ? : string ; 
        /**
         * group dari internalization text
         * column : group_code
         */
        groupCode ? : string ; 


        /**
         * kode bahasa,misal : en
         * column :  locale
         */
        localeCode? : string ; 

        /**
         * label bahasa
         * column : label
         */
        text ? : string ; 
    }



}


/**
     * param untuk menerima token
     */
    export interface LookupWithTokenResponse {
        
                /**
                 * data lookups
                 */
                lookups : {[id: string ] : CommonCommunicationData.CommonLookupValue[]} ; 
        
                /**
                 * token untuk submit data
                 */
                token : string ; 
            } 
        
            /**
             * param untuk menerima token
             */
            export interface LookupWithToken {
                /**
                 * nama model object
                 */
                modelName? : string ;
        
        
        
                /**
                 * id dari yang hendak di edit
                 */
                dataIdAsString? : string ;
        
        
        
                /**
                 * id dari lookup yang di minta 
                 */
                lookupIds? : string []; 
        
        
                /**
                 * token yang di terima
                 */
                onTokenAccepted ?: (token : string ) => any ;
        
        
        
                /**
                 * handler pada saat data di terima
                 */
                onLookupAccepted   : (indexedLookup: { [id: string]: CommonCommunicationData.CommonLookupValue[] }) => any ;
        
            }