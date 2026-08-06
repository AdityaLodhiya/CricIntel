import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
from typing import Dict, Any, List
from ml.config.settings import PLOTS_DIR

def save_plot(fig: go.Figure, filename: str):
    """Saves Plotly figure as HTML in the plots directory."""
    path = PLOTS_DIR / f"{filename}.html"
    fig.write_html(str(path))
    return path

def plot_correlation_heatmap(df: pd.DataFrame, filename: str = "correlation_heatmap"):
    """Generates a correlation heatmap for numerical features."""
    corr = df.select_dtypes(include=['number']).corr()
    fig = px.imshow(corr, text_auto=True, aspect="auto", title="Correlation Heatmap")
    save_plot(fig, filename)

def plot_confusion_matrix(y_true, y_pred, filename: str = "confusion_matrix"):
    """Generates a confusion matrix for classification tasks."""
    from sklearn.metrics import confusion_matrix
    cm = confusion_matrix(y_true, y_pred)
    fig = px.imshow(
        cm, text_auto=True, aspect="auto", 
        labels=dict(x="Predicted", y="True Label", color="Count"),
        title="Confusion Matrix"
    )
    save_plot(fig, filename)

def plot_feature_importance(importances: pd.DataFrame, filename: str = "feature_importance"):
    """Generates a bar plot for feature importances."""
    importances = importances.sort_values(by="Importance", ascending=True).tail(20)
    fig = px.bar(
        importances, x="Importance", y="Feature", orientation='h',
        title="Top 20 Feature Importances"
    )
    save_plot(fig, filename)

def plot_roc_curve(fpr, tpr, roc_auc, filename: str = "roc_curve"):
    """Generates an ROC curve."""
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=fpr, y=tpr, mode='lines', name=f'ROC curve (area = {roc_auc:0.2f})'))
    fig.add_trace(go.Scatter(x=[0, 1], y=[0, 1], mode='lines', line=dict(dash='dash'), name='Random'))
    fig.update_layout(title="Receiver Operating Characteristic (ROC) Curve", xaxis_title="False Positive Rate", yaxis_title="True Positive Rate")
    save_plot(fig, filename)

def plot_prediction_error(y_true, y_pred, filename: str = "prediction_error"):
    """Generates a scatter plot of True vs Predicted values for regression."""
    fig = px.scatter(
        x=y_true, y=y_pred, labels={'x': 'True Values', 'y': 'Predicted Values'},
        title="Prediction Error Plot"
    )
    fig.add_shape(
        type="line", line=dict(dash='dash'),
        x0=min(y_true), y0=min(y_true), x1=max(y_true), y1=max(y_true)
    )
    save_plot(fig, filename)
