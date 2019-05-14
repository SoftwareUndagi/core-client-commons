
import { CustomValidationFailureResult } from './CommonsInputElement';

/**
 * untuk di pergunakan dengan notif. semacam ini : 
 * &lt;div class="{{css}}"&gt;
 * &lt;button type="button" class="close" data-dismiss="alert"&gt;
 *    &lt;i class="ace-icon fa fa-times"&gt;&lt;/i&gt;
 * &lt;/button&gt;&lt;/div&gt;
 */
export interface ReactEditorBannerMessage {
    /**
     * tipe banner
     */
    type: 'error'|'warning'|'info';
    /**
     * title , untuk di bold
     */
    title ?: string |JSX.Element ; 
    /**
     * notifikasi
     */
    message: string |JSX.Element ; 
    /**
     * raw error 
     */
    rawError ?: CustomValidationFailureResult ; 
}