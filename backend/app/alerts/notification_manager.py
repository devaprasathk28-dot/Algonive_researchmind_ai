def send_notifications(alerts):

    notifications = []

    for alert in alerts:

        notifications.append({

            "notification":
                alert,

            "status":
                "sent"
        })

    return notifications
