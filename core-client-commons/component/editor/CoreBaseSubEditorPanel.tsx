
import { ListOfValueManager } from '../ListOfValueManager';
import { CommonCommunicationData  } from '../../shared/index';
import { EditorInputElement, CustomValidationFailureResult } from './CommonsInputElement';
import { ReactEditorBannerMessage  } from './EditorComponent'; 
import { isNull } from '../../utils/CommonUtils';
import { BaseComponent , BaseComponentProps , BaseComponentState } from '../BaseComponent';

export interface CoreBaseSubEditorPanelState<DATA> extends BaseComponentState {

    /**
     * data untuk di edit. misal kalau di perlukan akses langsung 
     */
    editedData: DATA ; 

    /**
     * array of input element. apa saja yang di miliki oleh editor
     */
    inputElements ?: EditorInputElement[]  ;    
}
export interface CoreBaseSubEditorPanelProps extends BaseComponentProps {
    /**
     * lookup manager
     */
    lookupManager: ListOfValueManager ;
    /**
     * container lookup data. ini di ambil dari state induk dari editor
     */
    lookupContainers: {[id: string ]: CommonCommunicationData.CommonLookupValue[] } ; 
    /**
     * worker untuk register ke parent editor
     */
    registerToParentEditorMethod: (  editor: CoreBaseSubEditorPanel<any , any , any > , unRegister ?: boolean ) => any ;
    /**
     * nama variable. untuk di register di parent
     */
    variableName ?: string ;  
    /**
     * register variable ke parent
     */
    registerVariableMethod ?: (variableName: string , input: any ) => any ;

    /**
     * state dari editor
     */
    editorState: string ; 
    /** 
     * fetch  data for edit
     */
    getVariableToEditFromParentData ?: (data: any) => any;
}

/**
 * base sub editor
 */
export abstract class CoreBaseSubEditorPanel<DATA , PROPS extends CoreBaseSubEditorPanelProps, STATE extends CoreBaseSubEditorPanelState<DATA> > extends BaseComponent<PROPS , STATE> {
    /**
     * worker untuk unreg input panel
     */
    registrarInputElement: (inputElement: any , unRegFlag?: boolean ) => any ;
    
    /**
     * register variable ke parent
     */
    registerVariableMethod: (variableName: string , input: any ) => any ;

    /**
     * default worker untuk assign loookup. ini akan otomatis menaruh data ke dalam state
     */
    assignLookupData:  (lookupId: string , lookupData: CommonCommunicationData.CommonLookupValue[] ) => any ; 

    constructor(props: PROPS) {
        super(props) ; 
        let swapState: any = this.generateDefaultState() ;  
        this.state = swapState ;
        swapState.inputElements = [];
        let empty: any = {} ; 
        swapState.editedData = empty ;
        this.registrarInputElement = ( inputElement: EditorInputElement , unRegFlag: boolean ) => {
            unRegFlag = unRegFlag || false ;
            if ( unRegFlag) {
                let idx: number = swapState.inputElements.indexOf(inputElement); 
                if ( idx > -1) {
                    swapState.inputElements.splice(idx , 1 ) ; 
                }
            } else {
                swapState.inputElements.push(inputElement); 
            }
        };
        this.registerVariableMethod = (variableName: string , input: any ) => {
            this[variableName] = input; 
        };
        props.registerToParentEditorMethod(this , false ) ;
        if ( !isNull(props.variableName ) && !isNull(props.registerVariableMethod)) {
            this.props.registerVariableMethod!(props.variableName! , this ) ; 
        }
    }
    
