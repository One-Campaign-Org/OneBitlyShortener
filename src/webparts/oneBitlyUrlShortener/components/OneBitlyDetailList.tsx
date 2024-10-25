import * as React from 'react';
import * as strings from 'OneBitlyUrlShortenerWebPartStrings';
import { DetailsList, DetailsListLayoutMode, SelectionMode, IColumn } from '@fluentui/react/lib/DetailsList';
import { TooltipHost } from '@fluentui/react';
import { Link } from '@fluentui/react/lib/Link';
import { mergeStyleSets } from '@fluentui/react/lib/Styling';
import { Copy16Filled } from "@fluentui/react-icons";
import { IBitlyListItem, IOneBitlyDetailListProps } from '../interfaces';
import NoBitlyLinksMessage from './NoBitlyLinksMessage';

// =============================================================================
  
export interface IBitlyDetailsListState {
    columns: IColumn[];
    items: IBitlyListItem[];
}
  
// =============================================================================

function _copyAndSort<T>(items: T[], columnKey: string, isSortedDescending?: boolean): T[] {
    const key = columnKey as keyof T;
    return items.slice(0).sort((a: T, b: T) => ((isSortedDescending ? a[key] < b[key] : a[key] > b[key]) ? 1 : -1));
}

// =============================================================================

const classNames = mergeStyleSets({
    iconHeaderIcon: {
        padding: 0,
        fontSize: '16px',
    },
    iconCell: {
        textAlign: 'center',
        selectors: {
        '&:before': {
            content: '.',
            display: 'inline-block',
            verticalAlign: 'middle',
            height: '100%',
            width: '0px',
            visibility: 'hidden',
        },
        },
    },
    iconImg: {
        verticalAlign: 'middle',
        maxHeight: '16px',
        maxWidth: '16px',
    },
    controlWrapper: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    selectionDetails: {
        marginBottom: '20px',
    },
});

// =============================================================================


