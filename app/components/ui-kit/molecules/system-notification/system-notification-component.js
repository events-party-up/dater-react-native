import * as React from 'react';
import * as _ from 'lodash';

import SystemNotificationView from './system-notification-view';
import { SystemNotification } from '../../../../types';

type Props = {
  systemNotifications: SystemNotification,
};

export default class SystemNotificationComponent extends React.Component<Props> {
  notifications: Array<SystemNotification> = [];

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.systemNotifications.id === 0) return;
    if (nextProps.systemNotifications.id === this.props.systemNotifications.id) return;
    this.addNewMessage(nextProps.systemNotifications);
  }

  addNewMessage = (notification: SystemNotification) => {
    // Replace existing notification if message with collapseKeyToReplace is found
    if (this.notifications.find((elem) => elem.collapseKey === notification.collapseKeyToReplace)) {
      this.notifications = this.notifications.filter((elem) => elem.collapseKey !== notification.collapseKeyToReplace);
    }

    // Such notification already exist, do nothing
    if (this.notifications.find((elem) => elem.collapseKey === notification.collapseKey)) {
      return;
    }

    this.notifications.push(notification);

    if (notification.type === 'temp') {
      setTimeout(() => {
        this.notifications = this.notifications.filter((elem) => elem.id !== notification.id);
      }, notification.TTL);
    }
  }

  removeMessage = (collapseKey) => {
    this.notifications = _.remove(this.notifications, {
      collapseKey,
    });
  }

  render() {
    return this.notifications.map((notification, index) => (
      <SystemNotificationView
        key={notification.id}
        text={notification.text}
        icon={notification.icon}
        index={index}
        type={notification.type}
        TTL={notification.TTL}
      />
    ));
  }
}
