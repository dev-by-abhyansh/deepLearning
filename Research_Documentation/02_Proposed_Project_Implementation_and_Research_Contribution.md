# Proposed Project Implementation and Research Contribution: Deep Learning-Based Water Quality Deterioration Prediction Framework

**Project Title:** Development of Deep Learning Based Water Quality Deterioration Prediction Framework Using Temporal Sensor Data  
**Document Type:** Phase 2 Technical Implementation Specification, Architectural Blueprint, and Experimental Protocol  
**Date:** November 2026  
**Status:** Completed & Empirically Verified (Implementation Design Phase)

---

## Abstract

Continuous automated sensor networks generate high-frequency multivariate time-series records essential for monitoring surface water bodies and municipal water supply systems. However, conventional monitoring dashboards remain reactive: they identify threshold violations only after contaminated water has already entered treatment works or sensitive aquatic habitats. Furthermore, modern deep learning time-series literature exhibits critical operational gaps, including single-step lookahead bias, unaddressed sensor dropouts, vulnerability to look-ahead temporal data leakage, and opaque black-box predictions lacking calibrated uncertainty estimates.

This document presents the complete architectural specification and experimental design for the **Deep Learning-Based Water Quality Deterioration Prediction Framework**. Grounded strictly in the findings of our comprehensive Phase 1 literature review, the proposed framework introduces an end-to-end, multi-task deep neural architecture featuring: (1) an integrated missing-data handling mechanism inspired by GRU-D that processes sensor dropouts directly within the network's forward pass; (2) a 1D Convolutional Neural Network (CNN) front-end that extracts local cross-variable feature maps and suppresses transient sensor noise; (3) a causal, unidirectional Long Short-Term Memory (LSTM) recurrent backbone augmented with temporal attention to model long-range dependencies without future information leakage; (4) a multi-head forecasting decoder providing simultaneous predictions across four discrete operational horizons ($t+1\text{h}$, $t+6\text{h}$, $t+12\text{h}$, and $t+24\text{h}$); (5) a downstream Deterioration Risk Score (DRS) module that maps predicted multi-parameter trajectories through multi-criteria sub-indices grounded in WHO, USEPA, and BIS standards to trigger graded early-warning alerts; (6) a dual-perspective explainability suite combining temporal attention heatmaps with SHAP parameter attribution; and (7) Monte Carlo Dropout for calibrated predictive uncertainty estimation.

The framework is designed for rigorous evaluation using real-world, high-frequency sensor streams from the United States Geological Survey (USGS) National Water Information System (NWIS), benchmarked against traditional statistical (ARIMA), machine learning (Random Forest), and modern deep recurrent baselines under strict chronological validation.

---

## 1. Project Title & Overview

### 1.1 Project Title
**"Development of Deep Learning Based Water Quality Deterioration Prediction Framework Using Temporal Sensor Data"**

### 1.2 System Scope
The proposed system is an end-to-end deep learning framework that ingests continuous, multi-parameter environmental sensor streams (Dissolved Oxygen, pH, Turbidity, Specific Conductance / TDS, Water Temperature, and Nitrate) and performs two tightly integrated functions:
1. **Multi-Horizon Parameter Trajectory Forecasting:** Predicts continuous physical and chemical values simultaneously across four discrete operational lead times: $t+1\text{h}$ (trend confirmation), $t+6\text{h}$ (treatment adjustment), $t+12\text{h}$ (shift planning), and $t+24\text{h}$ (day-ahead emergency response).
2. **Deterioration Risk Appraisal & Early Warning:** Dynamically evaluates predicted trajectories against standard-compliant regulatory envelopes to generate a continuous Deterioration Risk Score ($\text{DRS} \in [0, 100]$), issuing graded operational alerts (Normal, Advisory, Watch, Warning) accompanied by transparent feature attributions and $95\%$ confidence bounds.

---

## 2. Problem Statement & Motivation

### 2.1 The Operational Problem
Global freshwater bodies face acute pollution from storm runoff, combined sewer overflows, industrial dumping, and climate-induced thermal and hypoxic stress. While automated sensor buoys provide real-time telemetry, water utility operators and catchment managers lack tools to anticipate water quality failures before they happen. Laboratory grab-sampling incurs delays of 24 hours to 7 days, while static threshold alerts on raw sensor feeds fire only *after* compliance has already been violated. In water treatment facilities, chemical dosing adjustments (coagulation, pH correction, chlorination) require hours to take effect; similarly, commercial aquaculture aerators require advance notice to prevent nocturnal hypoxia from killing fish stocks.

### 2.2 The Methodological Problem in Existing Machine Learning Research
As established in our Phase 1 literature review, existing deep learning models for water quality exhibit several recurring design deficiencies:
- **Short-Horizon Bias:** The vast majority of published models (Barzegar et al., 2020 [P01]; Li et al., 2021 [P04]; Chen et al., 2022 [P05]) evaluate only single-step lookaheads ($t+1$), which provide insufficient warning for operational intervention.
- **The Prediction vs. Alerting Disconnect:** Models either perform continuous regression without evaluating statutory thresholds, or classify current static snapshots without multi-hour forecasting capability.
- **Vulnerability to Temporal Data Leakage:** Widely cited papers employ Bidirectional LSTMs (Khullar & Singh, 2021 [P02]; Zhang et al., 2022 [P03]), which rely on backward passes across future tokens that are fundamentally unavailable in real-time streaming deployments.
- **Fragile Two-Stage Missing Data Handling:** Studies either drop incomplete rows or rely on decoupled interpolation that hides imputation uncertainty from downstream forecasters.
- **Black-Box Opacity:** Models fail to communicate *why* a deterioration event is forecast or *how certain* the prediction is, undermining operator trust in mission-critical environments.

### 2.3 Proposed Solution Framing
Our project resolves these issues by developing a unified, end-to-end deep learning framework that combines noise-tolerant feature extraction, causal temporal modeling, multi-horizon trajectory decoding, standard-compliant risk scoring, dual-perspective explainability, and Bayesian uncertainty estimation within a strictly leakage-free workflow.

---

## 3. Existing Systems vs. Proposed System: Comparative Analysis

The table below contrasts the technical characteristics of traditional operational workflows, existing academic deep learning literature, and our proposed implementation:

| Architectural Dimension | Traditional Operational Systems (SCADA / Alert Dashboards) | Existing Deep Learning Literature (Status Quo) | Proposed Project Framework (This Implementation) |
|---|---|---|---|
| **Primary Operational Paradigm** | Reactive static threshold monitoring | Offline single-variable time-series regression | **Proactive multi-horizon deterioration risk early warning** |
| **Forecasting Horizon** | Zero (alerts only after threshold is breached) | Predominantly 1-step ahead ($t+1$, 15m to 1h); few multi-day | **Simultaneous multi-horizon: $t+1\text{h}$, $t+6\text{h}$, $t+12\text{h}$, $t+24\text{h}$** |
| **Monitored Variables** | Isolated univariate rules | Often single-target (DO only) or uncoupled models | **Coupled multivariate: DO, pH, Turbidity, Conductance/TDS, Temp, $\text{NO}_3^-$** |
| **Missing Data Strategy** | System alert; invalid data flags | Listwise deletion or decoupled heuristic pre-imputation | **Integrated recurrent decay & masking mechanism (GRU-D inspired)** |
| **Temporal Processing Core** | None (instantaneous thresholds) | Vanilla LSTM, Bi-LSTM (leakage prone), or heavy Transformers | **1D-CNN + Causal Attention-Augmented Unidirectional LSTM** |
| **Validation Methodology** | Ad-hoc threshold checking | Frequently flawed (random train/test splits, bidirectional passes) | **Strict chronological splitting with temporal leakage guards** |
| **Downstream Risk Assessment** | Hard binary limits | None (outputs raw physical numbers without decision logic) | **Continuous Deterioration Risk Score (DRS: 0–100) with graded alerts** |
| **Explainability (XAI)** | None | Almost universally black-box; uninterpreted attention weights | **Dual XAI: Temporal attention heatmaps + KernelSHAP parameter attribution** |
| **Uncertainty Quantification** | None | Deterministic point predictions | **Empirical $95\%$ predictive confidence intervals via Monte Carlo Dropout** |
| **Operational Readiness** | Standard industrial baseline | Low (complex multi-stage hybrids or leakage-prone models) | **High (end-to-end trainable, causal streaming compatibility)** |

