import React from 'react';
import {
  View,
  Image,
} from 'react-native';

import { H2, Caption2 } from '../../../components/ui-kit/atoms/typography';
import cloudinaryUrl from '../../../utils/cloudinary-utils';

type Props = {
  cloudinaryPublicId: string,
  cloudinaryImageVersion: number,
  targetUser: any,
  aspectRatio: number,
}

export default class MapPanelSelfieUploadedByMe extends React.Component<Props> {
  render() {
    return (
      <View>
        <View>
          <View style={{
            marginTop: 8,
            flexDirection: 'row',
          }}
          >
            <Image
              style={{
                [this.props.aspectRatio >= 1 ? 'width' : 'height']: 112,
                alignSelf: 'flex-start',
                aspectRatio: this.props.aspectRatio >= 1 ? 3 / 2 : 2 / 3,
                borderRadius: 4,
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
              flex: 1,
              flexDirection: 'column',
              marginLeft: 16,
            }}
            >
              <H2 numberOfLines={1} >
                Фото загружено!
              </H2>
              <Caption2
                style={{
                  marginTop: 8,
                }}
                numberOfLines={4}
              >
                Попроси {this.props.targetUser.name} открыть{' '}
                {this.props.targetUser.gender === 'male' ? 'его' : 'её'}{' '}
                телефон и подтвердить ваше совместное фото.
              </Caption2>
            </View>
          </View>
        </View>
      </View>
    );
  }
}
