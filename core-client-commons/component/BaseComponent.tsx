import * as React from "react" ;
import { isNull , cloneObject , readNested , ObjectUtils  } from '../utils/index';

export interface BaseComponentProps {} 
export interface BaseComponentState {} 



/**
 * base class untuk component. untuk  memasukan general purpose method
 */
export abstract class BaseComponent<PROPS extends BaseComponentProps , STATE extends BaseComponentState> extends React.Component<PROPS , STATE>{

    /**
     * helper untuk update state. untuk mengurangi aktivitas clone state
     * @param updater method untuk update item-item yang berubah saja
     * @param afterSetStateTask setelah setstate selesai
     */
    setStateHelper ( updater : (clonedState : STATE )=>any , afterSetStateTask? : ()=> any  ) : any  {
        this.setState( ( prv : STATE )=>{
            let salin : STATE  = cloneObject(prv); 
            if ( isNull(salin)) {
                let s : any = {} ; 
                salin = s  ;
            }
            updater(salin);
            return salin ;
        } , afterSetStateTask); 
    }




    /**
     * versi async dari update state. agar code bisa sync
     * @param updater method untuk update state data
     */
    setStateHelperAsync (updater : (clonedState : STATE )=>any) : Promise<any> {
        return new Promise<any> ( ( accept : (n )=> any , reject : (exc)=> any )=>{
            this.setStateHelper( updater , ()=>{
                accept({}); 
            })
        }); 
    }
    


    /**
     * kalau ada 1 yang beda akan return true
     * @param fields field-field yang akan di compare
     * @param srcStateOrProp source props/state
     * @param comparedStateOrProp pembanding props/state
     */
    compareForShouldComponentUpdateStateOrProp ( fields : Array<string>  , srcStateOrProp : any , comparedStateOrProp : any ) : boolean  {
        if ( !isNull(fields) && fields.length > 0 ) {
            for ( let f of fields) {
                let srcVal : any = srcStateOrProp[f] ;
                let destVal : any = comparedStateOrProp[f]; 
                if ( f.indexOf('.')>=0){// kalau ada . berarti read nested fields
                    srcVal = readNested(srcStateOrProp , f) ; 
                    destVal =readNested(comparedStateOrProp , f) ; 
                }
                if ( Array.isArray(srcVal) || Array.isArray(destVal)) {
                    return !ObjectUtils.compareFieldsArray( srcVal , destVal , []) ; 
                }
                if ( srcVal!=destVal) {
                    return true ; 
                }
            }
        }

        return false ; 
    }

}