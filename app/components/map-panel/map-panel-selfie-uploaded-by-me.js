import React from 'react';
import {
  View,
  Image,
} from 'react-native';

import { H2, Caption2 } from '../../components/ui-kit/typography';
import cloudinaryUrl from '../../utils/cloudinary-utils';

const MapPanelSelfieUploadedByMe = (props) => (
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
          <Image
            style={{
              height: 112,
              alignSelf: 'flex-start',
              aspectRatio: props.aspectRatio,
              borderRadius: 4,
            }}
            source={{
              uri: cloudinaryUrl(`microDates/${props.cloudinaryPublicId}`, {
                height: 112,
                crop: 'scale',
              }),
            }}
          />
        </View>
        <View style={{
          flex: 1,
          flexDirection: 'column',
          marginLeft: 16,
        }}
        >
          <H2>
            Фото загружено!
          </H2>
          <Caption2
            style={{
              marginTop: 8,
            }}
          >
            Ожидаю подтверждения встречи от {props.targetUserUid.substring(0, 4)}.
          </Caption2>
        </View>
      </View>
    </View>
  </View>
);

export default MapPanelSelfieUploadedByMe;
