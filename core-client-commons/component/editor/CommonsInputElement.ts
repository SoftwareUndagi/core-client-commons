import { CommonCommunicationData } from '../../shared/index';

/**
 * error validasi mandatory gagal
 */
export const ERROR_CODE_MANDATORY_VALIDATION_FAILED: string = 'MANDATORY_VALIDATION_FAILED';  

/**
 * default message untuk field kosong
 */
export const ERROR_MSG_MANDATORY_VALIDATION_FAILED: string = 'Field wajib (:businessFieldName) kosong, silakan di isi terlebih dahulu'; 

/**
 * i18n key untuk mandatory validation failed
 */
export const ERROR_MSG_I18N_MANDATORY_VALIDATION_FAILED: string = 'client-commons.mandatory-validation-failed' ; 

/**
 * hasil kalau custom validation failed
 */
export interface CustomValidationFailureResult {
    /**
     * nama field yang error 
     */
    fieldName: string ; 

    /**
     * nama field(secara bisnis) yang error 
     */
    businessFieldName: string ; 
    /**
     * kode dari error
     */
    erorrCode: string ; 
    /**
     * pesan error
     */
    errorMessage: string ; 
    /**
     * command untuk focus ke control
     */
    focusToCommand: () => any ; 
}
    
/**
 * custom validator . di implement pada element. mandatory akan mengambil pada props
 */
export interface CustomInputElementValidator {
    /**
     * worker untuk run custom validation ke dalam input element. kalau perlu validasi tertentu terhadap component
     * @param errorMessageContainers containers untuk error message. untuk notifikasi error 
     * @return kalau no error return null , lain return validator
     */
    runCustomValidation (   ): CustomValidationFailureResult|Array<CustomValidationFailureResult> ; 
}

/**
 * parameter untuk custom validator dalam props
 */
export interface CustomInputElementValidatorWithPropsParam  {

    /**
     * commannd untuk focus ke control
     */
    focusToControl: () => any ; 
    /**
     * nama database dari field
     */
    fieldName: string ; 
}

export interface CustomInputElementValidatorWithProps {
    /**
     * validator untuk di dalam props
     */
     ( param: CustomInputElementValidatorWithPropsParam   ): CustomValidationFailureResult|Array<CustomValidationFailureResult> ; 
}
    
/**
 * interface untuk props yang ada custom validator
 */
export interface HaveCustomValidatorInputElement {

    /**
     * untuk input element yang memiliki custom validator
     */
    customValidator ?:  CustomInputElementValidatorWithProps; 
}
    
/**
 * definisi change handler untuk control
 */
export interface SimpleValueInputChangeHandler<DATA> {
    /**
     * event yang di trigger on change pada control
     */
    (value: DATA): any ; 
}

/**
 * interface untuk element input form
 */
export interface EditorInputElement {
    /**
     * assign data ke control
     */
    assignDataToControl  (data: any , updateState ?: boolean ) ;  
    /**
     * membaca data dari control
     */
    fetchDataFromControl (data: any );  
}
/**
 * parameter mandatory field
 */
export interface CustomMandatoryFieldParm {

    /**
     * nama field bisnis dari data
     */
    bussinessFieldName: string ; 

    /**
     * message pada saat validasi gagal
     */
    validationFailMessage: string ; 
}

/**
 * untuk component yang perlu custom validation
 */
export interface CustomMandatoryValidateEnabled {

    /**
     * run mandatory validation
     */
    runMandatoryValidation (): CustomValidationFailureResult ; 
}
/**
 * checker variable null atau tidak
 */
export function isVariableNull (data: any ): boolean  {
    return data == null || typeof data === 'undefined' ; 
}

/**
 * pencari lookup dari container. di pisah untuk menghindari redundansi pengecekan
 */
export function findLookupByCode ( lookupId: string , lookupValue: string , lookupContainer: {[id: string ]: CommonCommunicationData.CommonLookupValue[]}   ): CommonCommunicationData.CommonLookupValue {
    let n: any = null ; 
    if ( isVariableNull(lookupId) || lookupId.length === 0 ) {
        return n ; 
    }
    if ( isVariableNull(lookupValue) || lookupValue.length === 0 ) {
        return n ; 
    }
    if (  isVariableNull( lookupContainer) || isVariableNull(lookupContainer[lookupId]) ) {
        return n ; 
    }

    let lks: CommonCommunicationData.CommonLookupValue[] = lookupContainer[lookupId] ; 
    for ( var lk of lks ) {
        if ( lk.detailCode === lookupValue) {
            return lk ; 
        }
    }
    return n ; 
}
