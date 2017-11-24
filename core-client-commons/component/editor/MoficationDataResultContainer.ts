import { isNull } from '../../utils/CommonUtils';
import { CommonCommunicationData } from '../../shared/index';



/**
	 * container modifikasi data
	 */
export interface MoficationDataResultContainer<DATA> {
    /**
     * item-item yang baru di buat
     */
    addedItems?: DATA[];
    /**
     * item2 yang di hapus
     */
    erasedItems?: DATA[];
    /**
     * item yang di modif
      */
    modifiedItems?: DATA[];
}
