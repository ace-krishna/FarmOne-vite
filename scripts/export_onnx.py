#!/usr/bin/env python3
"""
FarmOne ML Model Exporter to ONNX & Parity Verification Script.

Exports PyTorch/Ultralytics YOLO classification models (.pt) into self-contained
web-compatible ONNX models (.onnx) and emits preprocessing metadata (.json).
Also executes numerical parity verification between PyTorch and ONNX Runtime.

Usage:
    python scripts/export_onnx.py
    python scripts/export_onnx.py --model cattle --opset 17
    python scripts/export_onnx.py --model poultry --opset 17
    python scripts/export_onnx.py --all
"""

import sys
import os
import argparse
import json
import shutil
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
SRC_ML_DIR = PROJECT_ROOT / "src" / "ml_model"
PUBLIC_MODELS_DIR = PROJECT_ROOT / "public" / "models"

# Model specifications
MODEL_SPECS = {
    "cattle": {
        "pt_path": SRC_ML_DIR / "cattle_best.pt",
        "onnx_export_name": "cattle_best.onnx",
        "output_onnx": PUBLIC_MODELS_DIR / "cattle_best.onnx",
        "classes": {0: "foot-and-mouth", 1: "healthy", 2: "lumpy"},
        "class_names": ["foot-and-mouth", "healthy", "lumpy"],
        "is_default": True
    },
    "poultry": {
        "pt_path": SRC_ML_DIR / "poultry_best.pt",
        "onnx_export_name": "poultry_best.onnx",
        "output_onnx": PUBLIC_MODELS_DIR / "poultry_best.onnx",
        "classes": {0: "Bumblefoot", 1: "Fowlpox", 2: "Healthy", 3: "coryza", 4: "crd"},
        "class_names": ["Bumblefoot", "Fowlpox", "Healthy", "coryza", "crd"],
        "is_default": False
    }
}

PREPROCESSING_METADATA = {
    "input": {
        "name": "images",
        "shape": [1, 3, 224, 224],
        "width": 224,
        "height": 224,
        "channels": 3,
        "layout": "NCHW",
        "colorSpace": "RGB",
        "dataType": "float32",
        "resize": {
            "mode": "center_crop_aspect_ratio",
            "targetWidth": 224,
            "targetHeight": 224,
            "interpolation": "bilinear"
        },
        "normalization": {
            "scale": float(1.0 / 255.0),
            "mean": [0.0, 0.0, 0.0],
            "std": [1.0, 1.0, 1.0],
            "pixelRange": [0.0, 1.0]
        }
    },
    "output": {
        "name": "output0",
        "postprocessing": "softmax_if_logits"
    }
}


def export_and_verify_model(model_key: str, spec: dict, opset: int = 17, skip_export: bool = False):
    print(f"\n=======================================================")
    print(f"  Processing Model: {model_key.upper()}")
    print(f"=======================================================")

    pt_path = spec["pt_path"]
    target_onnx = spec["output_onnx"]
    target_onnx.parent.mkdir(parents=True, exist_ok=True)

    # 1. Export PyTorch (.pt) to ONNX
    if not skip_export:
        print(f"[*] Checking PyTorch weights: {pt_path}")
        if not pt_path.exists():
            print(f"[!] Warning: PyTorch weight file not found at {pt_path}.")
            if target_onnx.exists():
                print(f"[*] Found existing ONNX model at {target_onnx}. Using it directly.")
            else:
                raise FileNotFoundError(f"Neither {pt_path} nor {target_onnx} exists.")
        else:
            try:
                from ultralytics import YOLO
                print(f"[*] Loading PyTorch YOLOv8 model from {pt_path}...")
                model = YOLO(str(pt_path))

                print(f"[*] Exporting to ONNX format (opset={opset}, imgsz=224)...")
                exported_path = model.export(
                    format="onnx",
                    opset=opset,
                    imgsz=224,
                    simplify=True,
                    half=False
                )
                print(f"[+] Ultralytics export succeeded: {exported_path}")

                # Copy to public/models/
                exported_path = Path(exported_path)
                shutil.copy2(exported_path, target_onnx)
                print(f"[+] Saved to: {target_onnx} ({target_onnx.stat().st_size / (1024*1024):.2f} MB)")

                # Also save to src/ml_model
                shutil.copy2(exported_path, SRC_ML_DIR / spec["onnx_export_name"])
            except ImportError:
                print("[!] 'ultralytics' or 'torch' package is not installed in current Python environment.")
                if target_onnx.exists():
                    print(f"[*] Using pre-existing ONNX model at {target_onnx}")
                else:
                    raise RuntimeError("Cannot export: 'ultralytics' not installed and no ONNX file exists.")
    else:
        print(f"[*] Skipping export step, evaluating: {target_onnx}")

    # If this is default model, also ensure public/models/model.onnx is populated
    if spec.get("is_default"):
        default_model_onnx = PUBLIC_MODELS_DIR / "model.onnx"
        shutil.copy2(target_onnx, default_model_onnx)
        print(f"[+] Default model mapped to: {default_model_onnx}")

    # 2. Parity check comparing PyTorch and ONNX Runtime
    print(f"[*] Running Parity Verification on dummy input...")
    try:
        import numpy as np
        import onnxruntime as ort

        # Create reproducible dummy input
        np.random.seed(42)
        dummy_input = np.random.uniform(0.0, 1.0, size=(1, 3, 224, 224)).astype(np.float32)

        # Run ONNX Runtime
        ort_sess = ort.InferenceSession(str(target_onnx))
        input_name = ort_sess.get_inputs()[0].name
        onnx_raw = ort_sess.run(None, {input_name: dummy_input})[0]

        # Normalize ONNX output if not already softmax
        if abs(float(np.sum(onnx_raw)) - 1.0) > 0.05:
            e_x = np.exp(onnx_raw - np.max(onnx_raw, axis=-1, keepdims=True))
            onnx_probs = e_x / np.sum(e_x, axis=-1, keepdims=True)
        else:
            onnx_probs = onnx_raw

        print(f"[+] ONNX Runtime output shape: {onnx_probs.shape}")
        print(f"[+] ONNX Runtime sample probabilities: {np.round(onnx_probs[0], 4).tolist()}")

        # If PyTorch is available, compare with original model
        try:
            from ultralytics import YOLO
            import torch
            pt_model = YOLO(str(pt_path))
            
            # Use raw torch model inference
            with torch.no_grad():
                tensor_in = torch.from_numpy(dummy_input)
                pt_res = pt_model.model(tensor_in)
                if isinstance(pt_res, (list, tuple)):
                    pt_raw = pt_res[0].cpu().numpy()
                elif hasattr(pt_res, "cpu"):
                    pt_raw = pt_res.cpu().numpy()
                else:
                    pt_raw = np.array(pt_res)

                # Softmax if logits
                if abs(float(np.sum(pt_raw)) - 1.0) > 0.05:
                    e_p = np.exp(pt_raw - np.max(pt_raw, axis=-1, keepdims=True))
                    pt_probs = e_p / np.sum(e_p, axis=-1, keepdims=True)
                else:
                    pt_probs = pt_raw

            max_diff = float(np.max(np.abs(pt_probs - onnx_probs)))
            print(f"[+] Max absolute difference (PyTorch vs ONNX): {max_diff:.6e}")
            if max_diff < 1e-4:
                print(f"[SUCCESS] Parity check PASSED: max diff {max_diff:.6e} < 1e-4")
            else:
                print(f"[WARNING] Parity difference is {max_diff:.6e} (check normalization)")
        except ImportError:
            print("[i] PyTorch/Ultralytics not installed; skipping PyTorch-side comparison.")
            print("[+] ONNX Runtime inference verified successfully.")

    except ImportError as e:
        print(f"[i] onnxruntime/numpy not available in current python environment: {e}")
        print("    Run parity check with: pip install onnxruntime numpy")