    /**
     * validasi mandatory field custom
     */
    validateMandatoryField (): CustomValidationFailureResult[]   {
        let rtvl: CustomValidationFailureResult[] = [] ; 
        if ( isNull(this.state.inputElements) || this.state.inputElements!.length === 0 ) {
            return rtvl; 
        }
        for ( let inp of this.state.inputElements!) {
            let mndtoryHaveError: boolean = false ; 
            if ( !isNull( inp['runMandatoryValidation']) ) {
                let swapHasil: CustomValidationFailureResult = inp['runMandatoryValidation'](); 
                if ( !isNull(swapHasil) ) {
                    rtvl.push(swapHasil); 
                    mndtoryHaveError = true ; 
                }
            }
            if ( !mndtoryHaveError) {
                if ( !isNull(inp['runCustomValidation']) && typeof inp['runCustomValidation'] === 'function') {
                    let swapHasil: any =  inp['runCustomValidation']() ; 
                    if ( !isNull(swapHasil)) {
                        if ( Array.isArray(swapHasil)) {
                            rtvl.push(...swapHasil) ; 
                        } else {
                            rtvl.push(swapHasil) ; 
                        }
                    }
                }
            }
        }
        if ( rtvl.length === 0 ) {
            let s: any = null ; 
            return s  ; 
        }
        return rtvl ; 
    }
    /**
     * assign data ke control
     */
    assignDataToControl  (data: DATA , updateState ?: boolean ) {
        console.log('[CoreBaseSubEditorPanel] assign data ke sub editor : ' , data) ; 
        this.additionalTaskBeforeRenderData(data); 
        for ( let ctrl of this.state.inputElements!) {
            ctrl.assignDataToControl(this.state.editedData) ;
        }
        this.additionalTaskAfterRenderData(data);
        if (!( !isNull(updateState) && !updateState) ) {
            this.setStateHelper (st => st.editedData = this.getVariableToEditFromParentData( data));
        } else {
            let swapData: any = this.state ; 
            swapData.editedData = this.getVariableToEditFromParentData( data);
        }
    }  
    /**
     * di panggil sebelum render data
     */
    additionalTaskBeforeRenderData (data: DATA ) {
        //
    }

    /**
     * additional task saat selesai render data
     */
    additionalTaskAfterRenderData (data: DATA ) {
        //
    }
    /**
     * nama model default untuk di proses dalam sub editor. ini di pergunakan sebagi default value untuk membaca metadata table. cek method <i>getColMaxLength</i>
     */
    abstract getDefaultModelName (): string ; 
    /**
     * ini di pergunakan untuk menaruh max length dalam textbox.<br/>
     * misal table sec_user field : username di database panjang = 128.<br/>
     * <ol> 
     * <li>nama model sequelize : ApplicationUserSimple </li>
     * <li>nama field sequelize : userName </li>
     * </ol>
     * di akses dengan : this.getColMaxLength('userName' , 'ApplicationUserSimple')<br/>
     * argument ke 2 sifat nya optional. kalau tidak di sediakan, akan di baca dari method
     * @param fieldName nama field js untuk di baca metadata
     * @param modelName nama model dair object penyimpanan data. ini optional.di sediakan default untuk item ini
     */
    getColMaxLength (fieldName: string , modelName?: string ): number {
        console.warn('method getColMaxLength masih berupa dummy. silakan di cek kembali');
        // FIXME ini masih belum dengan method real
        return 1024  ; 
    }

    /**
     * ini di pergunakan kalau misal sub editor tidak edit data dari data utama. misal sub field.<br/> 
     * contoh struktur : { nama : 'gede' , alamat : { jalan : 'jln 1' , telf : '081111}}<br/>
     * misal sub editor edit data <i>alamat</i><br/>
     * Maka proses ini akan return : dataFromParent.alamat
     */
    getVariableToEditFromParentData ( dataFromParent: any ): any {
        if (!isNull(this.props.getVariableToEditFromParentData)) {
            return this.props.getVariableToEditFromParentData!(dataFromParent);
        }
        return dataFromParent ; 
    }
    /**
     * membaca data dari control
     */
    fetchDataFromControl (data: any ) {
        let targetData: any = this.getVariableToEditFromParentData( data) ; 
        if ( !isNull(this.state.inputElements) && this.state.inputElements!.length > 0 ) {
            for ( let ctrl of this.state.inputElements!) {
                ctrl.fetchDataFromControl(targetData) ;
            }
        }
        
    }  
    componentWillUnmount() {
        this.props.registerToParentEditorMethod(this , true ) ; 
        if ( !isNull(this.props.variableName ) && !isNull(this.props.registerVariableMethod)) {
            this.props.registerVariableMethod!(this.props.variableName! , null ) ; 
        }
    }
    /**
     * run validasi tambahan dalam proses add
     */
    runAdditionalSaveAddValidation ( erorrMessageContainer: ReactEditorBannerMessage[] ): boolean {
        return true ;
    } 
    /**
     * untuk proses edit
     */
    runAdditionalSaveEditValidation ( erorrMessageContainer: ReactEditorBannerMessage[] ): boolean {
        return true ;
    } 

    /**
     * state default
     */
    abstract generateDefaultState (): STATE ; 

    /**
     * getter ke lookup manager
     */
    get lookupManager (): ListOfValueManager {
        return this.props.lookupManager  ; 
    } 
}