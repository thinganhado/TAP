from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
from geopy.distance import geodesic
from datetime import datetime
import os
import logging
import sys

# Add the parent directory to path to import from config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configuration - assuming .pkl files are in the same directory as this script
CONFIG_DIR = os.path.join(os.path.dirname(__file__), 'config')
MODELS_DIR = os.path.join(os.path.dirname(__file__), 'config')

# Global variables for models and configurations
models = {}
feature_config = {}
threshold_config = {}
risk_zones_df = None

class FraudDetectionEngine:
    """Core fraud detection engine that processes transactions"""
    
    def __init__(self, models, feature_config, threshold_config, risk_zones_df):
        self.models = models
        self.feature_config = feature_config
        self.threshold_config = threshold_config
        self.risk_zones_df = risk_zones_df
        
    def calculate_features_for_new_client(self, transaction_data):
        """
        Calculate ALL 9 features for a new client (no history available)
        This matches the feature engineering from the training phase
        """
        features = {}
        
        # Extract basic info
        lat = transaction_data['latitude']
        lon = transaction_data['longitude']
        timestamp = pd.to_datetime(transaction_data['event_time'])
        
        # 1. Geographic risk (from pre-computed risk zones) - COMPOSITE FEATURE
        features['geo_risk'] = 0
        for _, zone in self.risk_zones_df.iterrows():
            if (zone['min_lat'] <= lat <= zone['max_lat'] and 
                zone['min_lon'] <= lon <= zone['max_lon']):
                features['geo_risk'] = max(features['geo_risk'], zone['risk_score'])
        
        # 2. Distance from home - for new clients, home = current location - GEOGRAPHIC FEATURE
        features['distance_from_home'] = 0.0  # Current location is considered home
        
        # 3. Temporal features (same as training) - TEMPORAL FEATURES
        features['hour_of_day'] = timestamp.hour
        features['is_night'] = 1 if (timestamp.hour >= 22 or timestamp.hour <= 6) else 0
        features['day_of_week'] = timestamp.weekday()
        features['is_weekend'] = 1 if timestamp.weekday() >= 5 else 0
        
        # 4. Behavioral features - DEFAULT VALUES FOR NEW CLIENTS - BEHAVIORAL FEATURES
        features['velocity_kmh'] = 0       # No previous transaction to calculate velocity
        features['transaction_count'] = 0  # First transaction
        features['client_age_days'] = 0    # New client
        
        # Verify we have all 9 features
        expected_features = ['geo_risk', 'distance_from_home', 'velocity_kmh', 
                           'transaction_count', 'client_age_days', 'hour_of_day', 
                           'is_night', 'day_of_week', 'is_weekend']
        
        missing_features = set(expected_features) - set(features.keys())
        if missing_features:
            logger.error(f"Missing features: {missing_features}")
            raise ValueError(f"Missing features: {missing_features}")
        
        logger.info(f"Generated {len(features)} features for transaction")
        return features
    
    def predict(self, features):
        """Generate prediction using the ensemble model approach"""
        try:
            # Convert features to array in the right order
            feature_columns = self.feature_config['feature_columns']
            logger.info(f"Expected feature columns: {feature_columns}")
            logger.info(f"Available features: {list(features.keys())}")
            
            # Verify we have all required features
            missing_features = set(feature_columns) - set(features.keys())
            if missing_features:
                logger.error(f"Missing required features: {missing_features}")
                raise ValueError(f"Missing required features: {missing_features}")
            
            # Create feature vector in correct order
            X = np.array([features[col] for col in feature_columns]).reshape(1, -1)
            logger.info(f"Feature vector shape: {X.shape}")
            
            # Extract feature groups for specialist models using pre-calculated indices
            X_temporal = X[:, self.feature_config['temporal_indices']]
            X_geo = X[:, self.feature_config['geographic_indices']]
            X_behavioral = X[:, self.feature_config['behavioral_indices']]
            X_composite = X
            
            logger.info(f"Temporal features shape: {X_temporal.shape}")
            logger.info(f"Geographic features shape: {X_geo.shape}")
            logger.info(f"Behavioral features shape: {X_behavioral.shape}")
            logger.info(f"Composite features shape: {X_composite.shape}")
            
            # Get probabilities from all specialists
            proba_temporal = self.models['temporal'].predict_proba(X_temporal)[0, 1]
            proba_geo = self.models['geographical'].predict_proba(X_geo)[0, 1]
            proba_behavioral = self.models['behavioral'].predict_proba(X_behavioral)[0, 1]
            proba_composite = self.models['composite'].predict_proba(X_composite)[0, 1]
            
            # Create meta-features
            meta_features = np.array([[
                proba_temporal,
                proba_geo,
                proba_behavioral,
                proba_composite
            ]])
            
            # Get final prediction from meta-model
            final_proba = self.models['meta'].predict_proba(meta_features)[0, 1]
            prediction = 1 if final_proba >= self.threshold_config['optimal_threshold'] else 0
            
            return {
                'prediction': prediction,
                'probability': final_proba,
                'specialist_probas': {
                    'temporal': round(proba_temporal, 4),
                    'geographical': round(proba_geo, 4),
                    'behavioral': round(proba_behavioral, 4),
                    'composite': round(proba_composite, 4)
                },
                'threshold': self.threshold_config['optimal_threshold'],
                'is_new_client': True,
                'features_used': len(feature_columns)
            }
            
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            raise

