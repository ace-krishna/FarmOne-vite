#!/usr/bin/env python3
"""
Prediction script and micro-service for FarmOne ML models.
Handles both Cattle (cattle_best.pt) and Poultry (poultry_best.pt) models.
"""

import sys
import os
import json
import base64
import io
from pathlib import Path
from PIL import Image

SCRIPT_DIR = Path(__file__).resolve().parent
CATTLE_MODEL_PATH = SCRIPT_DIR / "cattle_best.pt"
POULTRY_MODEL_PATH = SCRIPT_DIR / "poultry_best.pt"

# Cache models in memory
_cattle_model = None
_poultry_model = None

def get_cattle_model():
    global _cattle_model
    if _cattle_model is None:
        from ultralytics import YOLO
        _cattle_model = YOLO(str(CATTLE_MODEL_PATH))
    return _cattle_model

def get_poultry_model():
    global _poultry_model
    if _poultry_model is None:
        from ultralytics import YOLO
        _poultry_model = YOLO(str(POULTRY_MODEL_PATH))
    return _poultry_model

DISEASE_METADATA = {
    # Cattle diseases
    "foot-and-mouth": {
        "severity": "critical",
        "displayName": {
            "en": "Foot-and-Mouth Disease (FMD)",
            "hi": "खुरपका-मुंहपका रोग (FMD)",
            "mr": "लाळ-खुरकूत रोग (FMD)"
        },
        "symptoms": {
            "en": "Blisters/sores in mouth and hooves, excessive salivation, lameness, and high fever.",
            "hi": "मुंह व खुरों के बीच छाले, अत्यधिक लार टपकना, लंगड़ापन और तेज बुखार।",
            "mr": "तोंड व खुरांमध्ये फोड, सतत लाळ गळणे, लंगडणे आणि तीव्र ताप."
        },
        "action": {
            "en": "Isolate the animal immediately. Apply 1% potassium permanganate or boro-glycerine to mouth sores. Contact a veterinarian immediately.",
            "hi": "पशु को तुरंत अलग करें। मुंह के छालों पर 1% पोटेशियम परमैंगनेट लगाएं। तुरंत पशु चिकित्सक से संपर्क करें।",
            "mr": "बाधित जनावराला त्वरित वेगळे करा. पोटॅशियम परमँगनेटच्या पाण्याने तोंड धुवा. तात्काळ पशुवैद्यकांचा सल्ला घ्या."
        }
    },
    "lumpy": {
        "severity": "critical",
        "displayName": {
            "en": "Lumpy Skin Disease (LSD)",
            "hi": "लम्पी त्वचा रोग (LSD)",
            "mr": "लंपी त्वचा रोग (LSD)"
        },
        "symptoms": {
            "en": "Hard, raised nodules (2-5 cm) on skin, fever, swollen lymph nodes, and reduction in milk yield.",
            "hi": "त्वचा पर सख्त गांठें (2-5 सेमी), तेज बुखार, लिम्फ नोड्स में सूजन और दूध उत्पादन में कमी।",
            "mr": "त्वचेवर गाठी (२-५ सेमी), ताप, लिम्फ नोड्सना सूज आणि दुधात घट."
        },
        "action": {
            "en": "Isolate the animal. Use neem oil/repellents against flies and mosquitoes. Provide fever medication under veterinary care.",
            "hi": "पशु को अलग रखें। मक्खी-मच्छरों से बचाव के लिए नीम तेल का छिड़काव करें। पशु चिकित्सक की देखरेख में दवाएं दें।",
            "mr": "जनावराला वेगळे ठेवा. डास-माशांपासून संरक्षणासाठी कडुनिंबाचा धूर/तेल वापरा. डॉक्टरांच्या सल्ल्याने औषध द्या."
        }
    },
    "healthy": {
        "severity": "normal",
        "displayName": {
            "en": "Healthy Cattle",
            "hi": "स्वस्थ मवेशी",
            "mr": "निरोगी जनावर"
        },
        "symptoms": {
            "en": "Bright alert eyes, smooth coat, normal rumination and active appetite.",
            "hi": "चमकदार आंखें, सामान्य जुगाली, स्वस्थ त्वचा और अच्छी भूख।",
            "mr": "टवटवीत डोळे, नियमित रवंथ, चांगली भूक व तजेलदार त्वचा."
        },
        "action": {
            "en": "Maintain regular balanced nutrition, clean water, and stay up to date with vaccination schedules.",
            "hi": "संतुलित आहार, स्वच्छ पानी दें और टीकाकरण शेड्यूल समय पर पूरा रखें।",
            "mr": "नियमित सकस आहार, स्वच्छ पाणी द्या आणि लसीकरण वेळेवर पूर्ण ठेवा."
        }
    },

    # Poultry diseases
    "Bumblefoot": {
        "severity": "moderate",
        "displayName": {
            "en": "Bumblefoot (Pododermatitis)",
            "hi": "बम्बलफूट (पैर का संक्रमण)",
            "mr": "बंबलफूट (पायाचे संक्रमण)"
        },
        "symptoms": {
            "en": "Swollen footpad, limping, black core/scab on the sole of the foot.",
            "hi": "पंजे में सूजन, लंगड़ाना, तलवे पर काला घाव या पपड़ी।",
            "mr": "पायाच्या तळव्यात सूज, लंगडणे, तळव्यावर काळी खपली."
        },
        "action": {
            "en": "Soak foot in warm Epsom salt water. Clean with betadine, apply antibacterial ointment, and wrap with vet wrap.",
            "hi": "गुनगुने एप्सम नमक के पानी में पैर भिगोएं। बीटाडीन से साफ कर मलहम लगाएं व पट्टी बांधें।",
            "mr": "कोमट मिठाच्या पाण्यात पाय भिजवा. बिटाडिनने जखम स्वच्छ करून मलमपट्टी करा."
        }
    },
    "Fowlpox": {
        "severity": "moderate",
        "displayName": {
            "en": "Fowl Pox (Avian Pox)",
            "hi": "फाउल पॉक्स (मुर्गी की चेचक)",
            "mr": "कोंबड्यांची देवी (फाऊल पॉक्स)"
        },
        "symptoms": {
            "en": "Wart-like nodules and scabs on comb, wattles, eyelids, and beak.",
            "hi": "कलगी, गलकंबल और आंखों के पास मस्से जैसे दाने व पपड़ी।",
            "mr": "तुरा, गळ्यातील पोळी व डोळ्यांभोवती चामखीळीसारखे फोड."
        },
        "action": {
            "en": "Isolate affected birds. Dab lesions with dilute iodine. Add Vitamin A to drinking water and vaccinate the rest.",
            "hi": "बीमार पक्षियों को अलग करें। दानों पर आयोडीन लगाएं। पीने के पानी में विटामिन-ए दें।",
            "mr": "आजारी पक्षी वेगळे करा. फोडांवर सौम्य आयोडीन लावा. पिण्याच्या पाण्यातून जीवनसत्त्व-अ द्या."
        }
    },
    "coryza": {
        "severity": "critical",
        "displayName": {
            "en": "Infectious Coryza",
            "hi": "संक्रामक कोरायजा",
            "mr": "संसर्गजन्य कोरायझा"
        },
        "symptoms": {
            "en": "Facial swelling, foul-smelling nasal discharge, conjunctivitis, and breathing difficulty.",
            "hi": "चेहरे पर सूजन, नाक से दुर्गंधयुक्त स्राव, आंखों से पानी, सांस लेने में तकलीफ।",
            "mr": "चेहऱ्यावर सूज, नाकातून दुर्गंधीयुक्त पाणी, डोळे चोळणे, धाप लागणे."
        },
        "action": {
            "en": "Isolate infected birds. Administer prescribed antibiotics under veterinary guidance. Sanitize all waterers.",
            "hi": "तुरंत अलग करें। डॉक्टर की सलाह से एंटीबायोटिक दें। पानी के बर्तनों को कीटाणुरहित करें।",
            "mr": "तात्काळ विलगीकरण करा. डॉक्टरांच्या सल्ल्याने प्रतिजैविके द्या. पिण्याच्या भांड्यांची स्वच्छता राखा."
        }
    },
    "crd": {
        "severity": "critical",
        "displayName": {
            "en": "Chronic Respiratory Disease (CRD)",
            "hi": "क्रॉनिक रेस्पिरेटरी डिजीज (CRD)",
            "mr": "क्रॉनिक रेस्पिरेटरी डिसीज (CRD)"
        },
        "symptoms": {
            "en": "Coughing, rattling breathing sounds, nasal discharge, foamy eyes, and stunted growth.",
            "hi": "लगातार खांसी, सांस में घरघराहट, नाक बहना, आंखों में झाग।",
            "mr": "सतत खोकला, श्वास घेताना घरघर आवाज येणे, डोळ्यांत फेस येणे."
        },
        "action": {
            "en": "Administer antibiotics (Tylosin/Doxycycline) as advised by avian vet. Eliminate dampness and reduce ammonia in coop.",
            "hi": "डॉक्टर की सलाह से टायलोसिन दवा दें। बाड़े में वेंटिलेशन सुधारें और नमी हटाएं।",
            "mr": "पशुवैद्यकांच्या सल्ल्याने टायलोसिन औषध द्या. गोठ्यात हवा खेळती ठेवा व ओलावा नष्ट करा."
        }
    },
    "Healthy": {
        "severity": "normal",
        "displayName": {
            "en": "Healthy Poultry",
            "hi": "स्वस्थ मुर्गी / पक्षी",
            "mr": "निरोगी पक्षी"
        },
        "symptoms": {
            "en": "Bright red comb, alert posture, clear eyes, clean feathers, active feeding.",
            "hi": "लाल कलगी, फुर्तीली चाल, साफ आंखें, सामान्य दाना चुगना।",
            "mr": "लाल तुरा, चपळ हालचाल, स्वच्छ डोळे व चांगली भूक."
        },
        "action": {
            "en": "Provide quality feed and fresh water. Maintain clean litter and biosecurity.",
            "hi": "संतुलित आहार व साफ पानी दें। बाड़े में सूखा बिछावन व स्वच्छता रखें।",
            "mr": "सकस खाद्य व ताजे पाणी द्यावे. गोठ्यात स्वच्छता राखावी."
        }
    }
}

