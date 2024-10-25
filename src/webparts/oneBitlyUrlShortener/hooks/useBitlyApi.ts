import { useState, useEffect } from "react";

export interface IUseBitlyApiProps {
    apiToken: string,
    hyperlink: string,
    title?: string
}

export default function useBitlyApi({ apiToken, hyperlink }: IUseBitlyApiProps): string {
    const [shortLink, setShortLink] = useState<string>("");

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            console.log("fetching items");
            const response = await window.fetch("https://api-ssl.bitly.com/v4/shorten", {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${apiToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                    {
                    "long_url": hyperlink,
                    "domain": "go.one.org",
                    "group_guid": "B9bafsbR0st"
                    }
                )
            });
            
            //    
            const data = await response.json();
            
            //
            if(response.ok) {
                if (data !== undefined){
                    console.log(JSON.stringify(data));
                    setShortLink(JSON.stringify(data));
                    return data;
                }
                else {
                    return Promise.reject(new Error("The response from the API is undefined"));
                }
            }    
        }            
        fetchData().catch(console.error);

        return (() => {
            console.log("useBitlyApi end");
        });
    }, []);

    return shortLink;
}
