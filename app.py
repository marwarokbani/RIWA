import os
import json
import io
import re
from flask import Flask, render_template, jsonify, request, send_file, send_from_directory
from PIL import Image, ImageDraw, ImageFont, ImageColor

app = Flask(__name__, static_folder='static', template_folder='templates')
app.secret_key = 'riwa_studio_direct_access_key'

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CARDS_DIR = os.path.join(BASE_DIR, 'Cards')
SAVED_DIR = os.path.join(BASE_DIR, 'saved_projects')
UPLOADS_DIR = os.path.join(BASE_DIR, 'uploads')

os.makedirs(SAVED_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)

FONTS_DIR = os.path.join(BASE_DIR, 'fonts')

def get_font(font_name, size):
    """Load Google TTF font from fonts directory or fallback to system font."""
    clean_name = font_name.split(',')[0].replace("'", "").replace('"', "").strip()
    
    font_map = {
        'great vibes': 'GreatVibes.ttf',
        'tangerine': 'Tangerine.ttf',
        'alex brush': 'AlexBrush.ttf',
        'parisienne': 'Parisienne.ttf',
        'dancing script': 'DancingScript.ttf',
        'playfair display': 'PlayfairDisplay.ttf',
        'cinzel': 'Cinzel.ttf',
        'cormorant garamond': 'PlayfairDisplay.ttf',
        'marcellus': 'Marcellus.ttf',
        'montserrat': 'Montserrat.ttf',
        'outfit': 'Outfit.ttf'
    }
    
    filename = font_map.get(clean_name.lower())
    if filename:
        font_path = os.path.join(FONTS_DIR, filename)
        if os.path.exists(font_path):
            try:
                return ImageFont.truetype(font_path, size=size)
            except Exception as e:
                print(f"Error loading {font_path}: {e}")
                
    for sf in ["georgia.ttf", "arial.ttf", "times.ttf"]:
        try:
            return ImageFont.truetype(sf, size=size)
        except Exception:
            continue
    return ImageFont.load_default()

def get_external_host_url():
    """Build external HTTPS base URL for OpenGraph and social previews."""
    host = request.host
    scheme = request.headers.get('X-Forwarded-Proto', 'https')
    if host.startswith('localhost') or host.startswith('127.0.0.1'):
        scheme = 'http'
    return f"{scheme}://{host}"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/Cards/<path:filename>')
def serve_card(filename):
    return send_from_directory(CARDS_DIR, filename)

@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    return send_from_directory(UPLOADS_DIR, filename)

@app.route('/Logo.png')
def serve_logo():
    return send_from_directory(BASE_DIR, 'Logo.png')

@app.route('/card/<card_id>')
def view_shared_card(card_id):
    """Serve dynamic HTML page with OpenGraph tags pointing to custom PNG image for Messenger/WhatsApp previews."""
    clean_id = re.sub(r'[^a-zA-Z0-9_-]', '', card_id)
    image_filename = f"card_{clean_id}.png"
    image_path = os.path.join(UPLOADS_DIR, image_filename)
    
    host_url = get_external_host_url()
    image_url = f"{host_url}/uploads/{image_filename}"
    page_url = f"{host_url}/card/{clean_id}"
    
    card_exists = os.path.exists(image_path)
    
    return render_template('card.html',
                           card_id=clean_id,
                           card_exists=card_exists,
                           image_url=image_url,
                           page_url=page_url,
                           title="Invitation de Mariage - RIWA",
                           description="« Un beau moment commence ici. » Découvrez cette magnifique invitation personnalisée.")

def create_gradient_image(width, height, grad_type):
    """Generate linear gradient image for Pillow text masking."""
    base = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(base)
    
    colors = [
        (191, 149, 63), (252, 246, 186), (179, 135, 40), (251, 245, 183), (170, 119, 28)
    ]
    if 'rosegold' in grad_type:
        colors = [(224, 169, 109), (249, 213, 187), (196, 123, 89), (140, 76, 54)]
    elif 'champagne' in grad_type:
        colors = [(255, 246, 229), (243, 220, 177), (224, 190, 132)]
    elif 'bronze' in grad_type:
        colors = [(108, 79, 35), (168, 129, 66), (74, 53, 5)]
    elif 'royalpurple' in grad_type:
        colors = [(75, 0, 130), (138, 43, 226)]
    elif 'silver' in grad_type:
        colors = [(230, 233, 240), (238, 241, 245), (128, 136, 150)]

    num_colors = len(colors)
    for y in range(height):
        t = y / float(height) if height > 1 else 0.5
        idx = min(int(t * (num_colors - 1)), num_colors - 2)
        local_t = (t * (num_colors - 1)) - idx
        
        c1 = colors[idx]
        c2 = colors[idx + 1]
        
        r = int(c1[0] + (c2[0] - c1[0]) * local_t)
        g = int(c1[1] + (c2[1] - c1[1]) * local_t)
        b = int(c1[2] + (c2[2] - c1[2]) * local_t)
        
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
        
    return base