def generate_metadata_file():
    metadata = {
        "name": "FarmOne Animal Disease Classifier",
        "version": "1.0.0",
        "defaultModel": "cattle",
        "input": PREPROCESSING_METADATA["input"],
        "output": PREPROCESSING_METADATA["output"],
        "models": {
            "cattle": {
                "filename": "cattle_best.onnx",
                "modelPath": "/models/cattle_best.onnx",
                "fallbackPath": "/models/model.onnx",
                "inputName": "images",
                "outputName": "output0",
                "classes": MODEL_SPECS["cattle"]["classes"],
                "classNames": MODEL_SPECS["cattle"]["class_names"]
            },
            "poultry": {
                "filename": "poultry_best.onnx",
                "modelPath": "/models/poultry_best.onnx",
                "fallbackPath": "/models/poultry_best.onnx",
                "inputName": "images",
                "outputName": "output0",
                "classes": MODEL_SPECS["poultry"]["classes"],
                "classNames": MODEL_SPECS["poultry"]["class_names"]
            }
        },
        "classes": MODEL_SPECS["cattle"]["classes"],
        "classNames": MODEL_SPECS["cattle"]["class_names"]
    }

    # Load disease catalog from existing metadata if present
    existing_meta_file = PUBLIC_MODELS_DIR / "metadata.json"
    if existing_meta_file.exists():
        try:
            with open(existing_meta_file, "r", encoding="utf-8") as f:
                existing_data = json.load(f)
                if "diseaseCatalog" in existing_data:
                    metadata["diseaseCatalog"] = existing_data["diseaseCatalog"]
        except Exception:
            pass

    out_file = PUBLIC_MODELS_DIR / "metadata.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    print(f"[+] Metadata written to: {out_file}")


def main():
    parser = argparse.ArgumentParser(description="Export FarmOne PyTorch models to ONNX and verify parity.")
    parser.add_argument("--model", choices=["cattle", "poultry", "all"], default="all",
                        help="Which model to export (default: all)")
    parser.add_argument("--opset", type=int, default=17,
                        help="ONNX opset version (15-17 recommended, default: 17)")
    parser.add_argument("--skip-export", action="store_true",
                        help="Skip export and run parity checks on existing ONNX files")
    args = parser.parse_args()

    PUBLIC_MODELS_DIR.mkdir(parents=True, exist_ok=True)

    if args.model == "all":
        for key, spec in MODEL_SPECS.items():
            export_and_verify_model(key, spec, opset=args.opset, skip_export=args.skip_export)
    else:
        export_and_verify_model(args.model, MODEL_SPECS[args.model], opset=args.opset, skip_export=args.skip_export)

    generate_metadata_file()
    print("\n[Done] Export and verification pipeline completed.")


if __name__ == "__main__":
    main()
