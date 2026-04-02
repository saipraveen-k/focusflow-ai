from sklearn.tree import DecisionTreeClassifier

class NotificationModel:
    def __init__(self):
        self.model = DecisionTreeClassifier()

    def train(self, X_train, y_train):
        self.model.fit(X_train, y_train)

    def predict(self, X_test):
        return self.model.predict(X_test)

def decide(notification, context):
    """
    Rule-Based (Initial) logic for FocusFlow AI.
    """
    if context.get("activity") == "studying":
        if notification.get("priority") == "high":
            return "SHOW"
        else:
            return "DELAY"
    return "SHOW"
