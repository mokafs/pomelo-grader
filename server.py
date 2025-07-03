import io
from fastapi import FastAPI, File, UploadFile
from PIL import Image
import torch
from torchvision import transforms
from TrainingModel import val_transform

# Load class names
class_names = ['Ripe', 'Overripe']

# Load model
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
model = torch.jit.load("pomelo_grader.pt", map_location=device)
model.eval()
app = FastAPI()

@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image_tensor = val_transform(image).unsqueeze(0).to(device)
    with torch.no_grad():
        outputs = model(image_tensor)
        probs = torch.nn.functional.softmax(outputs, dim=1)
        _, pred = torch.max(outputs, 1)
    return {
        "class": class_names[pred.item()],
        "confidence": float(probs[0][pred.item()])
    }