
/**
 * holder commons constant
 */
export class CommonClientConstant {
    
    /**
     * reference ke grid. di taruh dalam DOM. ini untuk di akses dari element lain nya. 
     * jadinya reference ke grid bisa di akses dari DOM. misal dengan cara ini : 
     * var el = document.getElementById("_grid"); 
     * var gridRef = el[BasejqGridPanel.REFERENCE_TO_SELF_KEY]; 
     * gridRef.applyFilter({name: {$like : "%gede%"}})
     */
    static REFERENCE_TO_SELF_KEY  : string ="gridReference" ;   
    
    
    
    /**
     * versi ini untuk % ada di kedua sisi 
     */
    static QUERY_OPERATOR_LIKE_BOTH ="$likeBothSide" ; 
    
    /**
     * versi ini untuk like berada di belakang saja
     */
    static QUERY_OPERATOR_LIKE_TAIL ="$likeEndOnly" ; 
    
    
    /**
     * versi ini dengan model %likedata
     */
    static QUERY_OPERATOR_LIKE_FRONT ="$likeFrontOnly" ;
    
    
}