import React from 'react';
import {
  View,
  ActivityIndicator,
  Image,
} from 'react-native';

import { H2, Caption2, Body } from '../../../components/ui-kit/atoms/typography';

type Props = {
  aspectRatio: number,
  progress: number,
  photoURI: string,
}

export default class MapPanelSelfieUploading extends React.Component<Props> {
  render() {
    return (
      <View>
        <View>
          <View style={{
            marginTop: 8,
            flexDirection: 'row',
          }}
          >
            <View
              style={{
                [this.props.aspectRatio >= 1 ? 'width' : 'height']: 112,
                aspectRatio: this.props.aspectRatio >= 1 ? 3 / 2 : 2 / 3,
              }}
            >
              <ActivityIndicator
                color="white"
                size="large"
                style={{
                  position: 'absolute',
                  left: 0,
                  bottom: 0,
                  top: 0,
                  right: 0,
                  zIndex: 1,
                  backgroundColor: 'rgba(107, 107, 107, 0.6)',
                }
                }
              />
              <Image
                style={{
                  [this.props.aspectRatio >= 1 ? 'width' : 'height']: 112,
                  alignSelf: 'flex-start',
                  aspectRatio: this.props.aspectRatio >= 1 ? 3 / 2 : 2 / 3,
                  borderRadius: 4,
                }}
                source={{ uri: this.props.photoURI }}
              />
            </View>
            <View style={{
              flex: 1,
              flexDirection: 'column',
              marginLeft: 16,
            }}
            >
              <H2 numberOfLines={1}>
                Загрузка фото
              </H2>
              <Caption2
                style={{
                  marginTop: 8,
                }}
              >
                Идет загрузка фото на сервер...
              </Caption2>
              <View style={{
                flexDirection: 'column',
                justifyContent: 'flex-end',
                flex: 1,
              }}
              >
                <Body style={{
                  alignSelf: 'flex-start',
                }}
                >
                  Прогресс {this.props.progress < 100 ? this.props.progress : 80}%
                </Body>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }
}
