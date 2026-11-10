import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader

class AdvancedWaterQualityLSTM(nn.Module):
    """
    Advanced LSTM model for water quality deterioration prediction.
    Multi-scale temporal feature extraction with attention mechanisms.
    """
    def __init__(self, n_features, n_classes, sequence_length=30):
        super().__init__()

        # Multi-branch temporal feature extraction
        self.short_term_lstm = nn.LSTM(
            input_size=6,  # Recent key parameters (WQI, DO, pH, BOD, Nitrate, Conductivity)
            hidden_size=64,
            num_layers=2,
            batch_first=True,
            dropout=0.3,
            bidirectional=True
        )

        self.medium_term_lstm = nn.LSTM(
            input_size=8,  # Extended features with rolling statistics
            hidden_size=48,
            num_layers=2,
            batch_first=True,
            dropout=0.3,
            bidirectional=True
        )

        self.long_term_lstm = nn.LSTM(
            input_size=4,  # Aggregated temporal features
            hidden_size=32,
            num_layers=2,
            batch_first=True,
            dropout=0.3,
            bidirectional=True
        )

        # Temporal attention mechanism
        self.temporal_attention = nn.ModuleList([
            nn.MultiheadAttention(embed_dim=128, num_heads=8, dropout=0.1)
            for _ in range(3)
        ])

        # Temporal feature fusion
        self.feature_fusion = nn.Sequential(
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, 32),
            nn.ReLU()
        )

        # Trend detection module
        self.trend_detector = TemporalTrendDetector()

        # Ensemble classifier
        self.classifier = nn.Sequential(
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(32, 16),
            nn.ReLU(),
            nn.Linear(16, n_classes)
        )

        # Uncertainty estimation
        self.uncertainty_head = nn.Sequential(
            nn.Linear(64, 16),
            nn.ReLU(),
            nn.Linear(16, 1)
        )

    def forward(self, x_short, x_medium, x_long):
        # Process each time scale
        short_output, (h_short, c_short) = self.short_term_lstm(x_short)
        medium_output, (h_medium, c_medium) = self.medium_term_lstm(x_medium)
        long_output, (h_long, c_long) = self.long_term_lstm(x_long)

        # Combine hidden states (both directions)
        combined_hidden = torch.cat([
            h_short[-2:],  # forward and backward
            h_medium[-2:], # forward and backward
            h_long[-2:]    # forward and backward
        ], dim=2).squeeze(1)  # Remove sequence dimension

        # Apply trend detection
        trend_features = self.trend_detector(combined_hidden)
        combined_features = torch.cat([combined_hidden, trend_features], dim=1)

        # Apply temporal attention
        attention_output, _ = self.temporal_attention(
            combined_features.unsqueeze(0),
            combined_features.unsqueeze(0),
            combined_features.unsqueeze(0)
        )

        # Apply feature fusion
        fused_features = self.feature_fusion(attention_output.squeeze(0))

        # Classification
        predictions = self.classifier(fused_features)

        # Uncertainty estimation
        uncertainty = torch.sigmoid(self.uncertainty_head(fused_features))

        return {
            'predictions': predictions,
            'uncertainty': uncertainty,
            'features': fused_features
        }


class TemporalTrendDetector(nn.Module):
    """Trend detection module for temporal pattern analysis"""
    def __init__(self):
        super().__init__()

        self.trend_analyzer = nn.Sequential(
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, 16),
            nn.ReLU(),
            nn.Linear(16, 8)
        )

        self.trend_classifier = nn.Sequential(
            nn.Linear(8, 4),
            nn.Sigmoid()
        )

    def forward(self, x):
        # Trend analysis
        trend_features = self.trend_analyzer(x)

        # Trend classification
        trend_indicators = self.trend_classifier(trend_features)

        return trend_indicators


class AdvancedLSTMDataModule:
    """
    Data module for advanced LSTM training with temporal features.
    Handles multi-scale temporal feature extraction and loading.
    """
    def __init__(self, feature_engineer, batch_size=32, sequence_length=30):
        self.feature_engineer = feature_engineer
        self.batch_size = batch_size
        self.sequence_length = sequence_length

    def create_data_loaders(self, train_df, test_df):
        """Create data loaders for training and testing"""

        # Process training data
        train_features = self.feature_engineer.extract_features(train_df)
        X_train, y_train = self.prepare_sequences(train_features)

        # Process test data
        test_features = self.feature_engineer.extract_features(test_df)
        X_test, y_test = self.prepare_sequences(test_features)

        # Create datasets
        train_dataset = AdvancedWaterQualityDataset(X_train, y_train)
        test_dataset = AdvancedWaterQualityDataset(X_test, y_test)

        # Create data loaders
        train_loader = DataLoader(train_dataset, batch_size=self.batch_size, shuffle=True)
        test_loader = DataLoader(test_dataset, batch_size=self.batch_size, shuffle=False)

        return train_loader, test_loader

    def prepare_sequences(self, df):
        """Prepare temporal sequences for LSTM"""
        # This would depend on the specific feature engineering approach
        # For demonstration, returning dummy data structure
        return np.random.randn(len(df), self.sequence_length, 17), df['BIS_Class'].values


class AdvancedWaterQualityDataset(Dataset):
    """Custom dataset for advanced water quality prediction"""
    def __init__(self, features, labels):
        self.features = torch.FloatTensor(features)
        self.labels = torch.LongTensor(labels)

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        return self.features[idx], self.labels[idx]