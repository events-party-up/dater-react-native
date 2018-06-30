import React from 'react';
import {
  View,
  ActivityIndicator,
  Image,
} from 'react-native';

import { H2, Caption2, Body } from '../../../components/ui-kit/atoms/typography';

const MapPanelSelfieUploading = (props) => (
  <View>
    <View>
      <View style={{
        marginTop: 8,
        flexDirection: 'row',
      }}
      >
        <View
          style={{
            height: 112,
            aspectRatio: props.aspectRatio,
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
              height: 112,
              alignSelf: 'flex-start',
              aspectRatio: props.aspectRatio,
              borderRadius: 4,
            }}
            source={{ uri: props.photoURI }}
          // source={{ uri: 'https://res.cloudinary.com/dater/image/upload/v1527447895/microDates/microDateId.jpg' }}
          />
        </View>
        <View style={{
          flex: 1,
          flexDirection: 'column',
          marginLeft: 16,
        }}
        >
          <H2>
            Загрузка фото
          </H2>
          <Caption2
            style={{
              marginTop: 8,
            }}
          >
            Ожидайте, идет загрузка фото на сервер.
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
              Прогресс {props.progress < 100 ? props.progress : 80}%
            </Body>
          </View>
        </View>
      </View>
    </View>
  </View>
);

export default MapPanelSelfieUploading;
