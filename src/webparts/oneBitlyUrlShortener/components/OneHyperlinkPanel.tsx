import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { IBitlyListItem, IOneHyperlinkPanelProps } from "../interfaces";
import * as strings from 'OneBitlyUrlShortenerWebPartStrings';
import { 
    DefaultButton, 
    PrimaryButton,
    TextField,
    Stack, 
    IStackProps,
    MessageBar,
    MessageBarType,
    StackItem,
    TooltipHost,
    Link
  } from '@fluentui/react';
import { Copy16Filled } from "@fluentui/react-icons";
import styles from './OneBitlyUrlShortener.module.scss';
import { QRCodeCanvas } from "qrcode.react";
import { v4 as uuid } from "uuid";
import { getSP } from '../../pnpjs-config';

const SHAREPOINT_LIST_NAME = "Bitly List";

// ====================================================================

export interface IBitlyResponse {
    id: string,
    link: string,
    long_url: string
}

const SAVE_BUTTON_LABEL = "Save";
const SAVING_BUTTON_LABEL = "Saving...";

const buttonStyles = { root: { marginRight: 8 } };

const columnProps: Partial<IStackProps> = {
  tokens: { childrenGap: 15 },
  styles: { root: { width: 300 } },
};

/* eslint-disable no-useless-escape */
function isValidUrl(sourceUrl: string): boolean {
    const regEx = /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&=]*)/ig;
    return regEx.test(sourceUrl);
}
/* eslint-enable no-useless-escape */

function downloadStringAsFile(data: string, filename: string):void {
    const a = document.createElement('a');
    a.download = filename;
    a.href = data;
    a.click();
}

function appendQueryStringParam(source: string, keyName: string, keyValue: string): string {
    if (keyValue.length === 0) return "";

    return ((source.length > 0 && source[source.length-1] === '?') ? "" : "&") +
                    `${keyName}=${encodeURIComponent(keyValue)}`;
}

function generateGuid(): string {
    return uuid();
}

function createFormattedUrl(item: IBitlyListItem): string {
    
    const prefix: string = (item.sourceUrl.indexOf("https://") >= 0) ? "" : "https://";

    // save the link with bitly.  Create the complete URL first
    const completeUrl: string = `${prefix}${item.sourceUrl}`;
    
    let formattedUrl: string = completeUrl

    if(item.campaign.length > 0 ||
      item.content.length > 0 ||
      item.medium.length > 0 ||
      item.source.length > 0 ||
      item.term.length > 0) {
      
        formattedUrl += "?";
        formattedUrl += appendQueryStringParam(formattedUrl, "utm_campaign", item.campaign);
        formattedUrl += appendQueryStringParam(formattedUrl, "utm_medium", item.medium);
        formattedUrl += appendQueryStringParam(formattedUrl, "utm_source", item.source);
        formattedUrl += appendQueryStringParam(formattedUrl, "utm_term", item.term);
        formattedUrl += appendQueryStringParam(formattedUrl, "utm_content", item.content);
    }

    console.log(`Complete Url: ${formattedUrl}`);

    return formattedUrl;
}

async function generateBitlyLink (apiToken: string, hyperlink: string): Promise<string> {
    console.log(`api call: ${hyperlink}`);
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
    const data: IBitlyResponse = await response.json();
        
    //
    if(response.ok) {
        if (data !== undefined){
            console.log(data.link);            
            return data.link;
        }
        else {
            return Promise.reject(new Error("The response from the API is undefined"));
        }
    }    

    return Promise.reject(new Error("Unknown error calling the Bitly API"));
}

async function saveNewShortLinkToSharepoint(item: IBitlyListItem): Promise<boolean> {
    // assign a key - i.e.,  a unique primary key
    item.key = generateGuid();
    
    const response = await getSP()?.web.lists.getByTitle(SHAREPOINT_LIST_NAME).items.add(item);

    console.log(JSON.stringify(response));

    return (response !== undefined);
}

// ====================================================================

