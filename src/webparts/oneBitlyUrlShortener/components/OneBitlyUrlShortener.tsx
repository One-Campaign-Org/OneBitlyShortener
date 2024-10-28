import * as React from 'react';
import { useEffect, useState } from 'react';
import styles from './OneBitlyUrlShortener.module.scss';
import type { IOneBitlyUrlShortenerProps } from '../interfaces/IOneBitlyUrlShortenerProps';

import * as strings from 'OneBitlyUrlShortenerWebPartStrings';
import OneBitlyDetailList from './OneBitlyDetailList';
//import OneBitlyItemPanel from './OneBitlyItemPanel';
import { useBoolean } from '@fluentui/react-hooks';
import { IBitlyListItem, IDropDownItem } from '../interfaces';
import { 
  Panel,
  CommandBar, ICommandBarItemProps
} from '@fluentui/react';
import { getSP } from '../../pnpjs-config';
import OneHyperlinkPanel from './OneHyperlinkPanel';

const SHAREPOINT_LIST_NAME = "Bitly List";
const SHAREPOINT_UTM_CAMPAIGN_NAME = "Bitly_Utm_Campaign";
const SHAREPOINT_UTM_SOURCE_NAME = "Bitly_Utm_Source";
const SHAREPOINT_UTM_MEDIUM_NAME = "Bitly_Utm_Medium";

export interface IBitlyUtmListItem {
  Title: string
}

// =============================================================================

export default function OneBitlyUrlShortener({ inEditMode, userName, bitlyApiKey }: IOneBitlyUrlShortenerProps): JSX.Element {

  const [isBitlyPanelOpen, { setTrue: handleOpenPanel, setFalse: handleDismissPanel }] = useBoolean(false);
  // this is set when the item's hyperlink is clicked in the Detailed List View
  // the state is passed to the pop out panel
  const [selectedBitlyItem, setSelectedBitlyItem] = useState<IBitlyListItem|undefined>(undefined);
  // maintains a local copy of the bitly links maintained as a list in Sharepoint
  const [bitlyItems, setBitlyItems] = useState<IBitlyListItem[]>([]);

  const [utmCampaignValues, setUtmCampaignValues] = useState<IDropDownItem[]>([]);
  const [utmSourceValues, setUtmSourceValues] = useState<IDropDownItem[]>([]);
  const [utmMediumValues, setUtmMediumValues] = useState<IDropDownItem[]>([]);

  // == event handlers ===================================================

  const handleAddClicked = (): void => {
    // state object that is passed to the info panel
    // we set to undefined so that the previous selected item details are not
    // presented
    setSelectedBitlyItem(undefined);
    handleOpenPanel();
  }

  // called from the detailed list 
  const handleOpenExistingBitlyItem = (itemKey: string): void => {
    console.log(itemKey);
    // get the selected item from the data store
    const bitlyItem = bitlyItems.filter((value: IBitlyListItem) => value.key === itemKey);
    console.log(bitlyItem);
    // bitlyItem result will only ever have max 1 item as we're using unique keys
    if(bitlyItem.length > 0) {
      setSelectedBitlyItem(bitlyItem[0]);
      handleOpenPanel();
    }
  }

  // called from the panel
  const handleSaveBitlyItemClicked = (item: IBitlyListItem):void => {

    console.log(`Saving: ${JSON.stringify(item)}`);

    setBitlyItems([
      ...bitlyItems,
      item
    ]);

  }

  // ================================================

  const _commandBarItems: ICommandBarItemProps[] = [
    { 
      key: 'newItem', 
      text: strings.AddButtonLabel, 
      iconProps: { iconName: 'Add' }, 
      onClick: handleAddClicked
    }
  ];

  useEffect(() => {

    const fetchData = async (): Promise<void> => {
      console.log("fetching list items");
      const result = await getSP()?.web.lists.getByTitle(SHAREPOINT_LIST_NAME).items.select()();
      if(result) {
        const items: IBitlyListItem[] = result.map((item: IBitlyListItem) => {
          return {
            key: item.key,
            sourceUrl: item.sourceUrl,
            createdBy: item.createdBy,
            medium: item.medium,
            source: item.source,
            campaign: item.campaign,
            term: item.term,
            content: item.content,
            shortUrl: item.shortUrl
          }
        });
        setBitlyItems(items);
      }

      // utm campaign codes
      const resultCampaign = await getSP()?.web.lists.getByTitle(SHAREPOINT_UTM_CAMPAIGN_NAME).items.select()();
      if(resultCampaign) {
        const items: IDropDownItem[] = resultCampaign.map((item: IBitlyUtmListItem, index: number) => {
          return {
            key: index.toString(),
            text: item.Title
          }
        });
        setUtmCampaignValues(items);        
      }

      // utm source codes
      const resultSource = await getSP()?.web.lists.getByTitle(SHAREPOINT_UTM_SOURCE_NAME).items.select()();
      if(resultSource) {
        const items: IDropDownItem[] = resultSource.map((item: IBitlyUtmListItem, index: number) => {
          return {
            key: index.toString(),
            text: item.Title
          }
        });
        setUtmSourceValues(items);
      }
      
      // utm medium codes
      const resultMedium = await getSP()?.web.lists.getByTitle(SHAREPOINT_UTM_MEDIUM_NAME).items.select()();
      if(resultMedium) {
        const items: IDropDownItem[] = resultMedium.map((item: IBitlyUtmListItem, index: number) => {
          return {
            key: index.toString(),
            text: item.Title
          }
        });
        setUtmMediumValues(items);
      }
    }       
      
    if (!inEditMode) fetchData().catch(console.error);

  }, [inEditMode]);

  return (
    <div className={styles.container}>
      <Panel
          isOpen={isBitlyPanelOpen}
          onOpened={handleOpenPanel}
          onDismiss={handleDismissPanel}
          headerText="Create Short Link"
          closeButtonAriaLabel="Close"
          // Stretch panel content to fill the available height so the footer is positioned
          // at the bottom of the page
          isFooterAtBottom={true}
      >
       <OneHyperlinkPanel 
          item={selectedBitlyItem} 
          onSave={handleSaveBitlyItemClicked}
          onClose={handleDismissPanel} 
          utmCampaignValues={utmCampaignValues}
          utmSourceValues={utmSourceValues}
          utmMediumValues={utmMediumValues}
          apiToken={bitlyApiKey} 
          createdBy={userName} /> 
      </Panel>
      { 
        inEditMode && (
          <div className={styles.editModeContainer}>
            <div className={`${styles.editModeContainerInner} ${styles.wFit} ${styles.mxAuto} ${styles.myAuto}`}>
              <h2 className={`${styles.editModeContainerTitle}`}>Bitly Link Generator</h2>
              <p>Configure me before publishing.</p>
            </div>
          </div>
        )
      }
      {
        !inEditMode && (
          <React.Fragment>
            <CommandBar
              items={_commandBarItems}
              ariaLabel="Bitly actions"
              primaryGroupAriaLabel="Bitly actions"
            />
            <OneBitlyDetailList items={bitlyItems} onOpen={handleOpenExistingBitlyItem} />
          </React.Fragment>
        )
      }
    </div>
  );
}
