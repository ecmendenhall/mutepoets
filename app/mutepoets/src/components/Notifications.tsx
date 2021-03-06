import {
  getExplorerTransactionLink,
  Notification,
  useNotifications,
} from "@usedapp/core";

interface Props {
  notification: Notification;
}

const NotificationItem = ({ notification }: Props) => {
  const title = () => {
    if (notification.type === "walletConnected") {
      return "Wallet Connected";
    } else {
      return notification.transactionName;
    }
  };

  const status = () => {
    switch (notification.type) {
      case "transactionStarted":
        return transaction("Pending transaction");
      case "transactionSucceed":
        return transaction("Transaction confirmed");
      case "transactionFailed":
        return transaction("Transaction failed");
    }
  };

  const transaction = (text: string) => {
    if (notification.type === "walletConnected") {
      return;
    } else {
      return (
        <a
          className="underline cursor-pointer"
          href={getExplorerTransactionLink(
            notification.transaction.hash,
            notification.transaction.chainId
          )}
          target="blank"
          rel="noreferrer"
        >
          {text}
        </a>
      );
    }
  };

  return (
    <div className="p-4 shadow bg-gray-100 text-gray-800 mb-2 w-full">
      <h4 className="font-display font-black uppercase">{title()}</h4>
      <p>{status()}</p>
    </div>
  );
};

const Notifications = () => {
  const { notifications } = useNotifications();

  return (
    <div className="fixed bottom-12 right-12 z-50 w-1/5">
      {notifications.map((n) => (
        <NotificationItem notification={n} />
      ))}
    </div>
  );
};

export default Notifications;