export default function OneHyperlinkPanel({apiToken, createdBy, item, onSave, onClose}: IOneHyperlinkPanelProps): JSX.Element {

    const qrCanvasRef = useRef<HTMLCanvasElement>();
    //
    const [copied, setCopied] = useState<boolean>(false);
    // form state
    const [canSave, setCanSave] = useState<boolean>(false);
    const [saveButtonLabel, setSaveButtonLabel] = useState<string>(SAVE_BUTTON_LABEL);
    const [sourceUrl, setSourceUrl] = useState<string>("");
    const [utmMedium, setUtmMedium] = useState<string>("");
    const [utmSource, setUtmSource] = useState<string>("");
    const [utmCampaign, setUtmCampaign] = useState<string>("");
    const [utmTerm, setUtmTerm] = useState<string>("");
    const [utmContent, setUtmContent] = useState<string>("");
    // 
    const [shortUrl, setShortUrl] = useState<string>();
    // used to present the notification message on save
    const [saveState, setSaveState] = useState<boolean|undefined>(undefined);

    // =========

    const handleDownloadQRCode = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        const node = qrCanvasRef.current;
        if (node === undefined || node === null) {
            return;
        }
        // For canvas, we just extract the image data and send that directly.
        const dataURI = node.toDataURL('image/png');

        downloadStringAsFile(dataURI, 'bitly-generated-qr-code.png');
    }

    const handleSaveClicked = (): void => {
        setCanSave(false);
        setSaveButtonLabel(SAVING_BUTTON_LABEL);

        if(isValidUrl(sourceUrl) === false) {
            setSaveState(false);
            return;
        }
        else
        {
            const createAndSave = async function (item: IBitlyListItem): Promise<string> {
                
                // create a local copy of item - we need this so that we can update the object without concurrency issues
                const localItem: IBitlyListItem = item;

                // create the URL to save to Bitly
                const completeUrl = createFormattedUrl(localItem);
                // api call to Bitly
                const shortUrl = await generateBitlyLink(apiToken, completeUrl);
                // save the short link to Sharepoint
                localItem.shortUrl = shortUrl;
                localItem.createdBy = createdBy;
                await saveNewShortLinkToSharepoint(localItem);
                // update the detail list state on the master pane
                onSave(localItem);

                return shortUrl;
            }

            //
            const item: IBitlyListItem = {
                sourceUrl: sourceUrl,
                medium: utmMedium,
                source: utmSource,
                campaign: utmCampaign,
                term: utmTerm,
                content: utmContent,
                createdBy: createdBy
            } as IBitlyListItem

            //
            createAndSave(item)
                .then((shortUrl: string) => {
                    setShortUrl(shortUrl);
                    setSaveState(true);
                 })
                .catch((error) => { 
                    console.error(error);
                    setSaveState(false);
                });
        }
        setSaveButtonLabel(SAVE_BUTTON_LABEL);
        setCanSave(true);
    }

    const handleCloseClicked = (): void => {
        onClose();
    }

    const handleHyperlinkChanged = (e: React.FormEvent<HTMLInputElement>): void => {
        const hyperlinkText: string = e.currentTarget.value;
        setSourceUrl(hyperlinkText);
        setCanSave(isValidUrl(hyperlinkText));
    } 

    const handleCopyToClipboard = (value: string): void => {
        const response = navigator.clipboard.writeText(value);
        response.then(() => {
            setCopied(true);
        })
        .catch((reason: string) => {
            console.error(reason);
            setCopied(false);
        })
    }

    // is the panel being opened for new or present an existing record?
    useEffect(():void => {
        console.log(`item: ${JSON.stringify(item)}`);

        if(item !== undefined) {
            setSourceUrl(item.sourceUrl);
            setUtmMedium(item.medium);
            setUtmSource(item.source);
            setUtmCampaign(item.campaign);
            setUtmTerm(item.term);
            setUtmContent(item.content);
            setShortUrl(item.shortUrl);
        }
        else {
            setShortUrl(undefined);
        }
    }, [item]);

    // =========

    return (
        <>
            <Stack {...columnProps}>
            {
                saveState !== undefined && saveState === true && (
                <MessageBar
                    onDismiss={onClose}
                    messageBarType={MessageBarType.success}
                    isMultiline={false}
                    dismissButtonAriaLabel="close">
                    Your shortened link has been successfully created and copied to the clipboard
                </MessageBar>
                )
            }
            {
                saveState !== undefined && saveState === false && (
                <MessageBar
                    onDismiss={onClose}
                    messageBarType={MessageBarType.blocked}
                    isMultiline={false}
                    dismissButtonAriaLabel="close"
                    truncated={true}>
                    Failed to create the short hyperlink 
                </MessageBar>
                )
            }
            {
                <StackItem>
                <form noValidate autoComplete="off" id="bitlyForm">
                    <Stack {...columnProps}>
                    {
                        (shortUrl === undefined) ? (
                        <React.Fragment>
                            <p>Complete the fields and press save to generate a new shortened hyperlink.</p>
                            <TextField name="hyperlink" label="URL" prefix="https://" required ariaLabel="Required URL hyperlink" onChange={handleHyperlinkChanged} />
                            <h3>Optional UTM Values:</h3>
                            <TextField name="utm_medium" label="Medium" onChange={(e: React.FormEvent<HTMLInputElement>) => setUtmMedium(e.currentTarget.value)} />
                            <TextField name="utm_source" label="Source" onChange={(e: React.FormEvent<HTMLInputElement>) => setUtmSource(e.currentTarget.value)} />
                            <TextField name="utm_campaign" label="Campaign" onChange={(e: React.FormEvent<HTMLInputElement>) => setUtmCampaign(e.currentTarget.value)} />
                            <TextField name="utm_term" label="Term" onChange={(e: React.FormEvent<HTMLInputElement>) => setUtmTerm(e.currentTarget.value)} />
                            <TextField name="utm_content" label="Content" onChange={(e: React.FormEvent<HTMLInputElement>) => setUtmContent(e.currentTarget.value)} />
                        </React.Fragment>
                        ) : (
                        <React.Fragment>
                            <h3>Here&apos;s your shortened URL:</h3>
                            <div>
                                <span>{shortUrl}</span>
                                <TooltipHost content={`${strings.CopyToClipboardMessage}`}>
                                    <Link onClick={(e) => handleCopyToClipboard(shortUrl)}>
                                        <Copy16Filled width={16} height={16} />
                                    </Link>
                                    { copied ? <span className={styles.textRed}>Copied!</span> : null }              
                                </TooltipHost>
                            </div>

                            <h3>QR Code</h3>
                            <QRCodeCanvas ref={qrCanvasRef} value={shortUrl} />
                            <button onClick={handleDownloadQRCode}>Download QR Code</button>
                        </React.Fragment>
                        )
                    }
                    </Stack>
                    <Stack horizontal className={styles.mt5}>
                    {
                        (shortUrl !== undefined) ? (
                        <DefaultButton onClick={handleCloseClicked}>Close</DefaultButton>
                        ) :
                        (
                        <React.Fragment>
                            <PrimaryButton onClick={handleSaveClicked} styles={buttonStyles} disabled={!canSave}>
                            {saveButtonLabel}
                            </PrimaryButton>
                            <DefaultButton onClick={handleCloseClicked}>Cancel</DefaultButton>
                        </React.Fragment>
                        )
                    }                  
                </Stack>
                </form>
                </StackItem>
            }                
            </Stack>
        </>
    )
}