
import { isNull } from './CommonUtils'; 

/**
 * object utils. untuk maipulasi object , constructor dlll
 */
export class ObjectUtils{
    
    




    /**
     * salin hanya primitive fields dari source kedest
     * @param source sumber kopi data
     * @param destination tujuan kemana kopi data
     */
    static copyOnlyPrimitiveFields  ( source : any  , destination : any ) {
        if ( source== null || typeof source ==='undefined') {
            return ; 
        }
        if ( destination== null || typeof destination ==='undefined') {
            return ; 
        }
        let keys : string[] =  Object.keys(source) ; 
        for ( let k of keys) {
            let val : any = source[k]; 
            if ( isNull(val)) {
                destination[k]  = null ; 
                continue; 
            }
            if ( Array.isArray(val) || typeof val =='string' || typeof val =='number') {
                destination[k]  =val ; 
                continue; 
            }else {
                let d : Date = null ; 
                if ( !isNull(val.getDate)) {
                    destination[k]  =val ; 
                    continue; 
                }
                if ( isNull(destination[k]) ) {
                    destination[k]= {} ; 
                }
                ObjectUtils.copyOnlyPrimitiveFields(val , destination[k]);
            }
        }
    }


    /**
     * salin data dari source ke dest
     */
    static copyField (source : any , destination : any , excludedFields? :any[]) {
        if ( source== null || typeof source ==='undefined') {
            return ; 
        }
        if ( destination== null || typeof destination ==='undefined') {
            return ; 
        }
        if ( excludedFields == null || typeof excludedFields==='undefined'){
            excludedFields=[]; 
        }
        let allFields : string[] = Object.keys(source); 
        for ( let k of allFields) {
            if (excludedFields.indexOf(k)>=0){
                continue ; 
            }
            destination[k] = source[k];
        }
    }


    /**
     * pencari dengan fungsi dedicated
     * return -1 untuk tidak ketemu
     * @param data data untuk di cek
     * @param checker  fungsi pengecek data
     * 
     */
    static findIndexOnArray ( data : any[] , checker : (data : any )=> boolean ) : number {
        if ( isNull(data)){
            return -1 
        }
        let i : number = 0 ; 
        for ( let d of data ) {
            if ( checker ( d)){
                return i ; 
            }
            i++ ; 
        }
        return -1 ; 
    }


    /**
     * compare 2 object , field by field
     */
    static compareFields ( data1 : any , data2 : any , skipedFields : string[] ) : boolean  {
        let keys : string[] = Object.keys(data1);
        let actCompare : string[] = isNull(skipedFields)? [] : skipedFields ; 
        for ( let k of keys ) {
            if ( data1[k]!= data2[k]){
                return false ;
            }
        }
        return true ;
    }

    /**
     * compare antara 2 array field by field
     * return : true kalau data1 <strong> sama</strong> data2
     */
    static compareFieldsArray ( data1 : any[] , data2: any[]  ,skipedFields : string[] ) : boolean {
        if ( isNull(data1) && isNull(data2)) {
            return true ; 
        }
        if ( (isNull(data1) && !isNull(data2) ) || (!isNull(data1) && isNull(data2) )  ) {
            return false ; 
        }
        if (! ObjectUtils.hiLevelArrayCompare(data1 , data2 )){
            return false ; 
        }
        let ln : number = data1.length ; 
        for (let idx = 0 ; idx< ln ; idx++) {
            if ( !ObjectUtils.compareFields( data1[idx] , data2[idx] , skipedFields)){
                return false ;
            }
        }
        return true ; 
    }


    /**
     * compare kalau dimensi array beda
     * return : true kalau data1 <strong>tidak sama</strong> data2
     */
    static hiLevelArrayCompare ( data1 : any[] , data2: any[]    ) : boolean  {
         if ( (isNull(data1) && !isNull(data2) ) ||  (!isNull(data1) && isNull(data2) )  ){
            return false ; 
        }
        if ( isNull(data1) && isNull(data2)){
            return true ;
        }
        if ( isNull(data1) && isNull(data2)) {
            return true ; 
        }
        if ( data1.length!= data2.length){
            return false ;
        }
        return true ; 
    }
    
} 