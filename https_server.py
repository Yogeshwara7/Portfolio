import http.server
import ssl
import socketserver
import os
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from datetime import datetime, timedelta

# Create certificates directory if it doesn't exist
if not os.path.exists('certificates'):
    os.makedirs('certificates')

# Generate self-signed certificate if it doesn't exist
if not os.path.exists('certificates/cert.pem'):
    print("Generating self-signed certificate...")
    
    # Generate private key
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )
    
    # Create certificate
    subject = issuer = x509.Name([
        x509.NameAttribute(NameOID.COUNTRY_NAME, "US"),
        x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, "State"),
        x509.NameAttribute(NameOID.LOCALITY_NAME, "City"),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, "Organization"),
        x509.NameAttribute(NameOID.COMMON_NAME, "localhost"),
    ])
    
    cert = x509.CertificateBuilder().subject_name(
        subject
    ).issuer_name(
        issuer
    ).public_key(
        private_key.public_key()
    ).serial_number(
        x509.random_serial_number()
    ).not_valid_before(
        datetime.utcnow()
    ).not_valid_after(
        datetime.utcnow() + timedelta(days=3650)
    ).add_extension(
        x509.SubjectAlternativeName([x509.DNSName("localhost")]),
        critical=False,
    ).sign(private_key, hashes.SHA256())
    
    # Save private key
    with open("certificates/key.pem", "wb") as f:
        f.write(private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        ))
    
    # Save certificate
    with open("certificates/cert.pem", "wb") as f:
        f.write(cert.public_bytes(serialization.Encoding.PEM))
    
    print("Certificate generated successfully!")

# Set up HTTPS server
PORT = 8080  # Changed from 3000 to 8080 for LAN access
Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:  # Changed from "" to "0.0.0.0"
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain("certificates/cert.pem", "certificates/key.pem")
    httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
    
    print(f"Serving at https://localhost:{PORT}")
    print(f"Network access: https://[YOUR_IP]:{PORT}")
    print("Note: You may see a security warning in your browser - this is normal for self-signed certificates")
    print("Click 'Advanced' -> 'Proceed to localhost' to continue")
    print("✅ Using port 8080 - MetaMask should connect more reliably!")
    print("📱 For mobile access, use your computer's IP address instead of localhost")
    httpd.serve_forever() 