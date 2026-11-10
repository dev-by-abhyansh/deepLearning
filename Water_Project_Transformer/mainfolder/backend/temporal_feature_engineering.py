import pandas as pd
import numpy as np

class EnhancedTemporalFeatureEngineer:
    """
    Advanced temporal feature engineering for water quality deterioration prediction.
    Extracts multi-scale lag features, advanced rolling statistics, and seasonal components.
    """
    def __init__(self):
        self.lag_windows = [1, 3, 7, 14, 30, 60]
        self.rolling_windows = [3, 7, 14, 30]

    def extract_features(self, df_station):
        df_station = df_station.sort_values(['Station_Code', 'Year']).reset_index(drop=True)

        # 1. Multi-scale lag features
        for lag in self.lag_windows:
            df_station[f'wqi_lag_{lag}'] = df_station.groupby('Station_Code')['WQI'].shift(lag)
            df_station[f'growth_lag_{lag}'] = df_station.groupby('Station_Code')['Pollution_Growth_Rate'].shift(lag)
            df_station[f'do_lag_{lag}'] = df_station.groupby('Station_Code')['DO'].shift(lag)
            df_station[f'bod_lag_{lag}'] = df_station.groupby('Station_Code')['BOD'].shift(lag)

        # 2. Advanced rolling statistics
        for window in self.rolling_windows:
            df_station[f'wqi_rolling_mean_{window}'] = df_station.groupby('Station_Code')['WQI'].transform(lambda x: x.rolling(window, min_periods=1).mean())
            df_station[f'wqi_rolling_std_{window}'] = df_station.groupby('Station_Code')['WQI'].transform(lambda x: x.rolling(window, min_periods=1).std()).fillna(0)
            df_station[f'wqi_rolling_min_{window}'] = df_station.groupby('Station_Code')['WQI'].transform(lambda x: x.rolling(window, min_periods=1).min())
            df_station[f'wqi_rolling_max_{window}'] = df_station.groupby('Station_Code')['WQI'].transform(lambda x: x.rolling(window, min_periods=1).max())
            df_station[f'wqi_rolling_range_{window}'] = df_station[f'wqi_rolling_max_{window}'] - df_station[f'wqi_rolling_min_{window}']

        # 3. Trend and velocity features
        df_station['wqi_velocity'] = df_station['WQI'] - df_station.groupby('Station_Code')['WQI'].shift(1)
        df_station['wqi_acceleration'] = df_station['wqi_velocity'] - df_station.groupby('Station_Code')['wqi_velocity'].shift(1)

        # Fill missing values
        df_station = df_station.fillna(method='bfill').fillna(0)
        return df_station
