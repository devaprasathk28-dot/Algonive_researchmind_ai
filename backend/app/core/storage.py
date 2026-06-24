import os

STORAGE_BASE = "storage"
UPLOADS_DIR = os.path.join(STORAGE_BASE, "uploads")
REPORTS_DIR = os.path.join(STORAGE_BASE, "reports")
GRAPHS_DIR = os.path.join(STORAGE_BASE, "graphs")
EXPORTS_DIR = os.path.join(STORAGE_BASE, "exports")
AVATARS_DIR = os.path.join(STORAGE_BASE, "avatars")

def init_storage():
    for d in [STORAGE_BASE, UPLOADS_DIR, REPORTS_DIR, GRAPHS_DIR, EXPORTS_DIR, AVATARS_DIR]:
        os.makedirs(d, exist_ok=True)

# Initialize on import
init_storage()
