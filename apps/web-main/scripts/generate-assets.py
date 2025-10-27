#!/usr/bin/env python3
"""
Generate placeholder images and assets for Zoptal website
"""

import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

# Base directory for public assets
BASE_DIR = Path(__file__).parent.parent / "public"

# Color scheme
PRIMARY_COLOR = (37, 99, 235)  # Blue
SECONDARY_COLOR = (75, 85, 99)  # Gray
WHITE = (255, 255, 255)
LIGHT_GRAY = (243, 244, 246)

def create_placeholder_image(width, height, text, bg_color=PRIMARY_COLOR, text_color=WHITE):
    """Create a placeholder image with text"""
    img = Image.new('RGB', (width, height), bg_color)
    draw = ImageDraw.Draw(img)
    
    # Try to use a font, fallback to default if not available
    try:
        font_size = max(10, min(width, height) // 10)
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except:
        try:
            font = ImageFont.load_default()
        except:
            # Use basic font if load_default fails
            font = None
    
    # Calculate text position
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    x = (width - text_width) // 2
    y = (height - text_height) // 2
    
    # Draw text
    draw.text((x, y), text, fill=text_color, font=font)
    
    # Add size info
    size_text = f"{width}x{height}"
    size_bbox = draw.textbbox((0, 0), size_text, font=font)
    size_width = size_bbox[2] - size_bbox[0]
    draw.text((width - size_width - 10, height - 30), size_text, fill=text_color, font=font)
    
    return img

def generate_icons():
    """Generate PWA icons"""
    icons_dir = BASE_DIR / "images" / "icons"
    icons_dir.mkdir(parents=True, exist_ok=True)
    
    sizes = [72, 96, 128, 144, 152, 192, 384, 512]
    
    for size in sizes:
        img = create_placeholder_image(size, size, "Z", PRIMARY_COLOR, WHITE)
        img.save(icons_dir / f"icon-{size}x{size}.png")
        print(f"✓ Created icon-{size}x{size}.png")
    
    # Badge icon
    img = create_placeholder_image(72, 72, "Z", SECONDARY_COLOR, WHITE)
    img.save(icons_dir / "badge-72x72.png")
    print("✓ Created badge-72x72.png")
    
    # Shortcut icons
    shortcuts = ["quote", "services", "cases", "blog"]
    for shortcut in shortcuts:
        img = create_placeholder_image(192, 192, shortcut[0].upper(), PRIMARY_COLOR, WHITE)
        img.save(icons_dir / f"shortcut-{shortcut}.png")
        print(f"✓ Created shortcut-{shortcut}.png")

def generate_screenshots():
    """Generate screenshot placeholders"""
    screenshots_dir = BASE_DIR / "images" / "screenshots"
    screenshots_dir.mkdir(parents=True, exist_ok=True)
    
    screenshots = [
        ("desktop-home.png", 1280, 720, "Zoptal Homepage"),
        ("mobile-home.png", 390, 844, "Zoptal Mobile"),
        ("desktop-services.png", 1280, 720, "Services Page"),
        ("mobile-services.png", 390, 844, "Mobile Services"),
    ]
    
    for filename, width, height, text in screenshots:
        img = create_placeholder_image(width, height, text, LIGHT_GRAY, SECONDARY_COLOR)
        img.save(screenshots_dir / filename)
        print(f"✓ Created {filename}")

def generate_logo():
    """Generate logo images"""
    images_dir = BASE_DIR / "images"
    images_dir.mkdir(parents=True, exist_ok=True)
    
    # Main logo
    logo = create_placeholder_image(200, 60, "ZOPTAL", WHITE, PRIMARY_COLOR)
    logo.save(images_dir / "logo.png")
    print("✓ Created logo.png")
    
    # Logo variations
    logo_dark = create_placeholder_image(200, 60, "ZOPTAL", SECONDARY_COLOR, WHITE)
    logo_dark.save(images_dir / "logo-dark.png")
    print("✓ Created logo-dark.png")

def generate_favicon():
    """Generate favicon"""
    favicon = create_placeholder_image(32, 32, "Z", PRIMARY_COLOR, WHITE)
    favicon.save(BASE_DIR / "favicon.ico")
    print("✓ Created favicon.ico")

def generate_client_logos():
    """Generate client logo placeholders"""
    clients_dir = BASE_DIR / "images" / "clients"
    clients_dir.mkdir(parents=True, exist_ok=True)
    
    clients = ["securebank", "retailpro", "techcorp", "healthplus", "edutech", "financeai"]
    
    for client in clients:
        img = create_placeholder_image(200, 80, client.upper(), LIGHT_GRAY, SECONDARY_COLOR)
        img.save(clients_dir / f"{client}-logo.png")
        print(f"✓ Created {client}-logo.png")

def generate_hero_images():
    """Generate hero section images"""
    hero_dir = BASE_DIR / "images" / "hero"
    hero_dir.mkdir(parents=True, exist_ok=True)
    
    hero_images = [
        ("hero-main.jpg", 1920, 1080, "AI Development"),
        ("hero-services.jpg", 1920, 800, "Our Services"),
        ("hero-about.jpg", 1920, 800, "About Us"),
        ("hero-contact.jpg", 1920, 800, "Contact Us"),
    ]
    
    for filename, width, height, text in hero_images:
        img = create_placeholder_image(width, height, text, PRIMARY_COLOR, WHITE)
        img.save(hero_dir / filename)
        print(f"✓ Created {filename}")

def generate_service_images():
    """Generate service images"""
    services_dir = BASE_DIR / "images" / "services"
    services_dir.mkdir(parents=True, exist_ok=True)
    
    services = [
        "ai-development",
        "web-development",
        "mobile-development",
        "software-development",
        "api-development",
        "devops",
        "quality-assurance",
        "saas-development"
    ]
    
    for service in services:
        img = create_placeholder_image(800, 600, service.replace("-", " ").title(), LIGHT_GRAY, SECONDARY_COLOR)
        img.save(services_dir / f"{service}.jpg")
        print(f"✓ Created {service}.jpg")

def generate_team_avatars():
    """Generate team member avatars"""
    team_dir = BASE_DIR / "images" / "team"
    team_dir.mkdir(parents=True, exist_ok=True)
    
    team_members = ["john-doe", "jane-smith", "mike-johnson", "sarah-williams", "alex-chen", "maria-garcia"]
    
    for member in team_members:
        img = create_placeholder_image(400, 400, member.split("-")[0][0].upper(), SECONDARY_COLOR, WHITE)
        img.save(team_dir / f"{member}.jpg")
        print(f"✓ Created {member}.jpg")

def generate_og_images():
    """Generate Open Graph images"""
    og_dir = BASE_DIR / "images" / "og"
    og_dir.mkdir(parents=True, exist_ok=True)
    
    og_images = [
        ("default.jpg", 1200, 630, "Zoptal - AI Development"),
        ("services.jpg", 1200, 630, "Our Services"),
        ("about.jpg", 1200, 630, "About Zoptal"),
        ("contact.jpg", 1200, 630, "Contact Us"),
    ]
    
    for filename, width, height, text in og_images:
        img = create_placeholder_image(width, height, text, PRIMARY_COLOR, WHITE)
        img.save(og_dir / filename)
        print(f"✓ Created {filename}")

def main():
    """Generate all assets"""
    print("🎨 Generating placeholder assets for Zoptal...")
    print("-" * 50)
    
    try:
        generate_icons()
        generate_screenshots()
        generate_logo()
        generate_favicon()
        generate_client_logos()
        generate_hero_images()
        generate_service_images()
        generate_team_avatars()
        generate_og_images()
        
        print("-" * 50)
        print("✅ All assets generated successfully!")
        print(f"📁 Assets location: {BASE_DIR}")
        
    except Exception as e:
        print(f"❌ Error generating assets: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())