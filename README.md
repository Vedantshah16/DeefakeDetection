# 🛡️ TrueSight AI
### Imbalance-Aware Deepfake Detection (Research Project)

![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)
![PyTorch](https://img.shields.io/badge/PyTorch-Deep%20Learning-red.svg)
![Status](https://img.shields.io/badge/Status-Research%20Complete-success.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

TrueSight AI is a **research-focused deepfake detection framework** designed to address **extreme class imbalance** in real-world datasets.  
The project emphasizes **minority-class reliability**, **threshold calibration**, and **research-grade evaluation** using the DFDC dataset.

This repository contains the **final, reproducible implementation** used for experimentation and analysis.

---

## 🔬 Key Contributions

- EfficientNet-B4 based deepfake detector
- Explicit handling of severe class imbalance (≈12:1)
- Threshold optimization instead of fixed 0.5 decision rule
- Controlled comparison: **Weighted BCE vs Focal Loss**
- Research-grade evaluation (ROC, AUC, Precision–Recall)
- Transparent reporting of negative results

---

## 📊 Final Performance (Validation Set)

| Metric | Weighted BCE (Final) |
|------|---------------------|
| F1-Real | **0.5683** |
| Recall-Real | 67.8% |
| Precision-Real | 48.9% |
| ROC-AUC | **0.8938** |
| Optimal Threshold | 0.70 |

---

## 📁 Repository Structure

