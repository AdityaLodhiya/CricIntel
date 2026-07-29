import shap
import joblib
from ml.config.settings import SAVED_MODELS_DIR, PLOTS_DIR
import matplotlib.pyplot as plt

class SHAPExplainer:
    """Handles SHAP value generation and explainability plots."""
    def __init__(self, model):
        self.model = model
        # Try TreeExplainer for XGB/LGBM/CatBoost, fallback to KernelExplainer
        try:
            self.explainer = shap.TreeExplainer(self.model)
        except:
            self.explainer = None # Initialize later if KernelExplainer needed

    def explain(self, X):
        if self.explainer is None:
            # Fallback
            self.explainer = shap.KernelExplainer(self.model.predict, shap.sample(X, 100))
        
        shap_values = self.explainer.shap_values(X)
        return shap_values

    def save_explainer(self, filename: str):
        path = SAVED_MODELS_DIR / f"{filename}.joblib"
        joblib.dump(self.explainer, path)
        
    def plot_summary(self, shap_values, X, filename: str = "shap_summary"):
        plt.figure(figsize=(10, 8))
        shap.summary_plot(shap_values, X, show=False)
        plt.tight_layout()
        plt.savefig(PLOTS_DIR / f"{filename}.png")
        plt.close()
