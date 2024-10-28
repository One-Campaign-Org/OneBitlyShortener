import { IBitlyListItem } from "./IBitlyListItem";
import { IDropDownItem } from "./IDropDownItem";

export interface IOneHyperlinkPanelProps {
    item?: IBitlyListItem,
    apiToken: string,
    createdBy: string,
    utmCampaignValues: IDropDownItem[],
    utmSourceValues: IDropDownItem[],
    utmMediumValues: IDropDownItem[],
    onSave: (item: IBitlyListItem) => void;  // only sued to update the detail list
    onClose: () => void;
}