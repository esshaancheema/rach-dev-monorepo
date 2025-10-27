#!/usr/bin/env python3
"""
Generate placeholder images for missing assets
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_placeholder_image(width, height, text, filename, bg_color=(74, 144, 226), text_color=(255, 255, 255)):
    """Create a placeholder image with specified dimensions and text."""
    # Create image with blue background
    image = Image.new('RGB', (width, height), bg_color)
    draw = ImageDraw.Draw(image)
    
    # Try to use a better font, fall back to default if not available
    try:
        font_size = min(width, height) // 15
        font = ImageFont.truetype('/System/Library/Fonts/Arial.ttf', font_size)
    except:
        try:
            font_size = min(width, height) // 15
            font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', font_size)
        except:
            font = ImageFont.load_default()
    
    # Calculate text position to center it
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (width - text_width) // 2
    y = (height - text_height) // 2
    
    # Draw text
    draw.text((x, y), text, fill=text_color, font=font)
    
    # Save image
    os.makedirs(os.path.dirname(filename) if os.path.dirname(filename) else '.', exist_ok=True)
    image.save(filename, 'WEBP', quality=85)
    print(f"Created: {filename}")

# Base path for images
base_path = "/Users/eshancheema/Documents/RAG_Apps/Website_Zoptal/apps/web-main/public/images"

# Service images (1200x630 for good aspect ratio)
services = [
    "software-development", "ai-development", "mobile-development", 
    "cloud-devops", "quality-assurance", "ai-agents"
]

for service in services:
    create_placeholder_image(
        1200, 630, 
        service.replace('-', ' ').title(), 
        f"{base_path}/services/{service}.webp"
    )

# Hero images
create_placeholder_image(
    1400, 800, 
    "Dashboard Preview", 
    f"{base_path}/hero/dashboard-preview.webp"
)

# Tech icons (smaller, square)
tech_icons = [
    "nextjs", "nodejs", "python", "aws", "docker", "postgresql"
]

for tech in tech_icons:
    create_placeholder_image(
        64, 64, 
        tech.upper(), 
        f"{base_path}/tech/{tech}.svg",
        bg_color=(45, 55, 72),
        text_color=(255, 255, 255)
    )

# Client logos
clients = [
    "techflow", "financecore", "retailmax", "healthtech", 
    "startuplaunch", "globallogistics", "greenenergy", "edutech"
]

for client in clients:
    create_placeholder_image(
        200, 80, 
        client.title(), 
        f"{base_path}/clients/{client}.svg",
        bg_color=(247, 250, 252),
        text_color=(45, 55, 72)
    )

# Avatar images
avatars = [
    "sarah-chen", "marcus-johnson", "david-kim", 
    "jennifer-walsh", "elena-rodriguez", "ahmed-hassan"
]

for avatar in avatars:
    create_placeholder_image(
        400, 400, 
        avatar.replace('-', ' ').title(), 
        f"{base_path}/avatars/{avatar}.webp",
        bg_color=(99, 102, 241),
        text_color=(255, 255, 255)
    )

print("All placeholder images created successfully!")