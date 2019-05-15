import { CoreAjaxHelper } from './CoreAjaxHelper';
/**
 * ajax helper generator. will be supplied by html-client-commons or rn-client-commons
 */
export interface CoreAjaxHelperGeneratorFunction  {
    () : CoreAjaxHelper 
}

/**
 * utils for core client
 */
export class CoreClientUtils {
    /**
     * generator core ajax helper. filled with throw
     */
    public static ajaxHelperGenerator : CoreAjaxHelperGeneratorFunction = () => {
        throw new Error("ajax helper generator not specified")
    }
}