def render_card_pillow(filename, layers, preview_width=800, preview_height=1200):
    """Render card composite image on server side using Pillow with full gradient and font size accuracy."""
    card_path = os.path.join(CARDS_DIR, filename)
    if not os.path.exists(card_path):
        raise FileNotFoundError(f"Fichier {filename} non trouvé")

    base_img = Image.open(card_path).convert('RGBA')
    orig_w, orig_h = base_img.size
    
    p_w = float(preview_width or 800)
    p_h = float(preview_height or 1200)
    
    scale_y = orig_h / p_h

    composite = base_img.copy()

    for layer in layers:
        content = str(layer.get('text', '')).strip()
        if not content:
            continue

        percent_x = float(layer.get('pctX', 50))
        percent_y = float(layer.get('pctY', 50))
        
        x = (percent_x / 100.0) * orig_w
        y = (percent_y / 100.0) * orig_h

        font_family = layer.get('fontFamily', 'Playfair Display')

        font_boost = 1.0
        clean_family = font_family.lower()
        if 'tangerine' in clean_family:
            font_boost = 1.70
        elif 'great vibes' in clean_family or 'greatvibes' in clean_family:
            font_boost = 1.40
        elif 'alex brush' in clean_family or 'alexbrush' in clean_family:
            font_boost = 1.35
        elif 'parisienne' in clean_family:
            font_boost = 1.30
        elif 'dancing script' in clean_family:
            font_boost = 1.25

        font_size = max(14, int(float(layer.get('fontSize', 24)) * scale_y * font_boost))
        color_hex = layer.get('color', '#d4af37')
        gradient = layer.get('gradient')
        align = layer.get('align', 'center')

        try:
            if color_hex.startswith('#'):
                rgb_color = ImageColor.getrgb(color_hex)
            else:
                rgb_color = (212, 175, 55)
        except Exception:
            rgb_color = (212, 175, 55)
            
        font = get_font(font_family, font_size)
        lines = content.split('\n')

        # Draw onto transparent layer
        mask_img = Image.new('L', base_img.size, 0)
        draw_mask = ImageDraw.Draw(mask_img)

        line_dims = []
        for line in lines:
            bbox = draw_mask.textbbox((0, 0), line, font=font)
            lw = bbox[2] - bbox[0]
            lh = bbox[3] - bbox[1]
            line_dims.append((lw, lh))

        cur_y = y
        for line, (lw, lh) in zip(lines, line_dims):
            cur_x = x
            if align == 'center':
                cur_x = x - (lw / 2.0)
            elif align == 'right':
                cur_x = x - lw

            draw_mask.text((cur_x, cur_y), line, font=font, fill=255)
            cur_y += lh * 1.3

        if gradient:
            grad_type = 'gold'
            if 'rosegold' in str(gradient): grad_type = 'rosegold'
            elif 'champagne' in str(gradient): grad_type = 'champagne'
            elif 'bronze' in str(gradient): grad_type = 'bronze'
            elif 'royalpurple' in str(gradient): grad_type = 'royalpurple'
            elif 'silver' in str(gradient): grad_type = 'silver'
            
            grad_layer = create_gradient_image(orig_w, orig_h, grad_type)
            composite.paste(grad_layer, (0, 0), mask_img)
        else:
            solid_layer = Image.new('RGBA', base_img.size, rgb_color + (255,))
            composite.paste(solid_layer, (0, 0), mask_img)

    return composite.convert('RGB')

@app.route('/api/share-card', methods=['POST'])
def share_card():
    """Receive base64 PNG card image OR JSON payload from frontend, save to uploads, and return dynamic share URL."""
    try:
        import base64
        import uuid
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Données manquantes'}), 400
        
        card_id = uuid.uuid4().hex[:10]
        filename = f"card_{card_id}.png"
        filepath = os.path.join(UPLOADS_DIR, filename)

        if 'image' in data and data['image']:
            img_data_str = data['image']
            if ',' in img_data_str:
                img_data_str = img_data_str.split(',')[1]
            img_bytes = base64.b64decode(img_data_str)
            with open(filepath, 'wb') as f:
                f.write(img_bytes)
        elif 'filename' in data and 'layers' in data:
            card_filename = data.get('filename')
            layers = data.get('layers', [])
            p_w = data.get('previewWidth', 800)
            p_h = data.get('previewHeight', 1200)
            
            composite = render_card_pillow(card_filename, layers, p_w, p_h)
            composite.save(filepath, format='PNG', quality=95)
        else:
            return jsonify({'error': 'Format de données non reconnu'}), 400
            
        host_url = get_external_host_url()
        share_url = f"{host_url}/card/{card_id}"
        image_url = f"{host_url}/uploads/{filename}"
        
        return jsonify({
            'success': True,
            'card_id': card_id,
            'share_url': share_url,
            'image_url': image_url
        })
    except Exception as e:
        print("Share card error:", e)
        return jsonify({'error': str(e)}), 500

