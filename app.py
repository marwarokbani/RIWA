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

os.makedirs(SAVED_DIR, exist_ok=True)

def get_font(font_name, size):
    """Fallback font loader using system TrueType fonts."""
    clean_name = font_name.split(',')[0].strip().replace("'", "").replace('"', "")
    system_fonts = [
        "georgia.ttf", "arial.ttf", "times.ttf", "calibri.ttf", "verdana.ttf"
    ]
    for sf in system_fonts:
        try:
            return ImageFont.truetype(sf, size=size)
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
    print("Démarrage du serveur RIWA Invitations (Accès Direct Sans Connexion) sur http://127.0.0.1:5000")
    app.run(host='127.0.0.1', port=5000, debug=True)
