import React from 'react';
import {
  View,
  Image,
} from 'react-native';

import MapPanelStyles from './map-panel-styles';
import { H2, Caption2 } from '../../../components/ui-kit/atoms/typography';
import cloudinaryUrl from '../../../utils/cloudinary-utils';

type Props = {
  cloudinaryPublicId: string,
  cloudinaryImageVersion: number,
  targetUser: any,
  aspectRatio: number,
}

class MapPanelSelfieUploadedByTarget extends React.Component<Props> {
  render() {
    return (
      <View>
        <H2 style={MapPanelStyles.panelHeader} numberOfLines={1} >
          Сделано фото с тобой!
        </H2>
        <View>
          <View style={{
            marginBottom: 16,
            flexDirection: this.props.aspectRatio >= 1 ? 'column' : 'row',
          }}
          >
            <Image
              style={{
                [this.props.aspectRatio >= 1 ? 'width' : 'height']: 112,
                alignSelf: this.props.aspectRatio >= 1 ? 'center' : 'flex-start',
                aspectRatio: this.props.aspectRatio >= 1 ? 3 / 2 : 2 / 3,
                borderRadius: 4,
                marginBottom: 8,
              }}
              source={{
                uri: cloudinaryUrl({
                  publicId: `microDates/${this.props.cloudinaryPublicId}`,
                  version: this.props.cloudinaryImageVersion,
                }, {
                    [this.props.aspectRatio >= 1 ? 'width' : 'height']: 112,
                    crop: 'thumb',
                    gravity: 'faces',
                }),
              }}
            />
            <View style={{
              flex: this.props.aspectRatio >= 1 ? 0 : 1,
              marginLeft: 16,
            }}
            >
              <Caption2
                style={MapPanelStyles.panelBody}
              >
                Ты подтверждаешь, что это фото сделано только что между тобой и {' '}
                {this.props.targetUser.name}? {'\n\n'}
                На фото должны быть видны ваши лица.
              </Caption2>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

export default MapPanelSelfieUploadedByTarget;
