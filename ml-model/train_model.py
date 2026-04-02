import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os

class NotificationClassifier:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.label_encoders = {}
        self.feature_columns = []
        
    def preprocess_data(self, df):
        """Preprocess the data for training"""
        # Create copies to avoid modifying original
        df_processed = df.copy()
        
        # Convert timestamp to hour_of_day if not present
        if 'hour_of_day' not in df_processed.columns:
            df_processed['hour_of_day'] = pd.to_datetime(df_processed['timestamp'], unit='s').dt.hour
        
        # Add is_weekend feature (opposite of is_weekday)
        df_processed['is_weekend'] = 1 - df_processed['is_weekday']
        
        # Encode categorical variables
        categorical_columns = ['app', 'sender', 'activity']
        
        for col in categorical_columns:
            if col not in self.label_encoders:
                self.label_encoders[col] = LabelEncoder()
            df_processed[f'{col}_encoded'] = self.label_encoders[col].fit_transform(df_processed[col])
        
        # Select features for training
        self.feature_columns = [
            'app_encoded', 'sender_encoded', 'activity_encoded',
            'hour_of_day', 'is_weekday', 'is_weekend'
        ]
        
        # Add message length as a feature
        df_processed['message_length'] = df_processed['message'].str.len()
        self.feature_columns.append('message_length')
        
        # Add urgency keywords detection
        urgency_keywords = ['urgent', 'emergency', 'important', 'asap', 'immediate', 'critical']
        df_processed['has_urgency_keyword'] = df_processed['message'].str.lower().apply(
            lambda x: any(keyword in x for keyword in urgency_keywords)
        ).astype(int)
        self.feature_columns.append('has_urgency_keyword')
        
        return df_processed
    
    def train(self, dataset_path):
        """Train the model on the dataset"""
        print("Loading dataset...")
        df = pd.read_csv(dataset_path)
        
        print("Preprocessing data...")
        df_processed = self.preprocess_data(df)
        
        # Prepare features and target
        X = df_processed[self.feature_columns]
        y = df_processed['action']
        
        # Encode target variable
        if 'action' not in self.label_encoders:
            self.label_encoders['action'] = LabelEncoder()
        y_encoded = self.label_encoders['action'].fit_transform(y)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
        )
        
        print("Training model...")
        self.model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = self.model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        print(f"Model Accuracy: {accuracy:.4f}")
        print("\nClassification Report:")
        print(classification_report(
            y_test, y_pred, 
            target_names=self.label_encoders['action'].classes_
        ))
        
        # Feature importance
        feature_importance = pd.DataFrame({
            'feature': self.feature_columns,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        print("\nFeature Importance:")
        print(feature_importance)
        
        return accuracy
    
    def predict(self, notification_data):
        """Predict action for a single notification"""
        # Convert to DataFrame if dict
        if isinstance(notification_data, dict):
            df = pd.DataFrame([notification_data])
        else:
            df = notification_data.copy()
        
        # Preprocess
        df_processed = self.preprocess_data(df)
        
        # Extract features
        X = df_processed[self.feature_columns]
        
        # Predict
        prediction_encoded = self.model.predict(X)[0]
        prediction_proba = self.model.predict_proba(X)[0]
        
        # Decode prediction
        prediction = self.label_encoders['action'].inverse_transform([prediction_encoded])[0]
        
        # Get probability for each class
        class_probabilities = {}
        for i, class_name in enumerate(self.label_encoders['action'].classes_):
            class_probabilities[class_name] = float(prediction_proba[i])
        
        return {
            'prediction': prediction,
            'confidence': float(max(prediction_proba)),
            'probabilities': class_probabilities
        }
    
    def save_model(self, model_path='notification_model.pkl'):
        """Save the trained model and encoders"""
        model_data = {
            'model': self.model,
            'label_encoders': self.label_encoders,
            'feature_columns': self.feature_columns
        }
        joblib.dump(model_data, model_path)
        print(f"Model saved to {model_path}")
    
    def load_model(self, model_path='notification_model.pkl'):
        """Load a trained model"""
        if os.path.exists(model_path):
            model_data = joblib.load(model_path)
            self.model = model_data['model']
            self.label_encoders = model_data['label_encoders']
            self.feature_columns = model_data['feature_columns']
            print(f"Model loaded from {model_path}")
            return True
        else:
            print(f"Model file {model_path} not found")
            return False

def main():
    classifier = NotificationClassifier()
    
    # Train the model
    accuracy = classifier.train('dataset.csv')
    
    # Save the model
    classifier.save_model()
    
    # Test with sample data
    test_notifications = [
        {
            'timestamp': 1693527000,
            'app': 'instagram',
            'sender': 'friend',
            'message': 'Check out my new post!',
            'activity': 'study',
            'is_weekday': 1
        },
        {
            'timestamp': 1693527000,
            'app': 'whatsapp',
            'sender': 'teacher',
            'message': 'URGENT: Assignment due tomorrow',
            'activity': 'study',
            'is_weekday': 1
        }
    ]
    
    print("\nTesting predictions:")
    for notification in test_notifications:
        result = classifier.predict(notification)
        print(f"Notification: {notification['app']} from {notification['sender']}")
        print(f"Prediction: {result['prediction']} (Confidence: {result['confidence']:.2f})")
        print(f"Probabilities: {result['probabilities']}")
        print("-" * 50)

if __name__ == "__main__":
    main()
