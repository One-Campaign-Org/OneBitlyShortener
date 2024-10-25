import { IBitlyListItem } from "./IBitlyListItem";

export interface IOneHyperlinkPanelProps {
    item?: IBitlyListItem,
    apiToken: string,
    createdBy: string,
    onSave: (item: IBitlyListItem) => void;  // only sued to update the detail list
    onClose: () => void;
}