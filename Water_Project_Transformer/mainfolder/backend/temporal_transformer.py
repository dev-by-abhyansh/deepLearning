import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
import pandas as pd
import numpy as np

class TemporalTransformer(nn.Module):
    """
    Advanced Transformer model for water quality prediction with temporal attention.
    Uses sinusoidal positional encoding and multi-head temporal attention.
    """
    def __init__(self, n_features, n_classes, d_model=64, n_heads=8, num_layers=6):
        super().__init__()

        # Feature embedding with temporal encoding
        self.feature_embedding = nn.Linear(1, d_model)
        self.temporal_encoding = TemporalPositionalEncoding(d_model)

        # Multi-head temporal attention blocks
        self.temporal_self_attention = nn.ModuleList([
            nn.MultiheadAttention(d_model, n_heads) for _ in range(num_layers)
        ])

        # Temporal convolutional layers
        self.temporal_convolution = nn.Sequential(
            nn.Conv1d(d_model, d_model, kernel_size=3, padding='same'),
            nn.ReLU(),
            nn.Conv1d(d_model, d_model, kernel_size=5, padding='same'),
            nn.ReLU(),
            nn.Conv1d(d_model, d_model, kernel_size=7, padding='same'),
            nn.ReLU()
        )

        # Temporal pooling and classification
        self.temporal_pool = nn.AdaptiveAvgPool1d(1)
        self.feature_gate = nn.Sequential(
            nn.Linear(d_model, d_model // 2),
            nn.Sigmoid()
        )

        # Classification head
        self.classifier = nn.Sequential(
            nn.Linear(d_model, 32),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(32, 16),
            nn.ReLU(),
            nn.Linear(16, n_classes)
        )

    def forward(self, x):
        """Forward pass with temporal attention and convolutions"""
        # x shape: (batch, sequence_length, n_features)

        # Embed features and add temporal encoding
        embedded = self.feature_embedding(x.unsqueeze(-1)).transpose(1, 2)
        embedded = self.temporal_encoding(embedded)

        # Apply temporal self-attention
        for attention_layer in self.temporal_self_attention:
            embedded, _ = attention_layer(embedded, embedded, embedded)

        # Apply temporal convolutions
        embedded = embedded.transpose(1, 2)  # (batch, d_model, sequence)
        embedded = embedded.unsqueeze(2)  # Add channel dimension

        # Apply temporal convolutions with correct dimensions
        conv_output = self.temporal_convolution(embedded)

        conv_output = conv_output.squeeze(2)  # Remove channel dimension
        conv_output = conv_output.transpose(1, 2)  # (batch, sequence, d_model)

        # Apply feature gating
        gate_weights = self.feature_gate(embedded.mean(dim=1, keepdim=True))
        gated_output = embedded * gate_weights

        # Temporal pooling
        pooled = self.temporal_pool(gated_output.transpose(1, 2)).squeeze(-1)

        # Classification
        return self.classifier(pooled)


class TemporalPositionalEncoding(nn.Module):
    """
    Sinusoidal positional encoding for temporal sequences.
    """
    def __init__(self, d_model: int, max_len: int = 5000):
        super().__init__()

        # Create positional encoding matrix
        pos_encoding = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len, dtype=torch.float32).unsqueeze(1)

        # Calculate positional encodings
        div_term = torch.exp(torch.arange(0, d_model, 2).float() * (-np.log(10000.0) / d_model))

        pos_encoding[:, 0::2] = torch.sin(position * div_term)
        pos_encoding[:, 1::2] = torch.cos(position * div_term)

        # Register as buffer (not parameter)
        self.register_buffer('pos_encoding', pos_encoding)

    def forward(self, x):
        """Add positional encoding to input"""
        seq_len = x.size(1)
        return x + self.pos_encoding[:seq_len, :].unsqueeze(0)