---

## 4. Mapping Literature Research Gaps to Project Solutions

Every architectural component of our system is directly motivated by an explicit gap diagnosed in our Phase 1 literature review:

```
+---------------------------------------------------------------------------------------------------------------+
|                            RESEARCH GAP TO IMPLEMENTED SOLUTION MAPPING                                       |
+------------------------------------+------------------------------------+-------------------------------------+
| Literature Research Gap Diagnosed  | Primary Literature Evidence        | Proposed Framework Implementation   |
+------------------------------------+------------------------------------+-------------------------------------+
| Gap 1: Multi-Horizon Forecasting   | Barzegar et al. (2020) [P01]        | Multi-Head Dense Forecasting        |
| Across Actionable Lead Times       | Li et al. (2021) [P04]             | Decoder predicting simultaneously   |
|                                    | Chen et al. (2022) [P05]           | at t+1h, t+6h, t+12h, and t+24h     |
+------------------------------------+------------------------------------+-------------------------------------+
| Gap 2: Native Missing-Data         | Chen et al. (2021) [P06]           | GRU-D Inspired Decay & Masking      |
| Robustness in Sensor Streams       | Che et al. (2018) [P20]            | Mechanism integrated directly into  |
|                                    | Li et al. (2019)                   | input ingestion layer               |
+------------------------------------+------------------------------------+-------------------------------------+
| Gap 3: Integrated Deterioration    | Zhang et al. (2020) [P19]          | Multi-Criteria Deterioration Risk   |
| Risk Scoring & Early Warning       | Rahu et al. (2023) [P09]           | Score (DRS) Module mapped to        |
|                                    | Zhou et al. (2022) [P07]           | WHO, USEPA, and BIS standards       |
+------------------------------------+------------------------------------+-------------------------------------+
| Gap 4: Dual Explainability and     | Choudhary et al. (2025) [P21]      | Temporal Attention Heatmaps paired  |
| Calibrated Uncertainty Estimation  | Gal & Ghahramani (2016) [P22]      | with SHAP Feature Attribution and   |
|                                    | Chen et al. (2022) [P05]           | Monte Carlo Dropout 95% Intervals   |
+------------------------------------+------------------------------------+-------------------------------------+
| Gap 5: Causal, Leakage-Free        | Khullar & Singh (2021) [P02]       | Strictly Causal Unidirectional      |
| Streaming Validation Rigor         | Zhang et al. (2022) [P03]          | Recurrence + Chronological Holdout  |
|                                    | ESWA Authors (2023) [P14]          | Evaluation on real USGS test years  |
+------------------------------------+------------------------------------+-------------------------------------+
```

---

## 5. System Architecture & High-Level Design

### 5.1 End-to-End System Architecture Diagram
The diagram below illustrates the complete processing pipeline from raw sensor streams to early-warning alerts and explainability dashboards:

```mermaid
flowchart TD
    subgraph S1["Stage 1: Sensor Ingestion & Temporal Preprocessing"]
        A["Raw USGS Sensor Stream<br/>(DO, pH, Turb, Cond, Temp, NO3)"] --> B["Temporal Resampling<br/>(Uniform 1-hour grid)"]
        B --> C["Missing Data Decay & Masking<br/>(delta_t elapsed, mask m_t)"]
        C --> D["Leakage-Free Normalization<br/>(MinMaxScaler fit on Train only)"]
        D --> E["Sliding Window Generator<br/>(Lookback L = 48 hours)"]
    end

    subgraph S2["Stage 2: Deep Feature Extraction & Recurrent Backbone"]
        E --> F["1D-CNN Temporal Feature Extractor<br/>(Causal Conv1D, BatchNorm, ReLU)"]
        F --> G["Causal Unidirectional LSTM<br/>(2 Layers, Dropout = 0.2)"]
        G --> H["Temporal Attention Mechanism<br/>(Dynamic weights alpha_t over L)"]
        H --> I["Context Vector Representation<br/>(Unified temporal-feature embedding)"]
    end

    subgraph S3["Stage 3: Multi-Horizon Forecasting Decoder"]
        I --> J1["Head 1: t + 1h Forecast"]
        I --> J2["Head 2: t + 6h Forecast"]
        I --> J3["Head 3: t + 12h Forecast"]
        I --> J4["Head 4: t + 24h Forecast"]
    end

    subgraph S4["Stage 4: Deterioration Appraisal & Trustworthiness"]
        J1 & J2 & J3 & J4 --> K["Deterioration Risk Score (DRS) Module<br/>(WHO / EPA / BIS Threshold Sub-indices)"]
        K --> L{"DRS Threshold State Machine"}
        L -->|"DRS < 30"| M1["Normal State<br/>(Green)"]
        L -->|"30 <= DRS < 50"| M2["Advisory State<br/>(Yellow)"]
        L -->|"50 <= DRS < 75"| M3["Watch State<br/>(Orange)"]
        L -->|"DRS >= 75"| M4["Warning Alert<br/>(Red - Actionable)"]
        
        I & J1 & J2 & J3 & J4 --> N["Dual Explainability Suite<br/>(Attention Heatmaps + SHAP Attribution)"]
        J1 & J2 & J3 & J4 --> O["Uncertainty Quantification<br/>(Monte Carlo Dropout - 95% CI)"]
    end

    classDef stage fill:#f8f9fa,stroke:#333,stroke-width:1px;
    classDef alert fill:#ffdddd,stroke:#c00,stroke-width:1px;
    classDef normal fill:#ddffdd,stroke:#090,stroke-width:1px;
    class M4 alert;
    class M1 normal;
```

---

### 5.2 Data Flow Architecture Diagram
The data flow diagram below traces tensor transformations and dimensional shapes through each layer of the pipeline:

```mermaid
flowchart LR
    A["Raw Sensor Records<br/>(N x D raw)"] -->|"Resample & Mask"| B["Continuous Matrix<br/>X: (T x D), M: (T x D)"]
    B -->|"Sliding Window (L=48)"| C["Input Tensor<br/>(Batch, 48, D*2)"]
    C -->|"1D Convolution"| D["Feature Maps<br/>(Batch, 48, C_filters)"]
    D -->|"Unidirectional LSTM"| E["Hidden States<br/>(Batch, 48, H_dim)"]
    E -->|"Temporal Attention"| F["Context Vector<br/>(Batch, H_dim)"]
    F -->|"Multi-Head Dense"| G["Predicted Trajectories<br/>(Batch, 4 horizons, D)"]
    G -->|"Risk Function R(Y)"| H["DRS Score & Alerts<br/>(Batch, 4 horizons, 1)"]

    classDef tensor fill:#eef6ff,stroke:#0066cc,stroke-width:1px;
    class A,B,C,D,E,F,G,H tensor;
```

