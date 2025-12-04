from PIL import Image, ImageDraw

def create_placeholder_image(filename, width, height, color):
    try:
        img = Image.new('RGB', (width, height), color=color)
        img.save(filename)
        print(f"Successfully created {filename}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    create_placeholder_image('vercel_featured.png', 1920, 1080, (79, 70, 229))
