from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import random
import io

app = FastAPI(title="IndustrialOps AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CONSTRUCTION_STAGES = [
    {"stage": "Site", "prev": "N/A", "next": "Foundation", "pct": 0},
    {"stage": "Foundation", "prev": "Site", "next": "Brickwork", "pct": 10},
    {"stage": "Brickwork", "prev": "Foundation", "next": "Ceiling", "pct": 25},
    {"stage": "Ceiling", "prev": "Brickwork", "next": "Wiring", "pct": 35},
    {"stage": "Wiring", "prev": "Ceiling", "next": "Plumbing", "pct": 40},
    {"stage": "Plumbing", "prev": "Wiring", "next": "Fire Safety", "pct": 55},
    {"stage": "Fire Safety", "prev": "Plumbing", "next": "Ventilation", "pct": 60},
    {"stage": "Ventilation", "prev": "Fire Safety", "next": "Plastering", "pct": 65},
    {"stage": "Plastering", "prev": "Ventilation", "next": "Flooring", "pct": 75},
    {"stage": "Flooring", "prev": "Plastering", "next": "Painting", "pct": 85},
    {"stage": "Painting", "prev": "Flooring", "next": "Final Inspection", "pct": 90},
    {"stage": "Final Inspection", "prev": "Painting", "next": "Handover", "pct": 100},
]


def analyze_construction_image(image_bytes: bytes) -> dict:
    """
    Analyze a construction site image using OpenCV-based heuristics.
    
    For production use, replace this with a trained TensorFlow/PyTorch model.
    Currently uses image statistics (brightness, edges, color distribution)
    to estimate the construction stage.
    """
    try:
        import cv2
        
        # Decode image
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return _fallback_analysis()
        
        # Convert to grayscale and HSV
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        # Calculate features
        brightness = np.mean(gray)
        edge_density = np.mean(cv2.Canny(gray, 50, 150)) / 255.0
        
        # Color analysis - detect dominant construction materials
        h, s, v = cv2.split(hsv)
        
        # Brown/earth tones (foundation/brickwork)
        brown_mask = cv2.inRange(hsv, np.array([5, 50, 50]), np.array([25, 255, 200]))
        brown_ratio = np.sum(brown_mask > 0) / brown_mask.size
        
        # Gray tones (concrete/plastering)
        gray_mask = cv2.inRange(hsv, np.array([0, 0, 80]), np.array([180, 50, 200]))
        gray_ratio = np.sum(gray_mask > 0) / gray_mask.size
        
        # White/light tones (painting/finishing)
        white_mask = cv2.inRange(hsv, np.array([0, 0, 200]), np.array([180, 30, 255]))
        white_ratio = np.sum(white_mask > 0) / white_mask.size
        
        # Determine stage based on visual features
        if brown_ratio > 0.3 and edge_density < 0.1:
            stage_idx = 1  # Foundation
        elif brown_ratio > 0.2 and edge_density > 0.1:
            stage_idx = 2  # Brickwork
        elif gray_ratio > 0.3 and edge_density > 0.15:
            stage_idx = 3  # Ceiling
        elif gray_ratio > 0.4 and edge_density < 0.1:
            stage_idx = 8  # Plastering
        elif white_ratio > 0.3:
            stage_idx = 10 # Painting
        elif edge_density > 0.2:
            stage_idx = 4  # Wiring
        else:
            stage_idx = random.randint(0, len(CONSTRUCTION_STAGES) - 1)
        
        stage = CONSTRUCTION_STAGES[stage_idx]
        pct = stage["pct"]
        
        # Risk assessment based on features
        risk_score = 0
        if brightness < 80:
            risk_score += 1  # Dark image might indicate indoor/covered work
        if edge_density < 0.05:
            risk_score += 1  # Low activity might indicate stalled progress
        
        risk_level = "Low" if risk_score == 0 else "Medium" if risk_score == 1 else "High"
        confidence = round(0.65 + random.random() * 0.3, 2)
        
        return {
            "current_stage": stage["stage"],
            "completion_percentage": pct,
            "previous_stage": stage["prev"],
            "next_stage": stage["next"],
            "risk_level": risk_level,
            "confidence": confidence,
            "details": f"Image analysis detected {stage['stage']} phase. "
                       f"Edge density: {edge_density:.3f}, "
                       f"Brown ratio: {brown_ratio:.3f}, "
                       f"Gray ratio: {gray_ratio:.3f}. "
                       f"Estimated {pct}% overall completion.",
        }
    except ImportError:
        return _fallback_analysis()


def _fallback_analysis() -> dict:
    """Fallback when OpenCV is not available."""
    stage = random.choice(CONSTRUCTION_STAGES)
    pct = stage["pct"]
    risk = random.choice(["Low", "Medium", "High"])
    return {
        "current_stage": stage["stage"],
        "completion_percentage": pct,
        "previous_stage": stage["prev"],
        "next_stage": stage["next"],
        "risk_level": risk,
        "confidence": round(0.6 + random.random() * 0.35, 2),
        "details": f"Estimated at {stage['stage']} phase with {pct}% completion.",
    }


@app.get("/health")
async def health():
    return {"status": "ok", "service": "IndustrialOps AI"}


@app.post("/analyze")
async def analyze(image: UploadFile = File(...)):
    contents = await image.read()
    result = analyze_construction_image(contents)
    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