def load_models_and_config():
    """Load all trained models and configurations"""
    global models, feature_config, threshold_config, risk_zones_df
    
    try:
        # Load models
        models = {
            'temporal': joblib.load(f'{MODELS_DIR}/temporal_model.pkl'),
            'geographical': joblib.load(f'{MODELS_DIR}/geo_model.pkl'),
            'behavioral': joblib.load(f'{MODELS_DIR}/behavioral_model.pkl'),
            'composite': joblib.load(f'{MODELS_DIR}/composite_model.pkl'),
            'meta': joblib.load(f'{MODELS_DIR}/meta_model.pkl')
        }
        
        # Load configurations
        feature_config = joblib.load(f'{MODELS_DIR}/feature_config.pkl')
        threshold_config = joblib.load(f'{MODELS_DIR}/threshold_config.pkl')
        risk_zones_df = pd.read_pickle(f'{MODELS_DIR}/risk_zones.pkl')
        
        logger.info("All models and configurations loaded successfully")
        logger.info(f"Feature columns: {feature_config['feature_columns']}")
        logger.info(f"Temporal indices: {feature_config['temporal_indices']}")
        logger.info(f"Geographic indices: {feature_config['geographic_indices']}")
        logger.info(f"Behavioral indices: {feature_config['behavioral_indices']}")
        logger.info(f"Composite indices: {feature_config['composite_indices']}")
        
        return True
        
    except Exception as e:
        logger.error(f"Error loading models: {e}")
        return False

# Initialize the fraud detection engine
def init_engine():
    """Initialize the fraud detection engine"""
    if load_models_and_config():
        return FraudDetectionEngine(models, feature_config, threshold_config, risk_zones_df)
    else:
        return None

fraud_engine = init_engine()

# API Routes
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    status = 'healthy' if fraud_engine is not None else 'unhealthy'
    return jsonify({
        'status': status,
        'timestamp': datetime.now().isoformat(),
        'models_loaded': fraud_engine is not None,
        'assumption': 'all_clients_are_new',
        'expected_features': 9 if fraud_engine else 0
    })