class EnhancedTransformerForTemporalPrediction(nn.Module):
    """
    Enhanced Transformer with specialized temporal components for water quality prediction.
    Combines standard Transformer architecture with temporal-specific enhancements.
    """
    def __init__(self, n_features, n_classes):
        super().__init__()

        # Input projection to model dimension
        self.input_projection = nn.Linear(n_features, 64)

        # Multi-scale temporal attention
        self.short_term_attention = nn.MultiheadAttention(64, 8)
        self.medium_term_attention = nn.MultiHeadAttention(64, 4)

        # Temporal aggregation layers
        self.temporal_aggregation = nn.ModuleList([
            nn.Sequential(
                nn.Conv1d(64, 64, kernel_size=3, padding='same'),
                nn.ReLU(),
                nn.BatchNorm1d(64)
            )
            for _ in range(3)
        ])

        # Temporal pooling and classification
        self.temporal_pool = nn.AdaptiveAvgPool1d(1)
        self.classifier = self.build_classifier()

    def build_classifier(self):
        return nn.Sequential(
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(32, 16),
            nn.ReLU(),
            nn.Linear(16, 3)
        )

    def forward(self, x):
        """Forward pass with multi-scale temporal attention"""
        # Project input features
        embedded = self.input_projection(x).transpose(1, 2)  # (batch, 64, seq_len)

        # Apply multi-scale temporal attention
        # Short-term patterns
        short_attn, _ = self.short_term_attention(embedded, embedded, embedded)

        # Medium-term patterns
        medium_attn, _ = self.medium_term_attention(embedded, embedded, embedded)

        # Combine features
        combined = torch.cat([short_attn, medium_attn], dim=1)
        combined = combined.transpose(1, 2)  # (batch, seq_len, 64)

        # Apply temporal aggregation
        for conv_layer in self.temporal_aggregation:
            combined = combined.unsqueeze(2)  # Add channel dimension
            combined = conv_layer(combined).squeeze(2)
            combined = torch.relu(combined)

        # Temporal pooling
        pooled = self.temporal_pool(combined.transpose(1, 2)).squeeze(-1)

        # Classification
        return self.classifier(pooled)


class TransformerEnsemble:
    """
    Ensemble of multiple Transformer models for robust temporal prediction.
    Includes uncertainty estimation and model diversity.
    """
    def __init__(self, models, feature_extractors, model_configs):
        self.models = []
        self.feature_extractors = feature_extractors
        self.model_configs = model_configs

        # Initialize ensemble models
        for config in model_configs:
            model = self.create_model(config)
            self.models.append(model)

    def create_model(self, config):
        """Create transformer model based on configuration"""
        if config['type'] == 'standard':
            return TemporalTransformer(
                n_features=config['n_features'],
                n_classes=config['n_classes'],
                d_model=config.get('d_model', 64),
                n_heads=config.get('n_heads', 8)
            )
        elif config['type'] == 'enhanced':
            return EnhancedTransformerForTemporalPrediction(
                n_features=config['n_features'],
                n_classes=config['n_classes']
            )
        else:
            raise ValueError(f"Unknown model type: {config['type']}")

    def predict_ensemble(self, features, feature_extractor_index):
        """Make predictions using ensemble of models"""
        # Extract features using specified feature extractor
        feature_extractor = self.feature_extractors[feature_extractor_index]
        extracted_features = feature_extractor(features)

        # Get predictions from all models
        predictions = []
        uncertainties = []

        for model in self.models:
            model.eval()
            with torch.no_grad():
                pred = model(extracted_features)
                predictions.append(pred)

                # Calculate model uncertainty (dropout variance)
                dropout_output = model(extracted_features)
                uncertainties.append(torch.std(dropout_output))

        # Combine ensemble predictions
        ensemble_pred = torch.mean(torch.stack(predictions), dim=0)
        ensemble_uncertainty = torch.mean(torch.stack(uncertainties), dim=0)

        return ensemble_pred, ensemble_uncertainty

    def uncertainty_calibration(self, validation_data):
        """Calibrate ensemble uncertainties using validation data"""
        # Calculate predicted vs actual uncertainty
        # Apply calibration if needed
        return self.calibration_factor