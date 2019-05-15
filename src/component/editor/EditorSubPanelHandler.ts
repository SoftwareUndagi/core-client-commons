
/**
     * interface untuk editor sub panel
     */
export interface EditorSubPanelHandler<DATA> {
    /**
     * task tambahan dalam proses delete data
     */
    additionalTaskOnDelete(data: DATA): void;
    /**
     * task tambahan pada saat init edit data
     */
    additionalTaskOnEdit(data: DATA): void;
    /**
     * task tambahan dalam proses add new data
     */
    additionalTaskOnAdd(data: DATA): void;
    /**
     * task tambahan dalam proses view
     */
    additionalTaskOnView(data: DATA): void;
}