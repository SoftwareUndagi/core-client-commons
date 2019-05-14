/**
 * interface close editor. karena close editor pekerjaan nya bukan cuma menutup diri sendiri.
 * show panel sebelumn nya dll
 */
export interface CloseEditorCommand {
    (): any ;
}
/**
 * close command versi async
 */
export interface CloseEditorCommandAsync {
    (): Promise<any> ;
}

/**
 * hak editor,
 * <ol>
 * <li>add</li>
 * <li>edit</li>
 * <li>delete</li>
 * </ol>
 */
export interface EditDataPrivilage {
    /**
     * flag utnuk ijinkan add data
     */
    allowAdd: boolean;
    /**
     * flag untuk ijinkan edit
     */
    allowEdit: boolean;
    /**
     * flag untuk ijinkan edit
     */
    allowDelete: boolean;
}
/**
 * handler pada saat edit complete. biasanya ini akan reload grid
 */
export interface EditingDataCompleteHandler<DATA> {
    (data: DATA): any ;
}
/**
 * task tambahan after edit
 */
export interface AdditionalEditorTask <DATA> {
    /**
     * handler on edit
     * @param data data yang di edit
     */
    (data: DATA): void  ;
}
/**
 * holder ajax request
 */
export interface CommonsAjaxResultHolder {
    /**
     * ada error atau tidak
     */
    haveError: boolean ;
    /**
     * error code
     */
    erorrCode ?: string ;
    /**
     * message dari server
     */
    errorMessage ?: string ;
}
export interface EditorSubcomponentInterface <DATA> {
    
    /**
     * assign data ke dalam sub editor
     * @param additionalDataContainer penampung data pada sub. kalau misal data tidak bisa di muat pada dat autama, maka akan di masukan dalam hash map
     */
    assignData (data: DATA  , editorState: string  , additionalDataContainer: {[id: string]: any } ): void   ; 
    /**
     * task tambahan pada saat di assign 
     */
    additionalTaskOnDataAssigned(data: DATA  , editorState: string , additionalDataContainer: {[id: string]: any }): void  ;
}