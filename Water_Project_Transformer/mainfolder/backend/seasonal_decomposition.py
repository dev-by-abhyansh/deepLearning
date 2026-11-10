import numpy as np
from scipy import signal
from scipy.interpolate import interp1d

class SeasonalDecomposition:
    """
    Advanced seasonal decomposition for water quality time series.
    Implements STL (Seasonal-Trend decomposition using LOESS) and Fourier analysis.
    """
    def __init__(self, period=12, model='additive'):
        self.period = period
        self.model = model

    def decompose_stl(self, df_station):
        """STL decomposition for extracting seasonal components"""
        try:
            import statsmodels.api as sm

            # Prepare time index
            n_points = len(df_station)
            time_index = pd.date_range('2019-01-01', periods=n_points, freq='M')

            # Resample to ensure regular frequency
            wqi_series = pd.Series(df_station['WQI'].values, index=time_index)

            # STL decomposition
            stl_decomposition = sm.tsa.STL(
                wqi_series,
                period=self.period,
                model=self.model,
                seasonal_smooth=0.6,
                trend_smooth=0.6
            ).fit()

            df_station['decomposed_trend'] = stl_decomposition.trend.values
            df_station['decomposed_seasonal'] = stl_decomposition.seasonal.values
            df_station['decomposed_residuals'] = stl_decomposition.resid.values

            # Additional seasonal features
            df_station['seasonal_amplitude'] = abs(stl_decomposition.seasonal).max()
            df_station['seasonal_phase'] = self.calculate_seasonal_phase(stl_decomposition.seasonal)
            df_station['seasonal_autocorrelation'] = self.autocorrelation_at_lag(stl_decomposition.seasonal, self.period)

        except ImportError:
            # Fallback implementation if statsmodels not available
            df_station = self.fallback_seasonal_decomposition(df_station)

        return df_station

    def extract_fourier_features(self, df_station):
        """Extract Fourier series coefficients for seasonal patterns"""
        try:
            from scipy.fft import rfft, irfft

            n_points = len(df_station)
            # Calculate Fourier coefficients
            real_coeffs = rfft(df_station['WQI'].values)

            # Extract first 5 frequency components
            for i in range(1, 6):
                df_station[f'fourier_cos_{i}'] = real_coeffs[i].real
                df_station[f'fourier_sin_{i}'] = real_coeffs[i].imag

            # Calculate frequency power
            df_station['fourier_power_total'] = np.sum(np.abs(real_coeffs) ** 2)
            df_station['dominant_frequency'] = np.argmax(np.abs(real_coeffs[1:])) + 1

        except ImportError:
            # Fallback implementation
            df_station['fourier_cos_1'] = 0
            df_station['fourier_sin_1'] = 0
            df_station['dominant_frequency'] = 0

        return df_station

    def calculate_seasonal_phase(self, seasonal_series):
        """Calculate seasonal phase angle"""
        # Calculate phase using cross-correlation with sine wave
        n = len(seasonal_series)
        sine_wave = np.sin(2 * np.pi * np.arange(n) / self.period)

        # Cross-correlation to find phase
        correlation = np.correlate(seasonal_series, sine_wave, mode='full')
        peak_index = np.argmax(np.abs(correlation))
        phase = (peak_index - (n - 1)) % self.period

        return phase

    def autocorrelation_at_lag(self, series, lag):
        """Calculate autocorrelation at specific lag"""
        if lag >= len(series):
            return 0.0

        correlation = np.corrcoef(series[:-lag], series[lag:])[0, 1]
        return correlation if not np.isnan(correlation) else 0.0

    def fallback_seasonal_decomposition(self, df_station):
        """Fallback implementation for seasonal decomposition"""
        # Simple moving average trend extraction
        df_station['decomposed_trend'] = df_station.groupby('Station_Code')['WQI'].transform(
            lambda x: x.rolling(window=12, min_periods=1).mean()
        )

        # Seasonal component as deviation from trend
        df_station['decomposed_seasonal'] = df_station['WQI'] - df_station['decomposed_trend']
        df_station['decomposed_residuals'] = df_station['WQI'] - df_station['decomposed_trend'] - df_station['decomposed_seasonal']

        # Simplified seasonal features
        df_station['seasonal_amplitude'] = df_station['decomposed_seasonal'].abs().max()
        df_station['dominant_frequency'] = 12 // self.period

        return df_station

    def complete_seasonal_analysis(self, df_station):
        """Perform comprehensive seasonal analysis"""
        df_station = self.decompose_stl(df_station)
        df_station = self.extract_fourier_features(df_station)
        return df_station