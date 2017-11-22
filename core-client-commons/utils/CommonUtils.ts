/**
 * check apakah object null atau tidak
 */
export function isNull (variable : any ) : boolean {
    return  ( variable == null || typeof variable =='undefined') ; 
}



/**
 * glue method, clone object, hanya di level 1 saja. bukan deep clone
 * @param variable variable untuk di clone
 */
export function cloneObject (variable : any  ) : any {
    if  ( isNull(variable)) {
        return null ; 
    }
    return Object.assign( {} , variable) ;
}



/**
 * clone object dengan recursive clone. hanya salin object sederhana
 * @param variable variable untuk di salin
 */
export function deepCloneObject (  variable : any ) : any {
    if ( isNull(variable)) {
        return null ; 
    }
    let rtvl : any =  {} ; 
    let keys : string [] = Object.keys(variable) ; 
    __deepCloneWorkerRecursive( variable , rtvl , false  ); 
    return rtvl ; 
}

/**
 * insert data baru ke dalam index tertentu
 * @param theArray array yang akan di insert kan data
 * @param newData data baru untuk di insert
 * @param index index baru untuk data
 */
export function insertAtArray(theArray: any[], newData: any, index: number): any  {
    if (index >= theArray.length - 1) {
        theArray.push(newData);
        return;
    }

    let blk: any[] = theArray.splice(index, theArray.length - 1);
    theArray.push(newData);
    theArray.push(...blk);
} 


/**
 * recursive clone dengan rubah current date menjadi string
 * @param currentData data current level
 * @param destination variable penampung
 * @param convertDateToIso convert date menjadi iso string atau bukan
 */
export function __deepCloneWorkerRecursive ( currentData : any , destination : any , convertDateToIso ?  : boolean  ) : any {
    let d : Date ; 
    
    let keys : string[] =  Object.keys(currentData)  ; 
    for ( let k of keys ) {
        let val : any = currentData[k] ; 
        if ( isNull(val)) {
            continue ; 
        }
        else if ( Array.isArray(val)) {
            let dstArr : any [] = []
            destination[k] = dstArr ; 
            let arrData : any [] = val ; 
            for ( let r of arrData) {
                if ( isNull(r)) {
                    dstArr.push(null);
                }
                else if ( ['number' , 'string'].indexOf(typeof r) >= 0){
                    dstArr.push(r);
                }
                else if (   r.getDate!== null && typeof r.getDate ==='function' ){
                    let valDt : any = r ; 
                    if (!( !isNull(convertDateToIso) || !convertDateToIso)) {
                        valDt =  makeIsoDate(r) ; 
                    } 
                    dstArr.push( makeIsoDate(r) );
                }
                else {
                    let rBaru : any = {} ; 
                    __deepCloneWorkerRecursive(r , rBaru);
                    dstArr.push(rBaru);
                }

            }
        }
        else if ( ['number' , 'string'].indexOf(typeof val)>=0){
            destination[k] = val ; 
        }
        else if (   val.getDate!== null && typeof val.getDate ==='function' ) {
            if ( !isNull(convertDateToIso) || !convertDateToIso) {
                destination[k] = val; 
            }else{
                destination[k] = makeIsoDate(val) ; 
            }
            
        }
        else {
            destination[k]  = {} ; 
            __deepCloneWorkerRecursive( val , destination[k]);
        }

    }
} 

/**
 * membuat string 0 leaded kalau misal kurang dari 10
 * @param n number untuk di buat zero leaded string
 */
export function makeZeroLeadedString (n : number )  : string{
    if ( isNull(n)) {
        return null ; 
    }
    if ( n>9) {
        return '0' + n ; 
    }
    return n +'' ; 
}




/**
 * konversi dari tanggal ke iso date
 * @param date 
 */
export function makeIsoDate (date : Date ) : string {
    if ( isNull(date)) {
        return null ; 
    }
    let s : string = date.getFullYear() + '-' + makeZeroLeadedString( date.getMonth() + 1) + '-' + makeZeroLeadedString(date.getDate()) ; 
    return s ;      
} 