@app.route('/api/predict', methods=['POST'])
def predict_single():
    """Predict fraud for a single transaction (assumes new client)"""
    if fraud_engine is None:
        return jsonify({'error': 'Models not loaded'}), 500
    
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['client_id', 'event_time', 'latitude', 'longitude']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Calculate ALL 9 features for new client
        features = fraud_engine.calculate_features_for_new_client(data)
        
        # Generate prediction
        result = fraud_engine.predict(features)
        
        # Add feature information
        result['features'] = {k: round(v, 4) if isinstance(v, float) else v 
                             for k, v in features.items()}
        result['client_id'] = data['client_id']
        result['event_time'] = data['event_time']
        result['timestamp'] = datetime.now().isoformat()
        result['assumption'] = 'new_client_no_history'
        
        logger.info(f"Prediction for client {data['client_id']}: {'FRAUD' if result['prediction'] else 'LEGITIMATE'} (prob: {result['probability']:.4f})")
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/predict-batch', methods=['POST'])
def predict_batch():
    """Predict fraud for a batch of transactions from CSV (all treated as new clients)"""
    if fraud_engine is None:
        return jsonify({'error': 'Models not loaded'}), 500
    
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not file.filename.endswith('.csv'):
            return jsonify({'error': 'File must be a CSV'}), 400
        
        # Read CSV file
        df = pd.read_csv(file)
        
        # Validate required columns
        required_columns = ['client_id', 'event_time', 'latitude', 'longitude']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            return jsonify({'error': f'Missing columns: {missing_columns}'}), 400
        
        results = []
        
        for index, row in df.iterrows():
            client_id = row['client_id']
            transaction_data = row.to_dict()
            
            # Calculate ALL 9 features for new client
            features = fraud_engine.calculate_features_for_new_client(transaction_data)
            
            # Generate prediction
            prediction_result = fraud_engine.predict(features)
            
            # Store result
            result = {
								'row_index': int(index),
								'client_id': str(client_id),  # Ensure string type
								'event_time': str(row['event_time']),  # Ensure string type
								'prediction': int(prediction_result['prediction']),
								'probability': float(prediction_result['probability']),
								'features': {k: float(v) if isinstance(v, (np.floating, float)) else int(v) if isinstance(v, (np.integer, int)) else str(v) 
													for k, v in features.items()},
								'specialist_probas': {k: float(v) for k, v in prediction_result['specialist_probas'].items()},
								'is_new_client': True
						}
            results.append(result)
        
        # Calculate summary statistics
        fraud_count = sum(1 for r in results if r['prediction'] == 1)
        total_count = len(results)
        
        logger.info(f"Batch prediction completed: {fraud_count}/{total_count} transactions flagged as fraud")
        
        return jsonify({
            'total_transactions': total_count,
            'fraud_count': fraud_count,
            'legitimate_count': total_count - fraud_count,
            'fraud_percentage': (fraud_count / total_count * 100) if total_count > 0 else 0,
            'results': results,
            'timestamp': datetime.now().isoformat(),
            'assumption': 'all_clients_treated_as_new',
            'features_used': 9
        })
        
    except Exception as e:
        logger.error(f"Batch prediction error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/models/status', methods=['GET'])
def models_status():
    """Get information about loaded models"""
    if fraud_engine is None:
        return jsonify({'error': 'Models not loaded'}), 500
    
    return jsonify({
        'models_loaded': list(models.keys()),
        'feature_groups': {
            'temporal': feature_config['temporal_features'],
            'geographical': feature_config['geographic_features'],
            'behavioral': feature_config['behavioral_features'],
            'composite': feature_config['composite_features']
        },
        'threshold': threshold_config['optimal_threshold'],
        'risk_zones_count': len(risk_zones_df),
        'expected_features': 9,
        'assumption': 'all_clients_are_new_no_database'
    })

@app.route('/api/sample-csv', methods=['GET'])
def sample_csv():
    """Provide a sample CSV structure for users"""
    sample_data = {
        'columns': ['client_id', 'event_time', 'latitude', 'longitude'],
        'sample_rows': [
            ['client_001', '2023-05-15 14:30:00', 40.7128, -74.0060],
            ['client_002', '2023-05-15 15:45:00', 34.0522, -118.2437],
            ['client_003', '2023-05-15 16:20:00', 41.8781, -87.6298]
        ],
        'description': 'Upload a CSV with these columns. All clients will be treated as new (no history).',
        'expected_features': 9
    }
    return jsonify(sample_data)

if __name__ == '__main__':
    if fraud_engine is not None:
        logger.info("Starting Fraud Detection API server...")
        logger.info("Assumption: All clients are treated as NEW (no history available)")
        logger.info("Database integration: NOT ENABLED (PostgreSQL connection pending)")
        logger.info(f"Expected features per transaction: 9")
        app.run(host='0.0.0.0', port=5000, debug=False)
    else:
        logger.error("Failed to initialize fraud detection engine. Check model files.")