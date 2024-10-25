
export interface IBitlyListItem {
    key: string;
    sourceUrl: string;
    createdBy: string;
    medium: string;
    source: string;
    campaign: string;
    term: string;
    content: string;
    shortUrl: string;
    successStatus?: boolean;
    errorMessage?: string;
}