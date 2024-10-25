
import { IBitlyListItem } from "./IBitlyListItem";
import { IBitlyResponse } from "./IBitlyResponse";

export interface IBitlyItemPanel {
    isOpen: boolean;
    onSave: (linkInfo: IBitlyListItem) => IBitlyResponse;
    onClose: () => void;
    onDismiss: (ev?: React.KeyboardEvent<HTMLElement> | KeyboardEvent) => void;
    bitlyItem?: IBitlyListItem|undefined;
}