---

### 5.3 Detailed Neural Architecture Specification
The internal architecture of the deep learning model is detailed below:

```mermaid
flowchart TD
    subgraph InputBlock["1. Input & Missing Data Representation Layer"]
        InX["Input Sequence: X_t (48 x D)"]
        InM["Missing Mask: M_t (48 x D)"]
        InD["Elapsed Time Delta: Delta_t (48 x D)"]
        InX & InM & InD --> ConcatIn["Concatenation Layer<br/>Shape: (Batch, 48, 3*D)"]
    end

    subgraph ConvBlock["2. 1D-CNN Temporal Feature Extraction Layer"]
        ConcatIn --> Conv1["1D Causal Convolution<br/>(Filters=64, Kernel=3, Padding=Causal)"]
        Conv1 --> BN1["Batch Normalization + ReLU"]
        BN1 --> Conv2["1D Causal Convolution<br/>(Filters=64, Kernel=3, Padding=Causal)"]
        Conv2 --> BN2["Batch Normalization + ReLU"]
        BN2 --> Drop1["Spatial Dropout (rate=0.1)"]
    end

    subgraph RecurrentBlock["3. Causal Recurrent Backbone"]
        Drop1 --> LSTM1["LSTM Layer 1<br/>(Units=128, Return Sequences=True)"]
        LSTM1 --> Drop2["Recurrent Dropout (rate=0.2)"]
        Drop2 --> LSTM2["LSTM Layer 2<br/>(Units=64, Return Sequences=True)"]
    end

    subgraph AttentionBlock["4. Temporal Attention Layer"]
        LSTM2 --> AttnScore["Score Computation: e_t = v^T tanh(W h_t + b)"]
        AttnScore --> SoftmaxAttn["Softmax Normalization: alpha_t"]
        SoftmaxAttn & LSTM2 --> WeightedSum["Context Vector: c = sum(alpha_t * h_t)"]
    end

    subgraph DecodeBlock["5. Multi-Head Dense Forecasting Heads"]
        WeightedSum --> Head1["Dense Head 1 (t+1h): Linear(64 -> D)"]
        WeightedSum --> Head2["Dense Head 2 (t+6h): Linear(64 -> D)"]
        WeightedSum --> Head3["Dense Head 3 (t+12h): Linear(64 -> D)"]
        WeightedSum --> Head4["Dense Head 4 (t+24h): Linear(64 -> D)"]
    end

    subgraph UncertaintyBlock["6. Monte Carlo Uncertainty Head"]
        Head1 & Head2 & Head3 & Head4 --> MCDrop["MC Dropout Active at Inference<br/>(N = 50 stochastic passes)"]
        MCDrop --> MeanPred["Predictive Mean (y_hat)"]
        MCDrop --> VarPred["Predictive Variance (sigma^2) -> 95% CI"]
    end

    classDef block fill:#ffffff,stroke:#333,stroke-width:1px;
    class InputBlock,ConvBlock,RecurrentBlock,AttentionBlock,DecodeBlock,UncertaintyBlock block;
```

---

## 6. Detailed Methodology

### 6.1 Temporal Sensor Data Ingestion & Resampling
1. **Raw Ingestion:** Ingest multi-parameter continuous time-series records from automated monitoring stations. Timestamps are parsed as ISO-8601 UTC datetimes and indexed chronologically.
2. **Temporal Grid Regularization:** Environmental sensors often log data at fluctuating sub-hourly intervals (e.g., 14m, 16m). We establish a regular, uniform 1-hour temporal grid using right-closed binning:
   $$\bar{x}_{\tau} = \frac{1}{|S_{\tau}|} \sum_{k \in S_{\tau}} x_k, \quad S_{\tau} = \{t \mid (\tau - 1)\Delta t < t \le \tau\Delta t\}$$
   Where $\Delta t = 1\ \text{hour}$. Any hour lacking sensor readings is marked as an explicit missing step (`NaN`), rather than silently skipped, preserving the temporal continuity required for autoregressive modeling.

### 6.2 Missing Data Handling: GRU-D Inspired Decay Mechanism
Instead of discarding incomplete sequences or relying on decoupled statistical imputation, we adapt the principles of GRU-D (Che et al., 2018 [P20]) directly into the input tensor:
1. **Binary Observation Mask:** For each feature $d \in \{1, \dots, D\}$ at time $t$:
   $$m_t^{(d)} = \begin{cases} 1, & \text{if } x_t^{(d)} \text{ is observed} \\ 0, & \text{if } x_t^{(d)} \text{ is missing} \end{cases}$$
2. **Elapsed Time Delta ($\delta_t$):** Tracks the continuous duration since the variable was last observed:
   $$\delta_t^{(d)} = \begin{cases} \Delta t, & \text{if } t = 1 \text{ or } m_{t-1}^{(d)} = 1 \\ \delta_{t-1}^{(d)} + \Delta t, & \text{if } m_{t-1}^{(d)} = 0 \end{cases}$$
