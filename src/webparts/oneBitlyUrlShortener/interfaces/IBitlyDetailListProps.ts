
import { IBitlyListItem } from "./IBitlyListItem";

export interface IOneBitlyDetailListProps {
    items: IBitlyListItem[];
    onOpen?: (itemKey: string) => void;
}