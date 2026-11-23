#!/usr/bin/env python3
import json
import numpy as np
from pathlib import Path
from PIL import Image
import torch
import onnxruntime as ort
from ultralytics import YOLO

ROOT_DIR = Path(__file__).resolve().parent.parent

CATTLE_CLASSES = ["foot-and-mouth", "healthy", "lumpy"]
POULTRY_CLASSES = ["Bumblefoot", "Fowlpox", "Healthy", "coryza", "crd"]

def preprocess_pil(pil_img: Image.Image) -> np.ndarray:
    """Standard YOLOv8 Classification Preprocessing: Resize(224) + CenterCrop(224)"""
    w, h = pil_img.size
    if w < h:
        new_w = 224
        new_h = int(round(h * 224 / w))
    else:
        new_h = 224
        new_w = int(round(w * 224 / h))
    resized = pil_img.resize((new_w, new_h), Image.BILINEAR)
    left = (new_w - 224) // 2
    top = (new_h - 224) // 2
    cropped = resized.crop((left, top, left + 224, top + 224))
    arr = np.array(cropped).astype(np.float32) / 255.0
    arr = np.transpose(arr, (2, 0, 1))  # (3, 224, 224)
    return np.expand_dims(arr, axis=0)  # (1, 3, 224, 224)

def run_test(image_rel_path: str, model_type: str):
    img_path = ROOT_DIR / image_rel_path
    pil_img = Image.open(img_path).convert("RGB")
    
    is_poultry = (model_type == "poultry")
    classes = POULTRY_CLASSES if is_poultry else CATTLE_CLASSES
    
    pt_path = ROOT_DIR / f"src/ml_model/{model_type}_best.pt"
    onnx_path = ROOT_DIR / f"public/models/{model_type}_best.onnx"
    
    print(f"\n========================================================")
    print(f"AUDIT TEST: {image_rel_path} ({model_type})")
    print(f"========================================================")
    
    # 1. Preprocessing input tensor
    input_tensor = preprocess_pil(pil_img)
    t_min = float(np.min(input_tensor))
    t_max = float(np.max(input_tensor))
    t_mean = float(np.mean(input_tensor))
    first10 = [round(float(v), 6) for v in input_tensor.flatten()[:10]]
    
    print(f"Python Input Tensor Stats: min={t_min:.4f}, max={t_max:.4f}, mean={t_mean:.4f}")
    print(f"Python First 10 input values: {first10}")
    
    # 2. Run (A) PyTorch Model
    yolo_model = YOLO(str(pt_path))
    # PyTorch evaluation
    torch_model = yolo_model.model
    torch_model.eval()
    with torch.no_grad():
        t_input = torch.from_numpy(input_tensor)
        out = torch_model(t_input)
        if isinstance(out, (list, tuple)):
            out = out[0]
        # Check if softmax is needed
        py_probs = out.squeeze(0).cpu().numpy()
        if abs(float(np.sum(py_probs)) - 1.0) > 0.05:
            e_x = np.exp(py_probs - np.max(py_probs))
            py_probs = e_x / np.sum(e_x)
            
    top1_pt = int(np.argmax(py_probs))
    conf_pt = float(py_probs[top1_pt])
    print(f"(A) PyTorch Probs: {[round(float(p), 6) for p in py_probs]}")
    print(f"(A) PyTorch Top1: {classes[top1_pt]} ({conf_pt * 100:.2f}%)")
    
    # 3. Run (B) Python ONNX Runtime
    session = ort.InferenceSession(str(onnx_path))
    inp_name = session.get_inputs()[0].name
    ort_out = session.run(None, {inp_name: input_tensor})[0][0]
    ort_probs = ort_out
    if abs(float(np.sum(ort_probs)) - 1.0) > 0.05:
        e_x = np.exp(ort_probs - np.max(ort_probs))
        ort_probs = e_x / np.sum(e_x)
        
    top1_ort = int(np.argmax(ort_probs))
    conf_ort = float(ort_probs[top1_ort])
    max_diff_ab = float(np.max(np.abs(py_probs - ort_probs)))
    print(f"(B) Python ORT Probs: {[round(float(p), 6) for p in ort_probs]}")
    print(f"(B) Python ORT Top1: {classes[top1_ort]} ({conf_ort * 100:.2f}%)")
    print(f"Max abs diff (A vs B): {max_diff_ab:.2e} (Pass: {max_diff_ab < 1e-4})")
    
    return {
        "image": image_rel_path,
        "model_type": model_type,
        "classes": classes,
        "input_stats": {"min": t_min, "max": t_max, "mean": t_mean},
        "first10_input": first10,
        "pytorch": {
            "probs": [float(p) for p in py_probs],
            "top1_class": classes[top1_pt],
            "top1_conf": conf_pt
        },
        "python_ort": {
            "probs": [float(p) for p in ort_probs],
            "top1_class": classes[top1_ort],
            "top1_conf": conf_ort
        },
        "max_diff_pytorch_ort": max_diff_ab
    }

def main():
    results = []
    results.append(run_test("scripts/test_gradient.png", "cattle"))
    results.append(run_test("public/farm-setup/cows.png", "cattle"))
    results.append(run_test("public/farm-setup/poultry.png", "poultry"))
    
    out_file = ROOT_DIR / "scripts" / "python_parity_results.json"
    with open(out_file, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nSaved Python parity results to {out_file}")

if __name__ == "__main__":
    main()
