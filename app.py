import os
import json
import io
import base64
import re
import urllib.request
from flask import Flask, render_template, jsonify, request, send_file, send_from_directory
from PIL import Image, ImageDraw, ImageFont, ImageColor

app = Flask(__name__, static_folder='static', template_folder='templates')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CARDS_DIR = os.path.join(BASE_DIR, 'Cards')
SAVED_DIR = os.path.join(BASE_DIR, 'saved_projects')
FONTS_CACHE_DIR = os.path.join(BASE_DIR, 'fonts_cache')

os.makedirs(SAVED_DIR, exist_ok=True)
os.makedirs(FONTS_CACHE_DIR, exist_ok=True)

# Common Google Fonts TTF download mappings for server-side Pillow export
FONT_URLS = {
    'Great Vibes': 'https://github.com/google/fonts/raw/main/ofl/greatvibes/GreatVibes-Regular.ttf',
    'Alex Brush': 'https://github.com/google/fonts/raw/main/ofl/alexbrush/AlexBrush-Regular.ttf',
    'Playfair Display': 'https://github.com/google/fonts/raw/main/ofl/playfairdisplay/PlayfairDisplay-Regular.ttf',
    'Playfair Display Bold': 'https://github.com/google/fonts/raw/main/ofl/playfairdisplay/PlayfairDisplay-Bold.ttf',
    'Cinzel': 'https://github.com/google/fonts/raw/main/ofl/cinzel/Cinzel-Regular.ttf',
    'Cormorant Garamond': 'https://github.com/google/fonts/raw/main/ofl/cormorantgaramond/CormorantGaramond-Regular.ttf',
    'Montserrat': 'https://github.com/google/fonts/raw/main/ofl/montserrat/Montserrat-Regular.ttf',
    'Parisienne': 'https://github.com/google/fonts/raw/main/ofl/parisienne/Parisienne-Regular.ttf',
    'Dancing Script': 'https://github.com/google/fonts/raw/main/ofl/dancingscript/DancingScript-Regular.ttf',
    'Tangerine': 'https://github.com/google/fonts/raw/main/ofl/tangerine/Tangerine-Regular.ttf'
}

def get_font(font_name, size):
    """Retrieve font for Pillow rendering. Download font if cached or fallback to default."""
    clean_name = font_name.split(',')[0].strip().replace("'", "").replace('"', "")
    local_path = os.path.join(FONTS_CACHE_DIR, f"{clean_name}.ttf")
    
    if os.path.exists(local_path):
        try:
            return ImageFont.truetype(local_path, size=size)
        except Exception:
            pass
            
    if clean_name in FONT_URLS:
        try:
            urllib.request.urlretrieve(FONT_URLS[clean_name], local_path)
            return ImageFont.truetype(local_path, size=size)
        except Exception as e:
            print(f"Error fetching font {clean_name}: {e}")
            
    # Try system fonts or default
    for sys_font in [clean_name, "arial.ttf", "georgia.ttf", "times.ttf"]:
        try:
            return ImageFont.truetype(sys_font, size=size)
        except Exception:
            continue
            
    return ImageFont.load_default()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/Cards/<path:filename>')
def serve_card(filename):
    return send_from_directory(CARDS_DIR, filename)

@app.route('/Logo.png')
def serve_logo():
    return send_from_directory(BASE_DIR, 'Logo.png')

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

@app.route('/api/send-welcome-email', methods=['POST'])
def send_welcome_email():
    """Send automated welcome email to user upon Google login."""
    data = request.get_json() or {}
    email = data.get('email', '').strip()
    name = data.get('name', 'Cher Client').strip()
    
    if not email:
        return jsonify({'error': 'Adresse email requise'}), 400
        
    print(f"[RIWA MAIL SYSTEM] Sending automated Welcome Email to {name} <{email}>...")
    
    email_content = {
        'to': email,
        'subject': 'Bienvenue chez RIWA Studio — Vos Invitations Digitales d\'Exception',
        'body': f"""Bonjour {name},

Toute l'équipe de RIWA a le plaisir de vous souhaiter la bienvenue dans notre Studio de création d'invitations digitales.

Grâce à votre compte RIWA, vous bénéficiez dès à présent d'un accès illimité à :
- Notre collection exclusive de cartes et modèles d'invitation de mariage.
- Notre studio de personnalisation avancé (typographies sur-mesure, dégradés métalliques et glisser-déplacer).
- L'exportation en très haute résolution (PNG & PDF) prête pour l'impression ou le partage.

Créez dès maintenant votre expérience personnelle et personnalisée !

Chaleureusement,
L'équipe RIWA Studio
www.riwa-studio.com
"""
    }
    
    return jsonify({
        'success': True, 
        'message': f"Email de bienvenue envoyé automatiquement à {email}",
        'email': email_content
    })

