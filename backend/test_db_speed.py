
import time
import os
import sys

# Add backend to path to import database
sys.path.append(os.path.join(os.getcwd(), 'pinnacle6', 'backend'))

try:
    from pinnacle6.backend import database
    
    # Ensure we are in the right dir for DB initialization if needed?
    # database.py uses "detections.db" relative path.
    # If we run from project root, "detections.db" will be looked for in project root?
    # No, database.py defines DB_NAME = "detections.db".
    # And connects to it.
    # If we run from root, it creates "detections.db" in root.
    # But the real DB is in backend/.
    # So we need to ensure we point to the right DB or run from backend dir.
    pass
except ImportError:
    # Try importing assuming we are in backend dir
    import database

def test():
    print("Testing DB speed...")
    start = time.time()
    user = database.get_user_by_username("guest")
    end = time.time()
    print(f"Get User took {end - start:.4f}s")
    print(f"User found: {user is not None}")

if __name__ == "__main__":
    test()