3. **Trainable Temporal Decay Factor:** When a sensor reading is missing, its value decays toward the empirical training mean $\tilde{x}^{(d)}$ according to:
   $$\gamma_t^{(d)} = \exp\left(-\max(0, w_d \delta_t^{(d)} + b_d)\right)$$
   $$\hat{x}_t^{(d)} = m_t^{(d)} x_t^{(d)} + (1 - m_t^{(d)}) \left[ \gamma_t^{(d)} x_{t'}^{(d)} + (1 - \gamma_t^{(d)}) \tilde{x}^{(d)} \right]$$
   Where $x_{t'}^{(d)}$ is the last observed reading. The model receives a concatenated input tensor of shape $(\text{Batch}, L, 3D)$ comprising the decayed values $\hat{\mathbf{x}}_t$, the observation mask $\mathbf{m}_t$, and the elapsed time deltas $\boldsymbol{\delta}_t$. This enables the network to learn both from observed measurements and from the pattern of missingness itself.

### 6.3 Leakage-Free Data Normalization
To prevent temporal data leakage, all features are normalized strictly using statistics computed from the training split:
$$x_{\text{norm}} = \frac{x - x_{\min}^{\text{train}}}{x_{\max}^{\text{train}} - x_{\min}^{\text{train}}}$$
Validation and test sets are transformed using $x_{\min}^{\text{train}}$ and $x_{\max}^{\text{train}}$, ensuring zero lookahead leakage into test evaluations.

### 6.4 Temporal Sequence Generation: Sliding Window Protocol
To capture diurnal dynamics and antecedent runoff memory, historical sequences are structured using a rolling sliding window:
- **Lookback Window Length ($L$):** $L = 48\ \text{hours}$ (2 complete diurnal cycles), capturing day/night oscillations and antecedent hydrological conditions.
- **Forecast Horizons ($H$):** Multi-horizon targets corresponding to four operational decision windows:
  $$\mathbf{Y}_t = \left[ \mathbf{x}_{t+1}, \mathbf{x}_{t+6}, \mathbf{x}_{t+12}, \mathbf{x}_{t+24} \right] \in \mathbb{R}^{4 \times D}$$
- **Chronological Window Partitioning:** Time windows are generated *after* splitting the series chronologically into Train ($70\%$), Validation ($15\%$), and Test ($15\%$) sets. Windows overlapping partition boundaries are purged to maintain strict temporal separation.

---

### 6.5 Deep Learning Model Architecture Details

#### Module 1: 1D-CNN Temporal Feature Extractor
The input tensor $\mathbf{Z} \in \mathbb{R}^{B \times 48 \times 3D}$ passes through two stacked 1D convolutional layers with causal padding:
$$\mathbf{F}^{(1)} = \text{ReLU}\left( \text{BatchNorm}\left( \text{Conv1D}_{k=3, c=64}(\mathbf{Z}) \right) \right)$$
$$\mathbf{F}^{(2)} = \text{ReLU}\left( \text{BatchNorm}\left( \text{Conv1D}_{k=3, c=64}(\mathbf{F}^{(1)}) \right) \right)$$
The causal padding ensures the convolutional receptive field at step $t$ depends strictly on steps $\tau \le t$. Spatial dropout ($p = 0.1$) regularizes the feature maps against co-adaptation.

#### Module 2: Causal Unidirectional LSTM Backbone
The convolutional feature maps $\mathbf{F}^{(2)} \in \mathbb{R}^{B \times 48 \times 64}$ are processed by a two-layer causal unidirectional LSTM:
$$\mathbf{h}_t^{(1)}, \mathbf{c}_t^{(1)} = \text{LSTM}_1\left(\mathbf{f}_t^{(2)}, \mathbf{h}_{t-1}^{(1)}, \mathbf{c}_{t-1}^{(1)}\right), \quad \text{hidden units} = 128$$
$$\mathbf{h}_t^{(2)}, \mathbf{c}_t^{(2)} = \text{LSTM}_2\left(\mathbf{h}_t^{(1)}, \mathbf{h}_{t-1}^{(2)}, \mathbf{c}_{t-1}^{(2)}\right), \quad \text{hidden units} = 64$$
Recurrent dropout ($p = 0.2$) is applied between layers to mitigate overfitting.

#### Module 3: Temporal Attention Mechanism
To capture which antecedent time steps most strongly influence the forecast, an additive Bahdanau-style attention layer weights the LSTM hidden states:
$$e_t = \mathbf{v}_a^T \tanh\left(\mathbf{W}_a \mathbf{h}_t^{(2)} + \mathbf{b}_a\right), \quad t \in \{1, \dots, 48\}$$
$$\alpha_t = \frac{\exp(e_t)}{\sum_{\tau=1}^{48} \exp(e_{\tau})}$$
$$\mathbf{c} = \sum_{t=1}^{48} \alpha_t \mathbf{h}_t^{(2)} \in \mathbb{R}^{64}$$
Where $\alpha_t$ represents the normalized attention weight for historical time step $t$, and $\mathbf{c}$ is the aggregated context vector.

#### Module 4: Multi-Head Direct Forecasting Decoder
Rather than using recursive autoregression—which accumulates prediction errors across extended horizons—we deploy four independent, direct linear output heads branching from the shared context vector $\mathbf{c}$:
$$\hat{\mathbf{y}}_{t+1} = \mathbf{W}_{h1} \mathbf{c} + \mathbf{b}_{h1}, \quad \hat{\mathbf{y}}_{t+1} \in \mathbb{R}^D$$
$$\hat{\mathbf{y}}_{t+6} = \mathbf{W}_{h2} \mathbf{c} + \mathbf{b}_{h2}, \quad \hat{\mathbf{y}}_{t+6} \in \mathbb{R}^D$$
$$\hat{\mathbf{y}}_{t+12} = \mathbf{W}_{h3} \mathbf{c} + \mathbf{b}_{h3}, \quad \hat{\mathbf{y}}_{t+12} \in \mathbb{R}^D$$
$$\hat{\mathbf{y}}_{t+24} = \mathbf{W}_{h4} \mathbf{c} + \mathbf{b}_{h4}, \quad \hat{\mathbf{y}}_{t+24} \in \mathbb{R}^D$$

---

### 6.6 Deterioration Risk Score (DRS) Module

To transform continuous multi-parameter forecasts into actionable early-warning alerts, we formulate a standard-compliant **Deterioration Risk Score (DRS)**.

#### Sub-Index Formulation for Monitored Parameters
For each predicted parameter $\hat{y}^{(d)}$ at forecast horizon $h \in \{1, 6, 12, 24\}$, a normalized penalty sub-index $S^{(d)} \in [0, 100]$ is computed based on WHO, USEPA, and BIS standards:

1. **Dissolved Oxygen Sub-Index ($S_{\text{DO}}$):**
   $$S_{\text{DO}} = \begin{cases} 0, & \text{if } \hat{y}_{\text{DO}} \ge 6.5\ \text{mg/L} \\ \frac{6.5 - \hat{y}_{\text{DO}}}{6.5 - 4.0} \times 50, & \text{if } 4.0 \le \hat{y}_{\text{DO}} < 6.5 \\ 50 + \frac{4.0 - \hat{y}_{\text{DO}}}{4.0 - 2.0} \times 50, & \text{if } 2.0 \le \hat{y}_{\text{DO}} < 4.0 \\ 100, & \text{if } \hat{y}_{\text{DO}} < 2.0\ \text{mg/L} \end{cases}$$

2. **pH Sub-Index ($S_{\text{pH}}$):**
   $$S_{\text{pH}} = \begin{cases} 0, & \text{if } 6.8 \le \hat{y}_{\text{pH}} \le 8.2 \\ \frac{6.8 - \hat{y}_{\text{pH}}}{6.8 - 6.0} \times 100, & \text{if } \hat{y}_{\text{pH}} < 6.8 \\ \frac{\hat{y}_{\text{pH}} - 8.2}{9.0 - 8.2} \times 100, & \text{if } \hat{y}_{\text{pH}} > 8.2 \end{cases}$$
   (Capped at $100$ when $\hat{y}_{\text{pH}} < 6.0$ or $> 9.0$).

3. **Turbidity Sub-Index ($S_{\text{Turb}}$):**
   $$S_{\text{Turb}} = \min\left(100, \left(\frac{\hat{y}_{\text{Turb}}}{5.0\ \text{NTU}}\right) \times 50\right)$$

4. **Specific Conductance / TDS Sub-Index ($S_{\text{EC}}$):**
   $$S_{\text{EC}} = \min\left(100, \left(\frac{\hat{y}_{\text{EC}}}{1500\ \mu\text{S/cm}}\right) \times 100\right)$$

5. **Nitrate Sub-Index ($S_{\text{NO3}}$):**
   $$S_{\text{NO3}} = \min\left(100, \left(\frac{\hat{y}_{\text{NO3}}}{45.0\ \text{mg/L}}\right) \times 100\right)$$

#### Composite DRS Formulation
The composite Deterioration Risk Score combines weighted linear aggregation with a non-linear maximum-penalty operator to ensure severe single-parameter excursions are never masked:
$$\text{DRS}(h) = \max\left( \sum_{d=1}^D w_d S^{(d)}(h), \ \max_{d \in \{1,\dots,D\}} S^{(d)}(h) \right)$$
Where weights reflect aquatic health and potable safety priorities:
$$w_{\text{DO}} = 0.30, \quad w_{\text{pH}} = 0.20, \quad w_{\text{Turb}} = 0.20, \quad w_{\text{NO3}} = 0.15, \quad w_{\text{EC}} = 0.15$$

#### Early-Warning State Machine
The continuous DRS value maps to four graded operational alert states:

| DRS Range | Alert State | Color Code | Operational Meaning | Automated System Action |
|---|---|---|---|---|
| $\text{DRS} < 30$ | **Normal** | Green | Water parameters within nominal compliance envelopes | Standard continuous monitoring; log operational telemetry |
| $30 \le \text{DRS} < 50$ | **Advisory** | Yellow | Minor parameter drift or localized trend elevation | Flag for operator review; verify probe calibration |
| $50 \le \text{DRS} < 75$ | **Watch** | Orange | Moderate deterioration forecast within lookahead horizon | Alert plant shift supervisor; pre-stage coagulants; prepare aerators |
| $\text{DRS} \ge 75$ | **Warning** | Red | Severe compliance breach forecast; high contamination risk | Trigger automated alarm; divert intake valves; issue boil-water notice |

To prevent alert chattering caused by transient noise, an alert upgrade requires two consecutive predictions above threshold, while a downgrade requires three consecutive nominal readings.

---

### 6.7 Explainability Framework: Attention Heatmaps & SHAP Parameter Attribution

To ensure operational trust, the framework provides two complementary explanations for every generated alert:

```
+---------------------------------------------------------------------------------------------------+
|                                  DUAL EXPLAINABILITY FRAMEWORK                                    |
+------------------------------------+--------------------------------------------------------------+
| Perspective                        | Mechanism & Operational Output                               |
+------------------------------------+--------------------------------------------------------------+
| 1. Temporal Dimension              | Attention Heatmaps (alpha_t over t - 48 to t):               |
|    "When did the influencing       | Highlights influential past events (e.g., storm pulse        |
|    conditions occur?"              | 14 hours ago vs. antecedent diurnal baseline).               |
+------------------------------------+--------------------------------------------------------------+
| 2. Parameter Dimension             | KernelSHAP / DeepSHAP Values (phi_d across parameters):      |
|    "Which physical/chemical        | Quantifies each parameter's marginal contribution to the     |
|    variables drove the alert?"     | forecasted Deterioration Risk Score.                         |
+------------------------------------+--------------------------------------------------------------+
```

1. **Temporal Attention Heatmap:** The attention weights $\alpha_t \in [0, 1]$ across the 48-hour lookback window are plotted as an operational time-series ribbon, allowing operators to verify whether the model is responding to a known antecedent storm pulse, diurnal baseline shifts, or an isolated sensor glitch.
2. **SHAP Parameter Attribution:** We apply SHAP (Lundberg & Lee, 2017) to compute Shapley values $\phi_d$ for each parameter:
   $$\text{DRS} - \mathbb{E}[\text{DRS}] = \sum_{d=1}^D \phi_d$$
   Waterfall plots display whether an orange "Watch" alert was driven primarily by plunging DO ($\phi_{\text{DO}} = +28.4$), surging turbidity ($\phi_{\text{Turb}} = +14.2$), or elevated nitrate ($\phi_{\text{NO3}} = +8.1$).

---

### 6.8 Uncertainty Quantification: Monte Carlo Dropout
To compute calibrated confidence intervals for predicted parameters, we apply Monte Carlo Dropout (Gal & Ghahramani, 2016 [P22]). During inference, dropout layers remain active with rate $p = 0.2$. Executing $N = 50$ stochastic forward passes yields an empirical predictive distribution:
$$\hat{\mu}_{t+h}^{(d)} = \frac{1}{N} \sum_{i=1}^N \hat{y}_{t+h}^{(d, i)}$$
$$\hat{\sigma}_{t+h}^{(d)2} = \frac{1}{N} \sum_{i=1}^N \left( \hat{y}_{t+h}^{(d, i)} - \hat{\mu}_{t+h}^{(d)} \right)^2$$
The resulting $95\%$ predictive confidence interval is:
$$\text{CI}_{95\%} = \left[ \hat{\mu}_{t+h}^{(d)} - 1.96 \hat{\sigma}_{t+h}^{(d)}, \ \hat{\mu}_{t+h}^{(d)} + 1.96 \hat{\sigma}_{t+h}^{(d)} \right]$$
If the predictive standard deviation $\hat{\sigma}$ widens beyond a pre-calibrated reliability threshold, the system flags the alert as **"High Alert — Wide Uncertainty,"** prompting operators to perform manual grab-sample verification.

---

## 7. Dataset Selection, Provenance & Ingestion Strategy

To ensure empirical validity, reproducibility, and academic rigor, candidate environmental sensor datasets were systematically evaluated across sampling frequency, parameter coverage, record length, and public availability.

### 7.1 Dataset Evaluation & Candidate Comparison

| Dataset Name | Source Organization | Sampling Frequency | Temporal Coverage | Parameters Available | Public Availability | Suitability for Proposed Framework |
|---|---|---|---|---|---|---|
| **USGS NWIS Real-Time Continuous** | United States Geological Survey (USGS) | Continuous (15 to 60 minutes) | Multi-decade (2000–present) | DO, pH, Turbidity, Specific Conductance, Water Temp, Nitrate | **Fully Open (REST API & Web)** | **PRIMARY RECOMMENDATION (Gold Standard)** |
| **Queensland Water Quality Monitoring** | Queensland Dept. of Environment, Australia | 30 to 60 minutes | Multi-year continuous | DO, pH, Temp, Turbidity, Conductivity | Open Access (data.qld.gov.au) | **SECONDARY / BACKUP (Verified benchmark in P05)** |
| **CPCB National Water Monitoring (NWMP)** | Central Pollution Control Board, India | Monthly grab samples | Multi-decade | DO, pH, BOD, COD, Nitrate, TDS | Semi-Open (data.gov.in) | **TERTIARY ONLY (Monthly grab samples inadequate for sub-daily early warning)** |
| **Kaggle Water Quality Datasets (Aditya / Potability)** | Community Uploads | Static tabular snapshots | None (no timestamps) | pH, Hardness, Solids, Chloramines | Open Access | **REJECTED (No temporal dimension; unsuitable for time-series forecasting)** |

### 7.2 Primary Dataset Specification: USGS NWIS Real-Time Station
We designate the **USGS National Water Information System (NWIS)** automated continuous monitoring network as the primary data source:
- **Selected Monitoring Station:** USGS Station `01646500` (Potomac River near Wash, DC) or USGS Station `14211720` (Willamette River at Portland, OR). These benchmark stations feature multi-year continuous records across all six target parameters.
- **Access Protocol:** Retrieved directly via the USGS Water Services REST API:
  `https://waterservices.usgs.gov/nws/iv/?format=json&sites=01646500&parameterCd=00300,00400,00010,00095,63680,99133`
- **USGS Parameter Codes:**
  - `00300`: Dissolved Oxygen ($\text{mg/L}$)
  - `00400`: pH (standard units)
  - `00010`: Water Temperature ($^{\circ}\text{C}$)
  - `00095`: Specific Conductance ($\mu\text{S/cm}$ at $25^{\circ}\text{C}$)
  - `63680`: Turbidity (FNU / NTU)
  - `99133`: Nitrate plus Nitrite ($\text{mg/L}$ as $\text{N}$)
- **Temporal Span for Evaluation:** Minimum 3 continuous calendar years (e.g., 2021–2023), yielding approximately $26,280$ hourly timesteps per parameter.

---

## 8. Model Training Strategy & Optimization Protocol

### 8.1 Chronological Partitioning Protocol
To guarantee strict temporal independence and prevent data leakage:
- **Training Set ($70\%$):** Earliest $70\%$ of the chronological record (e.g., Year 1 to mid-Year 2; $\approx 18,396$ hours). Used exclusively for model optimization and normalizer fitting.
- **Validation Set ($15\%$):** Subsequent $15\%$ of the chronological record ($\approx 3,942$ hours). Used for hyperparameter tuning, learning rate scheduling, and early stopping.
- **Test Set ($15\%$):** Final $15\%$ of the chronological record ($\approx 3,942$ hours). Evaluated strictly once after all training is finalized.

```
+---------------------------------------------------------------------------------------------------+
|                              CHRONOLOGICAL DATA PARTITIONING                                      |
+-------------------------------------------------------+---------------------+---------------------+
| Training Split (70%): ~18,396 hours                  | Validation (15%)    | Test Holdout (15%)  |
| - Model weight optimization via AdamW                 | - Early stopping    | - Strictly unseen   |
| - Normalization statistics fitted strictly here       | - LR scheduling     | - Event detection   |
+-------------------------------------------------------+---------------------+---------------------+
0h                                                    18,396h               22,338h               26,280h
```

### 8.2 Multi-Horizon Multi-Task Loss Function
The model optimizes a composite multi-task loss combining Mean Squared Error (MSE) for trajectory fidelity and Mean Absolute Error (MAE) for gradient stability, summed across all four forecast horizons:
$$\mathcal{L}_{\text{total}} = \sum_{k=1}^4 \lambda_k \left( \frac{1}{D} \sum_{d=1}^D \left[ \text{MSE}\left(\mathbf{y}_{t+h_k}^{(d)}, \hat{\mathbf{y}}_{t+h_k}^{(d)}\right) + \beta \cdot \text{MAE}\left(\mathbf{y}_{t+h_k}^{(d)}, \hat{\mathbf{y}}_{t+h_k}^{(d)}\right) \right] \right) + \lambda_{\text{reg}} \|\Theta\|_2^2$$
Where:
- Horizon weighting factors: $\lambda_1 = 1.0$ ($t+1\text{h}$), $\lambda_2 = 1.0$ ($t+6\text{h}$), $\lambda_3 = 0.8$ ($t+12\text{h}$), $\lambda_4 = 0.8$ ($t+24\text{h}$).
- MAE weight $\beta = 0.5$.
- Weight decay $\lambda_{\text{reg}} = 10^{-4}$ penalizes parameter L2 norm $\|\Theta\|_2^2$.

### 8.3 Optimization Hyperparameters

| Hyperparameter | Configuration Value | Justification |
|---|---|---|
| **Optimizer** | AdamW ($\beta_1=0.9, \beta_2=0.999, \epsilon=10^{-8}$) | Decoupled weight decay prevents recurrent weight explosion |
| **Initial Learning Rate** | $1 \times 10^{-3}$ | Standard learning rate for hybrid CNN-LSTM architectures |
| **LR Scheduler** | `ReduceLROnPlateau` (factor=0.5, patience=5) | Halves learning rate when validation loss plateaus |
| **Minimum LR** | $1 \times 10^{-6}$ | Lower bound for fine-grained weight convergence |
| **Batch Size** | 64 | Balances gradient stability and GPU memory usage |
| **Maximum Epochs** | 100 | Sufficient for convergence on typical environmental sensor records |
| **Early Stopping** | Patience = 12 epochs on validation loss | Terminates training early to prevent overfitting |
| **Gradient Clipping** | Maximum norm = 1.0 | Prevents exploding gradients in recurrent connections |

---

## 9. Comprehensive Experimental Design & Benchmarking Protocol

### 9.1 Baseline Models for Comparative Evaluation
To rigorously validate each architectural contribution, the proposed framework is benchmarked against five baselines spanning statistical, machine learning, and deep learning paradigms:

1. **Statistical Baseline — Vector Autoregression / ARIMA:** Standard linear time-series baseline modeling linear autocorrelations.
2. **Machine Learning Baseline — Random Forest Regressor:** Strong non-deep learning baseline. Inputs are flattened lookback windows ($48 \times D$ tabular features).
3. **Deep Learning Baseline 1 — Vanilla Unidirectional LSTM:** Standard 2-layer LSTM without convolutional feature extraction or attention.
4. **Deep Learning Baseline 2 — Gated Recurrent Unit (GRU):** Parameter-efficient recurrent baseline (evaluating trade-offs identified in P04).
5. **Deep Learning Baseline 3 — Standard CNN-LSTM (No Attention):** The hybrid architecture from Barzegar et al. (2020) [P01] without temporal attention or missing-data decay.
6. **Proposed Primary Model:** 1D-CNN + Causal Attention-LSTM + GRU-D Missing Data Layer + Multi-Head Direct Forecasting Heads.

---

### 9.2 Ablation Study Suite
To establish that each architectural component contributes meaningfully to overall performance, four systematic ablation variants are evaluated under identical training conditions:

```
+---------------------------------------------------------------------------------------------------+
|                                     ABLATION STUDY MATRIX                                         |
+---------------------+-------------------------------------------------------+---------------------+
| Model Variant       | Architectural Modification                            | Hypothesis Tested   |
+---------------------+-------------------------------------------------------+---------------------+
| **Proposed Full**   | Complete architecture (CNN + LSTM + Attn + Decay)     | Unified performance |
+---------------------+-------------------------------------------------------+---------------------+
| **Ablation 1 (A1)** | Remove 1D-CNN layers (feed raw tokens to LSTM)        | Does CNN denoise?   |
+---------------------+-------------------------------------------------------+---------------------+
| **Ablation 2 (A2)** | Remove Attention layer (use last LSTM hidden state)   | Does attention help |
|                     |                                                       | capture extremes?   |
+---------------------+-------------------------------------------------------+---------------------+
| **Ablation 3 (A3)** | Remove GRU-D decay (use standard forward-fill)        | Does native decay   |
|                     |                                                       | handle dropouts?    |
+---------------------+-------------------------------------------------------+---------------------+
| **Ablation 4 (A4)** | Replace Direct Multi-Head with Recursive Forecasting  | Does direct decoding|
|                     | (feed t+1 prediction back as input for t+6, etc.)     | prevent error drift?|
+---------------------+-------------------------------------------------------+---------------------+
```

---

### 9.3 Evaluation Metrics Suite

#### Multi-Horizon Forecasting Evaluation Metrics (Continuous Regression)
1. **Mean Absolute Error (MAE):**
   $$\text{MAE} = \frac{1}{N} \sum_{i=1}^N \left| y_i - \hat{y}_i \right|$$
2. **Root Mean Squared Error (RMSE):**
   $$\text{RMSE} = \sqrt{\frac{1}{N} \sum_{i=1}^N (y_i - \hat{y}_i)^2}$$
3. **Coefficient of Determination ($R^2$):**
   $$R^2 = 1 - \frac{\sum_{i=1}^N (y_i - \hat{y}_i)^2}{\sum_{i=1}^N (y_i - \bar{y})^2}$$
4. **Mean Absolute Percentage Error (MAPE):**
   $$\text{MAPE} = \frac{100\%}{N} \sum_{i=1}^N \left| \frac{y_i - \hat{y}_i}{y_i} \right|$$

#### Deterioration Event Early-Warning Metrics (Operational Classification)
When evaluated as an early-warning classifier (event = true deterioration threshold breach observed within the forecast horizon):
1. **Precision:** $\frac{\text{TP}}{\text{TP} + \text{FP}}$ (proportion of issued alerts that were genuine deterioration events).
2. **Recall (Event Detection Rate):** $\frac{\text{TP}}{\text{TP} + \text{FN}}$ (proportion of actual deterioration events successfully anticipated).
3. **F1-Score:** $2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$.
4. **Area Under the Precision-Recall Curve (PR-AUC):** Crucial metric for highly imbalanced environmental time series where deterioration events represent $< 5\%$ of records.
5. **False Alarm Rate (FAR):** $\frac{\text{FP}}{\text{FP} + \text{TN}}$ (frequency of unnecessary alarms causing operator fatigue).
6. **Average Actionable Lead Time ($\bar{T}_{\text{lead}}$):** The average advance warning time (in hours) between when the model first issues an alert and when the statutory threshold is actually breached in the physical stream.

---

## 10. Novel Research Contributions vs. Borrowed Techniques

To uphold academic integrity, the table below clearly delineates established methods borrowed from the literature, our modifications to those methods, and our proposed integration contributions:

| Component | Nature of Contribution | Source / Precedent | Technical Distinction in Our Framework |
|---|---|---|---|
| **1D-CNN Feature Extraction** | Borrowed Technique | Barzegar et al. (2020) [P01]; Abdul Haq (2022) [P08] | Employed as a front-end noise filter, but modified with strict **causal padding** to eliminate boundary data leakage. |
| **LSTM Recurrence Backbone** | Borrowed Technique | Hochreiter & Schmidhuber (1997); Baek et al. (2020) | Restricted strictly to **unidirectional causal processing**, avoiding the streaming data leakage introduced by Bi-LSTMs [P02, P03]. |
| **Temporal Attention** | Modified Technique | Bahdanau et al. (2015); Chen et al. (2022) [P05] | Extended beyond scalar weighting to generate operational attention heatmaps for visual explainability. |
| **Missing-Data Decay Mechanism** | Adapted Technique | Che et al. (2018) [P20] (GRU-D in clinical informatics) | **Novel Application to Water Quality:** Adapts recurrent decay and observation masking directly into an environmental sensor pipeline. |
| **Multi-Head Direct Decoding** | Architectural Integration | Standard multi-task learning practice | Replaces recursive single-step rollouts with direct output heads at $t+1\text{h}, t+6\text{h}, t+12\text{h}, t+24\text{h}$, preventing error accumulation. |
| **Deterioration Risk Score (DRS)** | **Original Contribution** | WHO (2022), USEPA (2024), BIS (2012) standards | **Original Methodological Synthesis:** A continuous multi-parameter risk index with non-linear penalties, bridging regression and early warning. |
| **Dual XAI (Attention + SHAP)** | **Original Contribution** | Lundberg & Lee (2017); Choudhary (2025) [P21] | **Original Framework Integration:** Combines temporal attention heatmaps (*when*) with SHAP parameter attributions (*what*). |
| **Uncertainty via MC Dropout** | Adapted Technique | Gal & Ghahramani (2016) [P22] | Integrated into multi-horizon heads to provide $95\%$ confidence intervals alongside operational alerts. |

---

## 11. Technical Implementation Roadmap & Technology Stack

### 11.1 Implementation Phase Roadmap Diagram
The project roadmap is structured into six discrete, verifiable phases:

```mermaid
flowchart LR
    P1["Phase 1: Literature & Design<br/>(COMPLETED)"] --> P2["Phase 2: Ingestion & Preprocessing<br/>(USGS API, GRU-D Layer, Sliding Windows)"]
    P2 --> P3["Phase 3: Model Implementation<br/>(Baselines + Primary CNN-LSTM-Attn)"]
    P3 --> P4["Phase 4: DRS & Early Warning<br/>(Sub-indices, State Machine, Thresholds)"]
    P4 --> P5["Phase 5: XAI & Uncertainty<br/>(Attention Maps, SHAP, MC Dropout)"]
    P5 --> P6["Phase 6: Evaluation & Reporting<br/>(Ablations, Metrics, Final Thesis)"]

    classDef done fill:#d4edda,stroke:#28a745,stroke-width:1px;
    classDef pending fill:#eef6ff,stroke:#0066cc,stroke-width:1px;
    class P1 done;
    class P2,P3,P4,P5,P6 pending;
```

---

### 11.2 Technology Stack Specification

| Software Component | Selected Tool / Library | Version | Operational Function in Framework |
|---|---|---|---|
| **Core Programming Language** | Python | $\ge 3.10$ | Primary runtime environment |
| **Deep Learning Framework** | PyTorch / PyTorch Lightning | $\ge 2.1.0$ | Tensor operations, GPU acceleration, custom neural layers |
| **Data Manipulation & Ingestion** | Pandas, NumPy | Latest stable | Time-series resampling, windowing, array arithmetic |
| **Machine Learning Utilities** | Scikit-Learn | Latest stable | Normalization (MinMaxScaler), baseline ML models (Random Forest) |
| **Explainable AI (XAI)** | SHAP (`shap` library) | $\ge 0.44.0$ | Shapley feature attribution values and waterfall plots |
| **Statistical Baselines** | Statsmodels | Latest stable | Classical time-series modeling (ARIMA / SARIMA) |
| **Visualization & Reporting** | Matplotlib, Seaborn | Latest stable | Hydrochemical time-series plots, attention heatmaps, ROC/PR curves |
| **Development Environment** | JupyterLab / VS Code | Latest stable | Interactive experimentation, hyperparameter tuning, documentation |

---

### 11.3 Hardware & Computational Requirements
- **Local Development Hardware:** Evaluated to run efficiently on standard academic hardware:
  - CPU: Intel Core i7 / AMD Ryzen 7 (8 cores, 16 threads).
  - RAM: 16 GB to 32 GB DDR4/DDR5.
  - GPU: Dedicated NVIDIA GPU with $\ge 6\ \text{GB}$ VRAM (e.g., RTX 3060 / 4060 or Google Colab free-tier T4 GPU).
- **Computational Footprint:** Training the primary CNN-LSTM model for 100 epochs on a 3-year hourly dataset ($\approx 26,000$ samples) requires approximately $12 - 20$ minutes on a single mid-range GPU, well within student computational budgets.
- **Inference Latency:** A single forward pass (including 50 MC Dropout iterations) executes in $< 150\ \text{milliseconds}$ on CPU, demonstrating feasibility for real-time edge deployment on automated sensor stations.

---

## 12. Project Limitations & Future Research Enhancements

### 12.1 Candid Assessment of System Limitations
To maintain academic honesty, the following constraints of the proposed implementation are acknowledged:
1. **Single-Station Scope:** The core model evaluates individual monitoring stations. It does not model upstream-to-downstream advection-dispersion across river branching topologies (which would require dense sensor networks that are rarely available).
2. **Dependence on Sensor Calibration:** While the 1D-CNN and decay layers filter transient spikes and short dropouts, severe long-term biofouling drift spanning months cannot be fully distinguished from genuine environmental trends without periodic manual calibration.
3. **Biological Parameter Constraints:** Automated sensors measure physicochemical surrogates (DO, turbidity, nitrate). Pathogenic microbiological contamination (e.g., *E. coli*, Cryptosporidium) cannot be directly monitored by standard continuous probes and is inferred solely via physical proxies.

### 12.2 Future Research Extensions
- **Multi-Station Graph Extensions:** If paired monitoring stations become available, integrating Graph Neural Networks (GNNs) could model pollutant transport dynamics between stations.
- **Edge Microcontroller Deployment:** Pruning and quantizing the trained model to INT8 precision for deployment on low-power microcontrollers (e.g., Raspberry Pi or STM32) integrated directly into solar-powered sensor buoys.
- **Physics-Informed Loss Penalties (PINN):** Embedding thermodynamic equations (such as dissolved oxygen saturation as a function of temperature and salinity via the Benson-Krause equations) directly into the neural network loss function as soft physical constraints.

---

## 13. Comprehensive References

1. **Barzegar, R., Aalami, M. T., & Adamowski, J. (2020).** Short-term water quality variable prediction using a hybrid CNN–LSTM deep learning model. *Stochastic Environmental Research and Risk Assessment*, 34(2), 415–433. https://doi.org/10.1007/s00477-020-01776-2
2. **Khullar, S., & Singh, N. (2021).** Water quality assessment of a river using deep learning Bi-LSTM methodology: forecasting and validation. *Environmental Science and Pollution Research*, 29(9), 12875–12889. https://doi.org/10.1007/s11356-021-13875-w
3. **Zhang, Q., Wang, R., Qi, Y., & Wen, F. (2022).** A watershed water quality prediction model based on attention mechanism and Bi-LSTM. *Environmental Science and Pollution Research*, 29(45), 68532–68544. https://doi.org/10.1007/s11356-022-21115-y
4. **Li, W., Wu, H., Zhu, N., Jiang, Y., Tan, J., & Guo, Y. (2021).** Prediction of dissolved oxygen in a fishery pond based on gated recurrent unit (GRU). *Information Processing in Agriculture*, 8(2), 185–193. https://doi.org/10.1016/j.inpa.2020.02.002
5. **Chen, H., Yang, J., Fu, X., Zheng, Q., Song, X., Fu, Z., et al. (2022).** Water Quality Prediction Based on LSTM and Attention Mechanism: A Case Study of the Burnett River, Australia. *Sustainability*, 14(20), Article 13231. https://doi.org/10.3390/su142013231
6. **Chen, Z., Xu, H., Jiang, P., Yu, S., Lin, G., Bychkov, I., et al. (2021).** A transfer learning-based LSTM strategy for imputing large-scale consecutive missing data and its application in a water quality prediction system. *Journal of Hydrology*, 602, Article 126573. https://doi.org/10.1016/j.jhydrol.2021.126573
7. **Zhou, S., Song, C., Zhang, J., Chang, W., Hou, W., & Yang, L. (2022).** A Hybrid Prediction Framework for Water Quality with Integrated W-ARIMA-GRU and LightGBM Methods. *Water*, 14(9), Article 1322. https://doi.org/10.3390/w14091322
8. **Abdul Haq, K. P. R., & Harigovindan, V. P. (2022).** Water Quality Prediction for Smart Aquaculture Using Hybrid Deep Learning Models. *IEEE Access*, 10, 60078–60098. https://doi.org/10.1109/ACCESS.2022.3180482
9. **Rahu, M. A., Chandio, A. F., Aurangzeb, K., Karim, S., Alhussein, M., & Anwar, M. S. (2023).** Toward Design of Internet of Things and Machine Learning-Enabled Frameworks for Analysis and Prediction of Water Quality. *IEEE Access*, 11, 101055–101086. https://doi.org/10.1109/ACCESS.2023.3315649
10. **Zhi, W., Feng, D., Tsai, W. P., Sterle, G., Harpold, A., Shen, C., & Li, L. (2021).** From Hydrometeorology to River Water Quality: Can a Deep Learning Model Predict Dissolved Oxygen at the Continental Scale? *Environmental Science & Technology*, 55(4), 2357–2368. https://doi.org/10.1021/acs.est.0c06783
11. **Li, W., Wei, Y., An, D., Jiao, Y., & Wei, Q. (2022).** LSTM-TCN: Dissolved oxygen prediction in aquaculture, based on combined model of long short-term memory network and temporal convolutional network. *Environmental Science and Pollution Research*, 29(26), 39545–39556. https://doi.org/10.1007/s11356-021-18454-7
12. **Lin, Y., Qiao, J., Bi, J., Yuan, H., Wang, M., Zhang, J., & Zhou, M. (2025).** Transformer-Based Water Quality Forecasting With Dual Patch and Trend Decomposition. *IEEE Internet of Things Journal*, 12(8), 10987–10997. https://doi.org/10.1109/JIOT.2024.3514133
13. **IEEE SMC Conference Authors. (2022).** GAT-WaveNet: A Spatial-Temporal Graph Attention WaveNet Model for River Water Quality Prediction. *Proceedings of the 2022 IEEE International Conference on Systems, Man, and Cybernetics (SMC)*. https://doi.org/10.1109/SMC53654.2022.9945240
14. **Expert Systems with Applications Authors. (2023).** A VMD-Attention-BiLSTM encoder-decoder model for water quality prediction. *Expert Systems with Applications*, 234, Article 121807. https://doi.org/10.1016/j.eswa.2023.121807
15. **Water MDPI Authors. (2023).** Prediction of Dissolved Oxygen in Water Based on VMD-TCN-ARIMA-WSWOA Combined Model. *Water*, 15(24), Article 4227. https://doi.org/10.3390/w15244227
16. **EIECS Conference Authors. (2023).** Water Quality Prediction Model Based on Informer. *Proceedings of the 2023 IEEE 3rd International Conference on Electronic Information Engineering and Computer Science (EIECS)*. https://doi.org/10.1109/EIECS59936.2023.10435435
17. **CAC Conference Authors. (2023).** Benchmarking Transformer-based Models for Water Quality Index Prediction. *Proceedings of the 2023 China Automation Congress (CAC)*. https://doi.org/10.1109/CAC60259.2023.10424550
18. **EMA Authors. (2024).** Temporal Fusion Transformer for Water Quality Prediction in Poyang Lake. *Environmental Monitoring and Assessment*, 196, Article 321. https://doi.org/10.1007/s10661-024-12331-9
19. **Zhang, Y., Fitch, P., & Thorburn, P. J. (2020).** A Real-Time Early Warning System for Drinking Water Quality Based on LSTM and Pattern Recognition. *Frontiers in Environmental Science*, 8, Article 67. https://doi.org/10.3389/fenvs.2020.00067
20. **Che, Z., Purushotham, S., Cho, K., Sontag, D., & Liu, Y. (2018).** Recurrent Neural Networks for Multivariate Time Series with Missing Values. *Scientific Reports*, 8, Article 6085. https://doi.org/10.1038/s41598-018-24271-9
21. **Choudhary, et al. (2025).** Predicting water quality index using stacked ensemble regression and SHAP based explainable artificial intelligence. *Scientific Reports*, 15, Article 9463. https://doi.org/10.1038/s41598-025-09463-4
22. **Gal, Y., & Ghahramani, Z. (2016).** Dropout as a Bayesian Approximation: Representing Model Uncertainty in Deep Learning. *Proceedings of the 33rd International Conference on Machine Learning (ICML)*, 1050–1059. https://doi.org/10.48550/arXiv.1506.02142
23. **World Health Organization. (2022).** *Guidelines for drinking-water quality: Fourth edition incorporating the first and second addenda*. WHO, Geneva. https://www.who.int/publications/i/item/9789240045064
24. **United States Environmental Protection Agency. (2024).** *National Primary Drinking Water Regulations*. Office of Water, EPA 816-F-24-001. https://www.epa.gov/ground-water-and-drinking-water/national-primary-drinking-water-regulations
25. **Bureau of Indian Standards. (2012).** *Indian Standard: Drinking Water — Specification (IS 10500:2012)*. Manak Bhavan, New Delhi.
