import csv, os
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import transforms, models
from torch.utils.data import Dataset, DataLoader
from PIL import Image
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns


# Set random seeds for reproducibility
torch.manual_seed(42)
np.random.seed(42)

# Device configuration
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Device has gpu for configuration
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")
print("CUDA available:", torch.cuda.is_available())
if torch.cuda.is_available():
    print("CUDA device name:", torch.cuda.get_device_name(0))

## 1. Dataset Preparation
class PomeloDataset(Dataset):
    def __init__(self, split_dir, transform=None):
        
        """
        split_dir : path to train/, valid/ or test/ folder
        transform : torchvision transforms
        """
        self.transform      = transform
        self.images         = []          # list of (path, label_idx)
        self.class_to_idx   = {}          # {"Ripe":0, "Overripe":1, ...}

        csv_path = os.path.join(split_dir, "_classes.csv")
        with open(csv_path, newline='') as f:
            reader  = csv.reader(f)
            header  = next(reader)

            # index 0 is always 'filename'; the rest are candidate classes
            class_cols = [(i, col) for i, col in enumerate(header[1:], start=1)
                          if col.lower() not in {"testset"}]  # skip helper cols

            # build class_to_idx mapping in the order encountered
            for _, col in class_cols:
                if col not in self.class_to_idx:
                    self.class_to_idx[col] = len(self.class_to_idx)

            for row in reader:
                if not row:
                    continue  # skip blank lines

                img_name = row[0].strip()
                # find the first class column with a '1'
                cls_name = None
                for idx, col in class_cols:
                    if row[idx].strip() == "1":
                        cls_name = col
                        break

                if cls_name is None:
                    # no positive label found; optionally skip or raise
                    continue

                label_idx = self.class_to_idx[cls_name]
                img_path  = os.path.join(split_dir, img_name)
                self.images.append((img_path, label_idx))

    @property
    def classes(self):
        """
        Return the list of class names (e.g., ['Overripe', 'Ripe'])
        in the exact order that maps to their integer labels.
        This keeps external code compatible with the standard
        torchvision.datasets.ImageFolder API.
        """
        # Sort by the numeric index we assigned in class_to_idx
        return [
            cls_name
            for cls_name, _ in sorted(
                self.class_to_idx.items(),
                key=lambda pair: pair[1]  # pair = (class_name, index)
            )
        ]

    def __len__(self):
        return len(self.images)

    def __getitem__(self, idx):
        img_path, label = self.images[idx]
        img = Image.open(img_path).convert("RGB")
        if self.transform:
            img = self.transform(img)
        return img, label

# Define transforms with augmentation for training
train_transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# Simpler transform for validation/test
val_transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])


# ========== ONLY THIS BLOCK RUNS WHEN YOU EXECUTE THE SCRIPT DIRECTLY ==========
if __name__ == "__main__":
    # Absolute path on your machine:
    dataset_dir = r"C:\Users\zacca\Desktop\Testing\Pomelo Ripeness Detection using YOLOv8 Network.v4i.multiclass"
    train_dataset = PomeloDataset(os.path.join(dataset_dir, 'train'), transform=train_transform)
    val_dataset   = PomeloDataset(os.path.join(dataset_dir, 'valid'), transform=val_transform)
    batch_size = 16
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)
    print(f"Train dataset size: {len(train_dataset)}")
    print(f"Validation dataset size: {len(val_dataset)}")
    print(f"Number of classes: {len(train_dataset.classes)}")
    print(f"Class names: {train_dataset.classes}")
    # Main Training Process
    num_classes = len(train_dataset.classes)
    model = PomeloGradeClassifier(num_classes=num_classes).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    print("Phase 1: Training classifier head only")
    model, history = train_model(model, train_loader, val_loader, criterion, optimizer, num_epochs=10)
    print("\nPhase 2: Fine-tuning with some base layers unfrozen")
    model.unfreeze_layers(num_layers=5)
    optimizer = optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=0.0001)
    model, history = train_model(model, train_loader, val_loader, criterion, optimizer, num_epochs=15)
    print("\nFinal Evaluation:")
    evaluate_model(model, val_loader, device, train_dataset.classes)
    # Export the trained model
    export_model_for_production(model)
    print("\nPomeGrade training and evaluation complete!")
    # Test inference
    if len(val_dataset) > 0:
        grader = PomeloGrader('best_pomelo_model.pth', train_dataset.classes)
        test_image_path = val_dataset.images[0][0]
        print(f"\nTesting inference on: {test_image_path}")
        result = grader.predict(test_image_path)
        print("Prediction Result:")
        for k, v in result.items():
            print(f"{k}: {v}")
        plt.figure(figsize=(5, 5))
        plt.imshow(Image.open(test_image_path))
        plt.title(f"Predicted: {result['class']} ({result['confidence']:.2f})")
        plt.axis('off')
        plt.show()