export default function OneBitlyDetailList({items, onOpen}: IOneBitlyDetailListProps): JSX.Element {

    // ==================================================

    const _getKey = (item: IBitlyListItem, index?: number): string => {
        return item.key;
    }
  
    const handleItemInvoked = (item: IBitlyListItem): void => {
      if(onOpen) {
        /*
          use the key from the passed-in item to select the link from the props items list
          then send this to the panel 
        */
        onOpen(item.key);
      }
    }

    const handleCopyToClipboard = (value: string): void => {
      const response = navigator.clipboard.writeText(value);
      response.then(() => {
        console.log("copied");
      })
      .catch((reason: string) => {
        console.error(reason);
      })
    }
    
    const handleColumnClick = (ev: React.MouseEvent<HTMLElement>, column: IColumn): void => {
        const { columns, items } = this.state;
        const newColumns: IColumn[] = columns.slice();
        const currColumn: IColumn = newColumns.filter(currCol => column.key === currCol.key)[0];
        newColumns.forEach((newCol: IColumn) => {
          if (newCol === currColumn) {
            currColumn.isSortedDescending = !currColumn.isSortedDescending;
            currColumn.isSorted = true;
            this.setState({
              announcedMessage: `${currColumn.name} is sorted ${
                currColumn.isSortedDescending ? 'descending' : 'ascending'
              }`,
            });
          } else {
            newCol.isSorted = false;
            newCol.isSortedDescending = true;
          }
        });

        //
        if(currColumn !== undefined && currColumn.fieldName !== undefined) {
          const newItems = _copyAndSort(items, currColumn.fieldName, currColumn.isSortedDescending);
          this.setState({
            columns: newColumns,
            items: newItems,
          });
        }
      };   
    // ==================================================

    const detailedListColumns: IColumn[] = [
        {
          key: 'column1',
          name: 'sourceUrl',
          ariaLabel: 'Source Url, Press to sort on Source Url',
          fieldName: 'sourceUrl',
          minWidth: 250,
          maxWidth: 300,
          isRowHeader: true,
          isResizable: true,
          isSorted: true,
          isSortedDescending: false,
          sortAscendingAriaLabel: "Sorted A to Z",
          sortDescendingAriaLabel: "Sorted Z to A",
          onColumnClick: handleColumnClick,
          data: strings,
          onRender: (item: IBitlyListItem) => (
            // eslint-disable-next-line react/jsx-no-bind
            <Link onClick={() => handleItemInvoked(item)} underline>
              {item.sourceUrl}
            </Link>
          ),
        },
        {
          key: 'column2',
          name: 'medium',
          ariaLabel: 'UTM Medium, Press to sort on Medium',
          fieldName: 'medium',
          minWidth: 100,
          maxWidth: 120,
          isRowHeader: true,
          isResizable: true,
          isSorted: true,
          isSortedDescending: false,
          sortAscendingAriaLabel: "Sorted A to Z",
          sortDescendingAriaLabel: "Sorted Z to A",
          onColumnClick: handleColumnClick,
          data: strings,
          onRender: (item: IBitlyListItem) => (
            <span>{item.medium}</span>
          ),
        },
        {
          key: 'column3',
          name: 'source',
          ariaLabel: 'UTM Source, Press to sort on Source',
          fieldName: 'source',
          minWidth: 100,
          maxWidth: 120,
          isRowHeader: true,
          isResizable: true,
          isSorted: true,
          isSortedDescending: false,
          sortAscendingAriaLabel: "Sorted A to Z",
          sortDescendingAriaLabel: "Sorted Z to A",
          onColumnClick: handleColumnClick,
          data: strings,
          onRender: (item: IBitlyListItem) => (
            <span>{item.source}</span>
          ),
        },
        {
          key: 'column4',
          name: 'campaign',
          ariaLabel: 'UTM Campaign Name, Press to sort on Campaign',
          fieldName: 'medium',
          minWidth: 100,
          maxWidth: 120,
          isRowHeader: true,
          isResizable: true,
          isSorted: true,
          isSortedDescending: false,
          sortAscendingAriaLabel: "Sorted A to Z",
          sortDescendingAriaLabel: "Sorted Z to A",
          onColumnClick: handleColumnClick,
          data: strings,
          onRender: (item: IBitlyListItem) => (
            <span>{item.campaign}</span>
          ),
        },
        {
          key: 'column7',
          name: 'Copy',
          className: classNames.iconCell,
          iconClassName: classNames.iconHeaderIcon,
          ariaLabel: 'Column for copying the shortened url of each list item',
          isIconOnly: true,
          fieldName: 'qrcode',
          minWidth: 16,
          maxWidth: 16,
          onRender: (item: IBitlyListItem) => (
            <TooltipHost content={`${strings.CopyToClipboardMessage}`}>
              <Link onClick={(e) => handleCopyToClipboard(item.shortUrl)}>
                <Copy16Filled width={16} height={16} />
              </Link>
            </TooltipHost>
          ),
        }
      ];

    // ================

    return (
      <React.Fragment>
          <DetailsList
            items={items}
            compact={false}
            columns={detailedListColumns}
            selectionMode={SelectionMode.none}
            setKey="none"
            getKey={_getKey}
            layoutMode={DetailsListLayoutMode.justified}
            isHeaderVisible={true}
            onItemInvoked={handleItemInvoked}
          />
          {
            (items.length === 0) && (
              <NoBitlyLinksMessage />
            )
          }
      </React.Fragment>
    );
}

