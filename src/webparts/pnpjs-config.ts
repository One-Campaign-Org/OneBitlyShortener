import { WebPartContext } from "@microsoft/sp-webpart-base";

import { spfi, SPFI, SPFx } from "@pnp/sp";
import { LogLevel, PnPLogging } from "@pnp/logging";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/batching";
import { Caching } from "@pnp/queryable";
import { getHashCode, dateAdd } from "@pnp/core";

let _sp: SPFI | undefined = undefined;

export const getSP = (context?: WebPartContext): SPFI | undefined => {
    if(context !== undefined) {
        // set the console log level output
        const expireFunc: Date | undefined = dateAdd(new Date(), "minute", 1);
        if(expireFunc !== undefined) {
            _sp = spfi().using(SPFx(context))
            .using(PnPLogging(LogLevel.Warning))
            .using(Caching({
                store: "local",
                keyFactory:  (url): string => getHashCode(url.toLocaleLowerCase()).toString(),
                expireFunc: (url: string): Date => expireFunc,
            }));
        }
    }
    return _sp;
}


