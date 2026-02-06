#!/usr/bin/env python3
import http.server
import socketserver
import gzip
import io
from pathlib import Path

class CompressedHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS
        self.send_header('Access-Control-Allow-Origin', '*')
        # Enable compression
        self.send_header('Content-Encoding', 'gzip')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    
    def compress_content(self, content):
        out = io.BytesIO()
        with gzip.GzipFile(fileobj=out, mode='w') as f:
            f.write(content)
        return out.getvalue()
    
    def do_GET(self):
        # Serve compressed files
        try:
            filepath = Path('.' + self.path)
            if filepath.is_file():
                with open(filepath, 'rb') as f:
                    content = f.read()
                
                # Compress
                compressed = self.compress_content(content)
                
                self.send_response(200)
                self.send_header('Content-Type', self.guess_type(filepath))
                self.send_header('Content-Length', str(len(compressed)))
                self.end_headers()
                self.wfile.write(compressed)
            else:
                super().do_GET()
        except Exception as e:
            self.send_error(404, f"Error: {str(e)}")

PORT = 8080
with socketserver.TCPServer(("", PORT), CompressedHTTPRequestHandler) as httpd:
    print(f"🚀 FAST server running at http://localhost:{PORT}/")
    print(f"   Also at: http://10.82.61.107:{PORT}/")
    httpd.serve_forever()