/*
const detailedListColumns: IColumn[] = [
        {
          key: 'column1',
          name: 'sourceUrl',
          ariaLabel: 'Source Url, Press to sort on Source Url',
          fieldName: 'sourceUrl',
          minWidth: 350,
          maxWidth: 400,
          isRowHeader: true,
          isResizable: true,
          isSorted: true,
          isSortedDescending: false,
          sortAscendingAriaLabel: "Sorted A to Z",
          sortDescendingAriaLabel: "Sorted Z to A",
          onColumnClick: handleColumnClick,
          data: strings,
          onRender: (item: IBitlyListItem) => (
            // eslint-disable-next-line react/jsx-no-bind
            <Link onClick={() => handleItemInvoked(item)} underline>
              {item.sourceUrl}
            </Link>
          ),
        },
        {
          key: 'column2',
          name: 'createdBy',
          ariaLabel: 'Created By Name, Press to sort on Source Url',
          fieldName: 'createdBy',
          minWidth: 100,
          maxWidth: 120,
          isRowHeader: true,
          isResizable: true,
          isSorted: true,
          isSortedDescending: false,
          sortAscendingAriaLabel: "Sorted A to Z",
          sortDescendingAriaLabel: "Sorted Z to A",
          onColumnClick: handleColumnClick,
          data: strings,
          onRender: (item: IBitlyListItem) => (
            <span>{item.createdBy}</span>
          ),
        },
        {
          key: 'column3',
          name: 'medium',
          ariaLabel: 'UTM Medium, Press to sort on Source Url',
          fieldName: 'medium',
          minWidth: 80,
          maxWidth: 100,
          isRowHeader: true,
          isResizable: true,
          isSorted: true,
          isSortedDescending: false,
          sortAscendingAriaLabel: "Sorted A to Z",
          sortDescendingAriaLabel: "Sorted Z to A",
          onColumnClick: handleColumnClick,
          data: strings,
          onRender: (item: IBitlyListItem) => (
            <span>{item.medium}</span>
          ),
        },
        {
          key: 'column4',
          name: 'source',
          ariaLabel: 'UTM Source, Press to sort on Source Url',
          fieldName: 'source',
          minWidth: 80,
          maxWidth: 100,
          isRowHeader: true,
          isResizable: true,
          isSorted: true,
          isSortedDescending: false,
          sortAscendingAriaLabel: "Sorted A to Z",
          sortDescendingAriaLabel: "Sorted Z to A",
          onColumnClick: handleColumnClick,
          data: strings,
          onRender: (item: IBitlyListItem) => (
            <span>{item.source}</span>
          ),
        },
        {
          key: 'column5',
          name: 'campaign',
          ariaLabel: 'UTM Campaign, Press to sort on Source Url',
          fieldName: 'campaign',
          minWidth: 80,
          maxWidth: 100,
          isRowHeader: true,
          isResizable: true,
          isSorted: true,
          isSortedDescending: false,
          sortAscendingAriaLabel: "Sorted A to Z",
          sortDescendingAriaLabel: "Sorted Z to A",
          onColumnClick: handleColumnClick,
          data: strings,
          onRender: (item: IBitlyListItem) => (
            <span>{item.campaign}</span>
          ),
        },
        {
          key: 'column6',
          name: 'QR Code',
          className: classNames.iconCell,
          iconClassName: classNames.iconHeaderIcon,
          ariaLabel: 'Column for QR Code generation of each list item',
          isIconOnly: true,
          fieldName: 'qrcode',
          minWidth: 16,
          maxWidth: 16,
          onRender: (item: IBitlyListItem) => (
            <TooltipHost content={`${strings.QRCodeMessage}`}>
              <QrCode20Filled width={16} height={16} />
            </TooltipHost>
          ),
        },
        {
          key: 'column7',
          name: 'Copy',
          className: classNames.iconCell,
          iconClassName: classNames.iconHeaderIcon,
          ariaLabel: 'Column for copying the shortened url of each list item',
          isIconOnly: true,
          fieldName: 'qrcode',
          minWidth: 16,
          maxWidth: 16,
          onRender: (item: IBitlyListItem) => (
            <TooltipHost content={`${strings.CopyToClipboardMessage}`}>
              <Copy16Filled width={16} height={16} />
            </TooltipHost>
          ),
        }
      ];
*/