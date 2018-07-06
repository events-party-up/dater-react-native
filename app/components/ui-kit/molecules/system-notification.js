import * as React from 'react';

import SystemNotificationView from './system-notification-view';

// const offlineIcon = require('../../../assets/icons/offline/offline.png');
const onlineIcon = require('../../../assets/icons/online/online.png');

const timeToLive = 3000;

type Props = {
  message: string,
};

export default class SystemNotification extends React.Component<Props> {
  messages = [];
  messageId = 0;

  componentDidUpdate(prevProps: Props) {
    if (prevProps.message !== this.props.message) {
      this.messageId = this.messageId + 1;
      this.messages.push({
        message: this.props.message,
        icon: onlineIcon,
        type: 'temp',
        timeToLive,
        messageId: this.messageId,
      });
      setTimeout(() => {
        this.messages.shift();
      }, timeToLive);
    }
  }

  render() {
    return this.messages.map((message, index) => (
      <SystemNotificationView
        key={message.messageId}
        message={message.message}
        icon={message.icon}
        index={index}
        timeToLive={timeToLive}
      />
    ));
  }
}
