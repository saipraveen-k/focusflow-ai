from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Global variables for model
model = None
label_encoders = None
feature_columns = None

def load_model():
    """Load the trained model"""
    global model, label_encoders, feature_columns
    
    model_path = 'notification_model.pkl'
    if os.path.exists(model_path):
        model_data = joblib.load(model_path)
        model = model_data['model']
        label_encoders = model_data['label_encoders']
        feature_columns = model_data['feature_columns']
        print("Model loaded successfully")
        return True
    else:
        print("Model file not found. Please train the model first.")
        return False

def preprocess_notification(notification_data):
    """Preprocess notification data for prediction"""
    df = pd.DataFrame([notification_data])
    
    # Convert timestamp to hour_of_day if not present
    if 'hour_of_day' not in df.columns:
        df['hour_of_day'] = pd.to_datetime(df['timestamp'], unit='s').dt.hour
    
    # Add is_weekend feature
    df['is_weekend'] = 1 - df['is_weekday']
    
    # Encode categorical variables
    categorical_columns = ['app', 'sender', 'activity']
    
    for col in categorical_columns:
        if col in label_encoders:
            # Handle unseen categories
            unique_values = df[col].unique()
            for val in unique_values:
                if val not in label_encoders[col].classes_:
                    # Add unseen category to encoder
                    label_encoders[col].classes_ = np.append(label_encoders[col].classes_, val)
            
            df[f'{col}_encoded'] = label_encoders[col].transform(df[col])
        else:
            # If encoder doesn't exist, use default encoding
            df[f'{col}_encoded'] = 0
    
    # Add message length
    df['message_length'] = df['message'].str.len()
    
    # Add urgency keywords detection
    urgency_keywords = ['urgent', 'emergency', 'important', 'asap', 'immediate', 'critical']
    df['has_urgency_keyword'] = df['message'].str.lower().apply(
        lambda x: any(keyword in str(x) for keyword in urgency_keywords)
    ).astype(int)
    
    return df

def predict_notification(notification_data):
    """Make prediction for a notification"""
    try:
        # Preprocess
        df_processed = preprocess_notification(notification_data)
        
        # Extract features
        X = df_processed[feature_columns]
        
        # Predict
        prediction_encoded = model.predict(X)[0]
        prediction_proba = model.predict_proba(X)[0]
        
        # Decode prediction
        prediction = label_encoders['action'].inverse_transform([prediction_encoded])[0]
        
        # Get probability for each class
        class_probabilities = {}
        for i, class_name in enumerate(label_encoders['action'].classes_):
            class_probabilities[class_name] = float(prediction_proba[i])
        
        return {
            'success': True,
            'prediction': prediction,
            'confidence': float(max(prediction_proba)),
            'probabilities': class_probabilities,
            'processed_features': {
                'hour_of_day': int(df_processed['hour_of_day'].iloc[0]),
                'message_length': int(df_processed['message_length'].iloc[0]),
                'has_urgency_keyword': int(df_processed['has_urgency_keyword'].iloc[0])
            }
        }
    
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Predict notification action"""
    if model is None:
        return jsonify({
            'success': False,
            'error': 'Model not loaded'
        }), 500
    
    data = request.get_json()
    
    if not data:
        return jsonify({
            'success': False,
            'error': 'No data provided'
        }), 400
    
    # Validate required fields
    required_fields = ['app', 'sender', 'message', 'activity', 'timestamp', 'is_weekday']
    missing_fields = [field for field in required_fields if field not in data]
    
    if missing_fields:
        return jsonify({
            'success': False,
            'error': f'Missing required fields: {missing_fields}'
        }), 400
    
    result = predict_notification(data)
    
    if result['success']:
        return jsonify(result)
    else:
        return jsonify(result), 500

@app.route('/batch_predict', methods=['POST'])
def batch_predict():
    """Predict multiple notifications at once"""
    if model is None:
        return jsonify({
            'success': False,
            'error': 'Model not loaded'
        }), 500
    
    data = request.get_json()
    
    if not data or 'notifications' not in data:
        return jsonify({
            'success': False,
            'error': 'No notifications provided'
        }), 400
    
    notifications = data['notifications']
    results = []
    
    for notification in notifications:
        result = predict_notification(notification)
        results.append(result)
    
    return jsonify({
        'success': True,
        'results': results
    })

@app.route('/model_info', methods=['GET'])
def model_info():
    """Get model information"""
    if model is None:
        return jsonify({
            'success': False,
            'error': 'Model not loaded'
        }), 500
    
    return jsonify({
        'success': True,
        'model_type': type(model).__name__,
        'feature_columns': feature_columns,
        'action_classes': label_encoders['action'].classes_.tolist() if 'action' in label_encoders else [],
        'num_features': len(feature_columns) if feature_columns else 0
    })

@app.route('/retrain', methods=['POST'])
def retrain():
    """Retrain the model with new data"""
    try:
        from train_model import NotificationClassifier
        
        classifier = NotificationClassifier()
        accuracy = classifier.train('dataset.csv')
        classifier.save_model()
        
        # Reload the model
        load_model()
        
        return jsonify({
            'success': True,
            'accuracy': accuracy,
            'message': 'Model retrained successfully'
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("Starting FocusFlow AI ML Prediction API...")
    
    # Load the model
    if load_model():
        print("Model loaded successfully")
    else:
        print("Warning: Model not loaded. Please train the model first using train_model.py")
    
    app.run(host='0.0.0.0', port=5001, debug=True)