@app.route('/api/templates', methods=['GET'])
def get_templates():
    """List all available invitation cards in Cards directory."""
    templates = []
    if os.path.exists(CARDS_DIR):
        for idx, file in enumerate(os.listdir(CARDS_DIR)):
            if file.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                file_path = os.path.join(CARDS_DIR, file)
                try:
                    with Image.open(file_path) as img:
                        w, h = img.size
                except Exception:
                    w, h = (800, 1200)
                
                templates.append({
                    'id': f"template_{idx+1}",
                    'filename': file,
                    'title': f"Modèle RIWA {idx+1}",
                    'url': f"/Cards/{file}",
                    'width': w,
                    'height': h
                })
    return jsonify({'success': True, 'templates': templates})

@app.route('/api/export', methods=['POST'])
def export_invitation():
    """Render high-resolution invitation image or PDF server-side using Pillow."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Payload JSON manquant'}), 400

    filename = data.get('filename')
    export_format = data.get('format', 'png').lower()
    layers = data.get('layers', [])
    preview_width = float(data.get('previewWidth', 800))
    preview_height = float(data.get('previewHeight', 1200))

    card_path = os.path.join(CARDS_DIR, filename)
    if not os.path.exists(card_path):
        return jsonify({'error': f"Fichier {filename} non trouvé"}), 404

    try:
        base_img = Image.open(card_path).convert('RGBA')
        orig_w, orig_h = base_img.size
        
        scale_x = orig_w / preview_width
        scale_y = orig_h / preview_height

        txt_layer = Image.new('RGBA', base_img.size, (255, 255, 255, 0))
        draw = ImageDraw.Draw(txt_layer)

        for layer in layers:
            content = str(layer.get('text', '')).strip()
            if not content:
                continue

            percent_x = float(layer.get('pctX', 50))
            percent_y = float(layer.get('pctY', 50))
            
            x = (percent_x / 100.0) * orig_w
            y = (percent_y / 100.0) * orig_h

            font_size = max(14, int(float(layer.get('fontSize', 24)) * scale_y))
            font_family = layer.get('fontFamily', 'Playfair Display')
            color_hex = layer.get('color', '#d4af37')
            align = layer.get('align', 'center')

            try:
                if color_hex.startswith('#'):
                    rgb_color = ImageColor.getrgb(color_hex)
                else:
                    rgb_color = (212, 175, 55)
            except Exception:
                rgb_color = (212, 175, 55)
                
            font = get_font(font_family, font_size)
            lines = content.split('\n')

            line_dims = []
            for line in lines:
                bbox = draw.textbbox((0, 0), line, font=font)
                lw = bbox[2] - bbox[0]
                lh = bbox[3] - bbox[1]
                line_dims.append((lw, lh))

            cur_y = y
            for line, (lw, lh) in zip(lines, line_dims):
                cur_x = x
                if align == 'center':
                    cur_x = x - (lw / 2.0)
                elif align == 'right':
                    cur_x = x - lw

                draw.text((cur_x, cur_y), line, font=font, fill=rgb_color + (255,))
                cur_y += lh * 1.3

        composite = Image.alpha_composite(base_img, txt_layer).convert('RGB')

        buf = io.BytesIO()
        if export_format == 'pdf':
            composite.save(buf, format='PDF', resolution=300.0)
            mime_type = 'application/pdf'
            out_filename = f"RIWA_Invitation_{date_slug(filename)}.pdf"
        else:
            composite.save(buf, format='PNG', quality=98)
            mime_type = 'image/png'
            out_filename = f"RIWA_Invitation_{date_slug(filename)}.png"

        buf.seek(0)
        return send_file(buf, mimetype=mime_type, as_attachment=True, download_name=out_filename)

    except Exception as e:
        print("Export error:", e)
        return jsonify({'error': str(e)}), 500

def date_slug(filename):
    return re.sub(r'[^a-zA-Z0-9]', '_', filename.split('.')[0])

@app.route('/api/save-project', methods=['POST'])
def save_project():
    data = request.get_json()
    if not data or 'title' not in data:
        return jsonify({'error': 'Titre requis'}), 400
    
    title_slug = re.sub(r'[^a-zA-Z0-9_-]', '_', data['title'])
    file_path = os.path.join(SAVED_DIR, f"{title_slug}.json")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        
    return jsonify({'success': True, 'message': 'Projet sauvegardé avec succès'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Démarrage du serveur RIWA Invitations sur http://0.0.0.0:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)
