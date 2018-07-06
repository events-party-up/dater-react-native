import * as React from 'react';
import * as _ from 'lodash';

import SystemNotificationView from './system-notification-view';

// const offlineIcon = require('../../../assets/icons/offline/offline.png');
// const onlineIcon = require('../../../assets/icons/online/online.png');
const errorIcon = require('../../../assets/icons/error/error.png');

const timeToLive = 3000;

type Props = {
  message: string,
  gpsIsPoor: boolean,
};

export default class SystemNotification extends React.Component<Props> {
  messages = [];
  messageId = 0;

  componentDidUpdate(prevProps: Props) {
    if (prevProps.gpsIsPoor !== this.props.gpsIsPoor && this.props.gpsIsPoor) {
      this.addNewMessage({
        message: 'Плохой сигнал GPS. Выйди из здания, координаты не записываются',
        icon: errorIcon,
        type: 'permanent',
        timeToLive,
        messageKey: 'gpsIsPoor',
      });
    }

    if (prevProps.gpsIsPoor !== this.props.gpsIsPoor && !this.props.gpsIsPoor) {
      this.removeMessage('gpsIsPoor');
    }

    if (prevProps.message !== this.props.message) {
      this.addNewMessage({
        message: this.props.message,
        icon: errorIcon,
        type: 'temp',
        timeToLive,
      });
    }
  }

  addNewMessage = (message) => {
    this.messageId = this.messageId + 1;
    this.messages.push({
      ...message,
      messageId: this.messageId,
    });

    if (message.type === 'temp') {
      setTimeout(() => {
        this.messages.shift();
      }, timeToLive);
    }
  }

  removeMessage = (messageKey) => { // TODO: not working properly!
    this.messages = _.remove(this.messages, {
      messageKey,
    });
  }

  render() {
    return this.messages.map((message, index) => (
      <SystemNotificationView
        key={message.messageId}
        message={message.message}
        icon={message.icon}
        index={index}
        type={message.type}
        timeToLive={timeToLive}
      />
    ));
  }
}
