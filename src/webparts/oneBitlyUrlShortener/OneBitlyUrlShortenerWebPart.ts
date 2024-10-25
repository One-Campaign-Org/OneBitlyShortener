import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version, DisplayMode } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'OneBitlyUrlShortenerWebPartStrings';
import OneBitlyUrlShortener from './components/OneBitlyUrlShortener';
import { IOneBitlyUrlShortenerProps } from './interfaces/IOneBitlyUrlShortenerProps';
import { getSP } from '../pnpjs-config';


export default class OneBitlyUrlShortenerWebPart extends BaseClientSideWebPart<IOneBitlyUrlShortenerProps> {

  public async onInit(): Promise<void> {
    // initialize the PnP SP Context
    getSP(this.context);    
  }
  
  public render(): void {

    //console.log(this.context.pageContext.user);

    const element: React.ReactElement<IOneBitlyUrlShortenerProps> = React.createElement(
      OneBitlyUrlShortener,
      {
        bitlyApiKey: this.properties.bitlyApiKey,
        inEditMode: (this.displayMode === DisplayMode.Edit),
        userName: this.context.pageContext.user.loginName,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
      } as IOneBitlyUrlShortenerProps
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('bitlyApiKey', {
                  label: strings.BitlyFieldDescription
                }),
              ]
            }
          ]
        }
      ]
    };
  }
}
