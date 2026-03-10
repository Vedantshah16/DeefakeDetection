# Mathematical Model of Deepfake Detection

These equations describe the internal inference logic of the AI system and are provided for transparency and academic reference.

## 1. Discrete Video Frame Sampling Model
We model the input video $V$ as a discrete sequence of frames sampled at a fixed interval $\Delta t$.
$$ V = \{f_1, f_2, \dots, f_T\} \quad \text{where} \quad f_t = \mathcal{V}(t \cdot \Delta t) $$

## 2. Region of Interest (ROI) Extraction
For each frame $f_t$, a face detection function $\mathcal{D}$ extracts the facial region $x_t$.
$$ x_t = \text{Crop}(f_t, \mathcal{D}(f_t)) $$

## 3. Image Normalization (Min–Max Scaling)
To stabilize the neural network input, pixel intensities are normalized to the range $[0, 1]$.
$$ \hat{x}_t^{(i,j)} = \frac{x_t^{(i,j)} - \min(x_t)}{\max(x_t) - \min(x_t)} $$

## 4. Deep Feature Embedding Function
The normalized image is passed through the XceptionNet backbone $\Phi$ with learned parameters $\theta_{CNN}$ to produce a high-dimensional embedding vector $z_t$.
$$ z_t = \Phi(\hat{x}_t; \theta_{CNN}) \in \mathbb{R}^D $$

## 5. Logistic Regression with Sigmoid Activation
The embedding is mapped to a scalar probability using a linear layer followed by the sigmoid activation function.
$$ P(\text{Fake} | x_t) = \sigma(w^T z_t + b) = \frac{1}{1 + e^{-(w^T z_t + b)}} $$

## 6. Temporal Average Pooling for Video-Level Prediction
To obtain a consensus prediction for the entire video, we average the frame-level probabilities.
$$ \bar{y} = \frac{1}{T} \sum_{t=1}^T P(\text{Fake} | x_t) $$

## 7. Binary Decision Thresholding Rule
The final classification label $C$ is determined by comparing the averaged score against a sensitivity threshold $\tau$ (typically 0.5).
$$ C = \begin{cases} 1 (\text{FAKE}) & \text{if } \bar{y} > \tau \\ 0 (\text{REAL}) & \text{otherwise} \end{cases} $$

## 8. Binary Cross-Entropy Loss Function
During training, parameters are optimized by minimizing the Binary Cross-Entropy (BCE) loss between predicted probability $\hat{y}$ and ground truth $y$.
$$ \mathcal{L}(\theta) = -\frac{1}{N} \sum_{i=1}^N \left[ y_i \log(\hat{y}_i) + (1 - y_i) \log(1 - \hat{y}_i) \right] $$

## 9. Inter-Frame Prediction Variance (Temporal Inconsistency)
We measure the instability of predictions across frames to detect flickering artifacts common in deepfakes.
$$ \sigma^2_{temp} = \frac{1}{T} \sum_{t=1}^T (\hat{y}_t - \bar{y})^2 $$

## 10. High-Frequency Spectral Energy Measure (FFT-based)
Deepfakes often exhibit anomalous high-frequency patterns. We analyze this using the 2D Fast Fourier Transform $\mathcal{F}$.
$$ E_{high} = \sum_{u,v \in \Omega_{HF}} | \mathcal{F}(x_t)[u,v] |^2 $$

## 11. Confidence Calibration using Temperature Scaling
To ensure the output probabilities reflect true accuracy, logits $z_{logits}$ are scaled by a learned temperature parameter $T_s$ before activation.
$$ \hat{q}_t = \sigma\left( \frac{z_{logits}}{T_s} \right) $$