def decode_image(data_str: str) -> Image.Image:
    if data_str.startswith("data:image"):
        data_str = data_str.split(",", 1)[1]
    raw = base64.b64decode(data_str)
    return Image.open(io.BytesIO(raw)).convert("RGB")

def predict(image_input, species: str = None, model_name: str = None):
    # Route model
    is_poultry = (
        (model_name and model_name.lower() in ("poultry", "hen", "bird", "chicken")) or
        (species and species.lower() in ("hen", "chicken", "poultry", "bird", "broiler", "layer"))
    )

    selected_model_type = "poultry" if is_poultry else "cattle"
    model = get_poultry_model() if is_poultry else get_cattle_model()

    if isinstance(image_input, str):
        if image_input.startswith("data:image") or len(image_input) > 500:
            pil_img = decode_image(image_input)
        else:
            pil_img = Image.open(image_input).convert("RGB")
    else:
        pil_img = image_input

    results = model(pil_img, imgsz=224, verbose=False)
    probs_obj = results[0].probs
    top1_idx = int(probs_obj.top1)
    confidence = float(probs_obj.top1conf)
    names = model.names
    condition_key = names[top1_idx]

    all_probs = {}
    for idx, name in names.items():
        all_probs[name] = round(float(probs_obj.data[idx]), 4)

    is_healthy = condition_key.lower() == "healthy"
    meta = DISEASE_METADATA.get(condition_key, {
        "severity": "normal" if is_healthy else "moderate",
        "displayName": {"en": condition_key, "hi": condition_key, "mr": condition_key},
        "symptoms": {"en": "Visual detection completed.", "hi": "जांच पूर्ण हुई।", "mr": "तपासणी पूर्ण झाली."},
        "action": {"en": "Consult a veterinarian for detailed checkup.", "hi": "विस्तृत जांच के लिए पशु चिकित्सक से परामर्श लें।", "mr": "सविस्तर तपासणीसाठी पशुवैद्यकांचा सल्ला घ्या."}
    })

    return {
        "success": True,
        "modelType": selected_model_type,
        "species": species or ("hen" if is_poultry else "cattle"),
        "condition": condition_key,
        "confidence": round(confidence * 100, 1),
        "isHealthy": is_healthy,
        "severity": meta["severity"],
        "displayName": meta["displayName"],
        "symptoms": meta["symptoms"],
        "action": meta["action"],
        "probabilities": all_probs,
        "timestamp": results[0].speed
    }

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--server":
        port = int(sys.argv[2]) if len(sys.argv) > 2 else 5005
        from http.server import HTTPServer, BaseHTTPRequestHandler

        class PredictHandler(BaseHTTPRequestHandler):
            def do_OPTIONS(self):
                self.send_response(200)
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
                self.send_header("Access-Control-Allow-Headers", "Content-Type")
                self.end_headers()

            def do_GET(self):
                if self.path == "/health":
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(json.dumps({"status": "ok", "models": ["cattle_best.pt", "poultry_best.pt"]}).encode())
                else:
                    self.send_response(404)
                    self.end_headers()

            def do_POST(self):
                if self.path == "/predict" or self.path == "/api/diagnose":
                    content_length = int(self.headers.get("Content-Length", 0))
                    post_data = self.rfile.read(content_length)
                    try:
                        req = json.loads(post_data.decode("utf-8"))
                        image_data = req.get("image")
                        species = req.get("species")
                        model_name = req.get("model")
                        res = predict(image_data, species=species, model_name=model_name)
                        self.send_response(200)
                        self.send_header("Content-Type", "application/json")
                        self.send_header("Access-Control-Allow-Origin", "*")
                        self.end_headers()
                        self.wfile.write(json.dumps(res).encode())
                    except Exception as e:
                        self.send_response(500)
                        self.send_header("Content-Type", "application/json")
                        self.send_header("Access-Control-Allow-Origin", "*")
                        self.end_headers()
                        self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode())
                else:
                    self.send_response(404)
                    self.end_headers()

        server = HTTPServer(("127.0.0.1", port), PredictHandler)
        print(f"FarmOne ML Microservice running on http://127.0.0.1:{port}", flush=True)
        # Pre-warm models
        get_cattle_model()
        get_poultry_model()
        print("Models pre-warmed and ready for inference.", flush=True)
        server.serve_forever()
    else:
        # CLI / Stdin mode
        input_data = sys.stdin.read().strip()
        if input_data:
            req = json.loads(input_data)
            res = predict(req.get("image"), species=req.get("species"), model_name=req.get("model"))
            print(json.dumps(res, indent=2))
        else:
            print(json.dumps({"error": "No input JSON received on stdin."}))
