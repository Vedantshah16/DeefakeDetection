import sqlite3
import os
import logging
from datetime import datetime

DB_NAME = "detections.db"
logger = logging.getLogger(__name__)

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize the database with the detections table."""
    conn = get_db_connection()
    try:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS detections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_name TEXT NOT NULL,
                media_type TEXT NOT NULL,
                source TEXT DEFAULT 'web',
                result_label TEXT NOT NULL,
                confidence REAL NOT NULL,
                confidence_band TEXT,
                synthetic_likelihood REAL,
                human_likelihood REAL,
                frames_analyzed INTEGER,
                faces_detected INTEGER,
                audio_duration REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create Users Table
        conn.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        
        # Migration: Add new columns if they don't exist
        try:
            conn.execute("ALTER TABLE detections ADD COLUMN user_id INTEGER REFERENCES users(id)")
            logger.info("Added user_id column to detections")
        except sqlite3.OperationalError:
            pass # Column likely exists
            
        try:
            conn.execute("ALTER TABLE detections ADD COLUMN is_hidden BOOLEAN DEFAULT 0")
            logger.info("Added is_hidden column to detections")
        except sqlite3.OperationalError:
            pass # Column likely exists

        # Phase 2: Firebase auth migration — add columns to users table
        try:
            conn.execute("ALTER TABLE users ADD COLUMN firebase_uid TEXT")
            conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_firebase_uid ON users(firebase_uid)")
            logger.info("Added firebase_uid column to users")
        except sqlite3.OperationalError:
            pass  # Column likely exists

        try:
            conn.execute("ALTER TABLE users ADD COLUMN email TEXT")
            logger.info("Added email column to users")
        except sqlite3.OperationalError:
            pass

        try:
            conn.execute("ALTER TABLE users ADD COLUMN phone TEXT")
            logger.info("Added phone column to users")
        except sqlite3.OperationalError:
            pass

        try:
            conn.execute("ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'password'")
            logger.info("Added auth_provider column to users")
        except sqlite3.OperationalError:
            pass

        # Phase 3: Display name & Photo URL
        try:
            conn.execute("ALTER TABLE users ADD COLUMN display_name TEXT")
            logger.info("Added display_name column to users")
        except sqlite3.OperationalError:
            pass

        try:
            conn.execute("ALTER TABLE users ADD COLUMN photo_url TEXT")
            logger.info("Added photo_url column to users")
        except sqlite3.OperationalError:
            pass

        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
    finally:
        conn.close()

def insert_detection(data: dict):
    """
    Insert a new detection record.
    Expected keys in data:
    - file_name
    - media_type ('image', 'video', 'audio', 'live')
    - result_label
    - confidence
    - confidence_band
    - synthetic_likelihood
    - human_likelihood
    - frames_analyzed (optional)
    - faces_detected (optional)
    - audio_duration (optional)
    """
    conn = get_db_connection()
    try:
        # source defaults to 'web' for now
        source = data.get('source', 'web')
        
        conn.execute('''
             INSERT INTO detections (
                file_name, media_type, source, result_label, confidence,
                confidence_band, synthetic_likelihood, human_likelihood,
                frames_analyzed, faces_detected, audio_duration, user_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['file_name'],
            data['media_type'],
            source,
            data['result_label'],
            data['confidence'],
            data.get('confidence_band'),
            data.get('synthetic_likelihood'),
            data.get('human_likelihood'),
            data.get('frames_analyzed'),
            data.get('faces_detected'),
            data.get('audio_duration'),
            data.get('user_id')
        ))
        conn.commit()
        logger.info(f"Saved detection result for {data['file_name']}")
    except Exception as e:
        logger.error(f"Error inserting detection: {e}")
    finally:
        conn.close()

def get_summary_stats(user_id=None):
    """
    Get aggregated statistics for the dashboard, filtered by user.
    """
    conn = get_db_connection()
    try:
        # Base filter: always exclude hidden
        where_parts = ["is_hidden = 0"]
        params = []
        
        if user_id is not None:
            where_parts.append("user_id = ?")
            params.append(user_id)
            
        where_clause = " WHERE " + " AND ".join(where_parts)

        # Helper for counting
        def count_where(extra_cond=None):
            query = f"SELECT COUNT(*) FROM detections {where_clause}"
            if extra_cond:
                query += f" AND {extra_cond}"
            return conn.execute(query, params).fetchone()[0]

        total_scans = count_where()
        image_scans = count_where("media_type = 'image'")
        video_scans = count_where("media_type = 'video'")
        audio_scans = count_where("media_type = 'audio'")
        
        real_count = count_where("result_label = 'REAL'")
        fake_count = count_where("result_label = 'FAKE'")
        inconclusive_count = count_where("result_label = 'INCONCLUSIVE'")

        # Average Confidence
        avg_query = f"SELECT AVG(confidence) FROM detections {where_clause}"
        avg_confidence = conn.execute(avg_query, params).fetchone()[0]
        if avg_confidence is None:
            avg_confidence = 0.0

        return {
            "total_scans": total_scans,
            "image_scans": image_scans,
            "video_scans": video_scans,
            "audio_scans": audio_scans,
            "real_count": real_count,
            "fake_count": fake_count,
            "inconclusive_count": inconclusive_count,
            "avg_confidence": round(avg_confidence, 2)
        }
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        return {}
    finally:
        conn.close()

def get_recent_detections(limit=50, media_type=None, user_id=None):
    """
    Get recent detections, optionally filtered by media_type and user_id.
    Excludes hidden records.
    """
    conn = get_db_connection()
    try:
        query = "SELECT * FROM detections WHERE is_hidden = 0"
        params = []
        
        if user_id is not None:
             query += " AND user_id = ?"
             params.append(user_id)
        
        if media_type and media_type != 'all':
            query += " AND media_type = ?"
            params.append(media_type)
            
        query += " ORDER BY created_at DESC LIMIT ?"
        params.append(limit)
        
        cursor = conn.execute(query, params)
        rows = cursor.fetchall()
        
        # Convert to list of dicts
        results = []
        for row in rows:
            results.append(dict(row))
        return results
    except Exception as e:
        logger.error(f"Error getting history: {e}")
        return []
    finally:
        conn.close()

def soft_delete_user_history(user_id):
    """Soft delete all history for a user."""
    conn = get_db_connection()
    try:
        conn.execute("UPDATE detections SET is_hidden = 1 WHERE user_id = ?", (user_id,))
        conn.commit()
        return True
    except Exception as e:
        logger.error(f"Error clearing history: {e}")
        return False
    finally:
        conn.close()

def create_user(username, password_hash):
    """Create a new user."""
    conn = get_db_connection()
    try:
        conn.execute(
            "INSERT INTO users (username, password_hash) VALUES (?, ?)",
            (username, password_hash)
        )
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False # Username exists
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        return False
    finally:
        conn.close()

def get_user_by_username(username):
    """Get user by username."""
    conn = get_db_connection()
    try:
        cursor = conn.execute("SELECT * FROM users WHERE username = ?", (username,))
        row = cursor.fetchone()
        if row:
            return dict(row)
        return None
    except Exception as e:
        logger.error(f"Error getting user: {e}")
        return None
    finally:
        conn.close()

def get_user_by_firebase_uid(firebase_uid):
    """Get user by Firebase UID."""
    conn = get_db_connection()
    try:
        cursor = conn.execute("SELECT * FROM users WHERE firebase_uid = ?", (firebase_uid,))
        row = cursor.fetchone()
        if row:
            return dict(row)
        return None
    except Exception as e:
        logger.error(f"Error getting user by firebase_uid: {e}")
        return None
    finally:
        conn.close()

def create_firebase_user(username, firebase_uid, email, phone, auth_provider, display_name=None, photo_url=None):
    """
    Create a new user that authenticated via Firebase (Google or Phone).
    """
    conn = get_db_connection()
    try:
        unusable_hash = "!firebase!"
        conn.execute(
            """
            INSERT INTO users (username, password_hash, firebase_uid, email, phone, auth_provider, display_name, photo_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (username, unusable_hash, firebase_uid, email, phone, auth_provider, display_name, photo_url)
        )
        conn.commit()
        return True
    except sqlite3.IntegrityError as e:
        logger.error(f"IntegrityError creating Firebase user: {e}")
        return False
    except Exception as e:
        logger.error(f"Error creating Firebase user: {e}")
        return False
    finally:
        conn.close()

def update_firebase_user_profile(firebase_uid, display_name, photo_url):
    """
    Update display_name and photo_url for an existing Firebase user.
    """
    conn = get_db_connection()
    try:
        updates = []
        params = []
        if display_name is not None:
            updates.append("display_name = ?")
            params.append(display_name)
        if photo_url is not None:
            updates.append("photo_url = ?")
            params.append(photo_url)

        if not updates:
            return True

        params.append(firebase_uid)
        conn.execute(
            f"UPDATE users SET {', '.join(updates)} WHERE firebase_uid = ?",
            params
        )
        conn.commit()
        return True
    except Exception as e:
        logger.error(f"Error updating Firebase user profile: {e}")
        return False
    finally:
        conn.close()
