export * from './EditorComponentData'; 
export * from './ClientSideEditorContainer'; 
export * from './CoreBaseDirectDbDrivenEditorPanel' ; 
export * from './CoreBaseReactEditorPanel'; 
export * from './CoreBaseReactMemoryDrivenEditorPanel'; 
export * from './CoreBaseEditorSegmentPanel';
export * from './CoreBaseSubEditorPanel'; 
export * from './EditorComponent'; 
export * from './MoficationDataResultContainer'; 
export * from './CommonsInputElement'; 

/**
 * interface close editor. karena close editor pekerjaan nya bukan cuma menutup diri sendiri.
 * show panel sebelumn nya dll
 */
export interface CloseEditorCommand {
    () : any ;
}


/**
 * close command versi async
 */
export interface CloseEditorCommandAsync {
    () : Promise<any> ;
}