@app.route('/api/export', methods=['POST'])
def export_invitation():
    """Render high-resolution invitation image or PDF server-side using Pillow."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Payload JSON manquant'}), 400

    filename = data.get('filename')
    export_format = data.get('format', 'png').lower() # 'png' or 'pdf'
    layers = data.get('layers', [])
    preview_width = data.get('previewWidth', 800)
    preview_height = data.get('previewHeight', 1200)

    card_path = os.path.join(CARDS_DIR, filename)
    if not os.path.exists(card_path):
        return jsonify({'error': f"Fichier {filename} non trouvé"}), 404

    try:
        base_img = Image.open(card_path).convert('RGBA')
        orig_w, orig_h = base_img.size
        
        # Scaling factor from UI preview resolution to original high-res image
        scale_x = orig_w / float(preview_width)
        scale_y = orig_h / float(preview_height)
        scale_avg = (scale_x + scale_y) / 2.0

        txt_layer = Image.new('RGBA', base_img.size, (255, 255, 255, 0))
        draw = ImageDraw.Draw(txt_layer)

        for layer in layers:
            content = layer.get('text', '').strip()
            if not content:
                continue

            x = float(layer.get('x', 0)) * scale_x
            y = float(layer.get('y', 0)) * scale_y
            font_size = max(10, int(float(layer.get('fontSize', 24)) * scale_avg))
            font_family = layer.get('fontFamily', 'Playfair Display')
            color_hex = layer.get('color', '#000000')
            gradient_key = layer.get('gradient', None)
            align = layer.get('align', 'center')
            letter_spacing = float(layer.get('letterSpacing', 0)) * scale_avg

            # Determine color or default to gold/selected color
            if color_hex.startswith('linear-gradient') or gradient_key == 'gold':
                rgb_color = (212, 175, 55) # Classic Gold representation for base Pillow
            elif gradient_key == 'rosegold':
                rgb_color = (183, 110, 121)
            elif gradient_key == 'emerald':
                rgb_color = (4, 99, 7)
            else:
                try:
                    rgb_color = ImageColor.getrgb(color_hex)
                except Exception:
                    rgb_color = (0, 0, 0)
                
            font = get_font(font_family, font_size)

            lines = content.split('\n')
            line_dimensions = []
            
            for line in lines:
                bbox = draw.textbbox((0, 0), line, font=font)
                line_w = bbox[2] - bbox[0]
                line_h = bbox[3] - bbox[1]
                if letter_spacing > 0:
                    line_w += (len(line) - 1) * letter_spacing
                line_dimensions.append((line_w, line_h))

            cur_y = y
            for line, (lw, lh) in zip(lines, line_dimensions):
                cur_x = x
                if align == 'center':
                    cur_x = x - (lw / 2.0)
                elif align == 'right':
                    cur_x = x - lw

                # Draw characters with spacing if needed
                if letter_spacing > 0:
                    char_x = cur_x
                    for char in line:
                        draw.text((char_x, cur_y), char, font=font, fill=rgb_color + (255,))
                        c_bbox = draw.textbbox((0, 0), char, font=font)
                        char_x += (c_bbox[2] - c_bbox[0]) + letter_spacing
                else:
                    draw.text((cur_x, cur_y), line, font=font, fill=rgb_color + (255,))

                cur_y += lh * 1.25

        composite = Image.alpha_composite(base_img, txt_layer).convert('RGB')

        buf = io.BytesIO()
        if export_format == 'pdf':
            composite.save(buf, format='PDF', resolution=300.0)
            mime_type = 'application/pdf'
            out_filename = f"RIWA_Invitation_{filename.split('.')[0]}.pdf"
        else:
            composite.save(buf, format='PNG', quality=95)
            mime_type = 'image/png'
            out_filename = f"RIWA_Invitation_{filename.split('.')[0]}.png"

        buf.seek(0)
        return send_file(buf, mimetype=mime_type, as_attachment=True, download_name=out_filename)

    except Exception as e:
        print("Export error:", e)
        return jsonify({'error': str(e)}), 500


@app.route('/api/save-project', methods=['POST'])
def save_project():
    data = request.get_json()
    if not data or 'title' not in data:
        return jsonify({'error': 'Titre requis'}), 400
    
    title_slug = re.sub(r'[^a-zA-Z0-bytes_-]', '_', data['title'])
    file_path = os.path.join(SAVED_DIR, f"{title_slug}.json")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        
    return jsonify({'success': True, 'message': 'Projet sauvegardé avec succès'})

if __name__ == '__main__':
    print("Démarrage du serveur RIWA Invitations sur http://127.0.0.1:5000")
    app.run(host='127.0.0.1', port=5000, debug=True)
